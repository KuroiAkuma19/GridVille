import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import models from './models.js';
const baseUrl = import.meta.env.BASE_URL;
export class AssetManager {
  textureLoader = new THREE.TextureLoader();
  modelLoader = new GLTFLoader();
  textures = {
    'base': this.#loadTexture(`${baseUrl}textures/base.png`),
    'specular': this.#loadTexture(`${baseUrl}textures/specular.png`),
    'grid': this.#loadTexture(`${baseUrl}textures/grid.png`),
  };
  statusIcons = {
    'no-power': this.#loadTexture(`${baseUrl}statusIcons/no-power.png`, true),
    'no-road-access': this.#loadTexture(`${baseUrl}statusIcons/no-road-access.png`, true)
  }
  models = {};
  sprites = {};
  constructor(onLoad) {
    this.modelCount = Object.keys(models).length;
    this.loadedModelCount = 0;
    for (const [name, meta] of Object.entries(models)) {
      this.#loadModel(name, meta);
    }
    this.onLoad = onLoad;
  }
  getModel(name, simObject, transparent = false) {
    const mesh = this.models[name].clone();
    mesh.traverse((obj) => {
      obj.userData = simObject;
      if(obj.material && transparent) {
        obj.material = obj.material.clone();
        obj.material.transparent = true;
        obj.material.opacity = 0.5;
      }
    });
    return mesh;
  }
  #loadTexture(url, flipY = false) {
    const texture = this.textureLoader.load(url)
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = flipY;
    return texture;
  }
  #loadModel(name, {filename, scale = 1, rotation = 0, receiveShadow = true, castShadow = true}) {
    this.modelLoader.load(`${baseUrl}models/${filename}`,
      (glb) => {
        let mesh = glb.scene;
        mesh.name = filename;
        mesh.traverse((obj) => {
          if (obj.isMesh && obj.material) {
            const hasUVs = obj.geometry && obj.geometry.attributes && obj.geometry.attributes.uv !== undefined;
            if (hasUVs) {
               obj.material = new THREE.MeshLambertMaterial({
                 map: this.textures.base,
                 specularMap: this.textures.specular
               });
            } else {
               obj.material = new THREE.MeshLambertMaterial({
                 color: obj.material.color,
                 vertexColors: obj.material.vertexColors || (obj.geometry && obj.geometry.attributes.color !== undefined)
               });
            }
            obj.receiveShadow = receiveShadow;
            obj.castShadow = castShadow;
          }
        });
        mesh.rotation.set(0, THREE.MathUtils.degToRad(rotation), 0);
        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.z);
        if (maxDim > 0) {
          const isTile = filename.startsWith('tile-') || filename === 'grass.glb' || filename.startsWith('power-line') || filename.startsWith('road-');
          const fitScale = (isTile ? 1.0 : 0.85) / maxDim;
          mesh.scale.set(fitScale, fitScale, fitScale);
        }
        this.models[name] = mesh;
        this.loadedModelCount++;
        if (this.loadedModelCount == this.modelCount) {
          this.onLoad()
        }
      },
      (xhr) => {
      },
      (error) => {
        console.error(error);
      });
  }
}