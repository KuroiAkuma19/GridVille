import * as THREE from 'three';
import { SimModule } from './buildings/modules/simModule';
const SELECTED_COLOR = 0xaaaa55;
const HIGHLIGHTED_COLOR = 0x555555;
export class SimObject extends THREE.Object3D {
  #mesh = null;
  #worldPos = new THREE.Vector3();
  constructor(x = 0, y = 0) {
    super();
    this.name = 'SimObject';
    this.position.x = x;
    this.position.z = y;
  }
  get x() {
    this.getWorldPosition(this.#worldPos);
    return Math.floor(this.#worldPos.x);
  }
  get y() {
    this.getWorldPosition(this.#worldPos);
    return Math.floor(this.#worldPos.z);
  }
  get mesh() {
    return this.#mesh;
  } 
  setMesh(value) {
    if (this.#mesh) {
      this.dispose();
      this.remove(this.#mesh);
    }
    this.#mesh = value;
    if (this.#mesh) {
      this.add(this.#mesh);
    }
  }
  simulate(city) {
  }
  setSelected(value) {
    if (value) {
      this.#setMeshEmission(SELECTED_COLOR);
    } else {
      this.#setMeshEmission(0);
    }
  }
  setFocused(value) {
    if (value) {
      this.#setMeshEmission(HIGHLIGHTED_COLOR);
    } else {
      this.#setMeshEmission(0);
    }
  }
  #setMeshEmission(color) {
    if (!this.mesh) return;
    this.mesh.traverse((obj) => {
      if (obj.material) {
        /** 
         * Important: Materials are shared across all buildings to maximize performance.
         * We must clone the material ONLY for the highlighted object, otherwise the entire city glows.
         */
        if (!obj.userData.originalMaterial) {
          obj.userData.originalMaterial = obj.material;
        }
        
        if (color === 0) {
          obj.material = obj.userData.originalMaterial;
        } else {
          if (obj.material === obj.userData.originalMaterial) {
            obj.material = obj.userData.originalMaterial.clone();
          }
          if (obj.material.emissive) {
            obj.material.emissive.setHex(color);
          }
        }
      }
    });
  }
  dispose() {
    this.#mesh.traverse((obj) => {
      if (obj.material) {
        obj.material?.dispose();
      }
    })
  }
}