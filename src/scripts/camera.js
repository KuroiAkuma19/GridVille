import * as THREE from 'three';
const DEG2RAD = Math.PI / 180.0;
const RIGHT_MOUSE_BUTTON = 2;
const CAMERA_SIZE = 5;
const MIN_CAMERA_RADIUS = 0.1;
const MAX_CAMERA_RADIUS = 5;
const MIN_CAMERA_ELEVATION = 45;
const MAX_CAMERA_ELEVATION = 45;
const AZIMUTH_SENSITIVITY = 0.2;
const ELEVATION_SENSITIVITY = 0.2;
const ZOOM_SENSITIVITY = 0.002;
const PAN_SENSITIVITY = -0.01;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
export class CameraManager {
  constructor() {
    const aspect = window.ui.gameWindow.clientWidth / window.ui.gameWindow.clientHeight;
    this.camera = new THREE.OrthographicCamera(
      (CAMERA_SIZE * aspect) / -2,
      (CAMERA_SIZE * aspect) / 2,
      CAMERA_SIZE / 2,
      CAMERA_SIZE / -2, 1, 1000);
    this.camera.layers.enable(1);
    this.cameraOrigin = new THREE.Vector3(8, 0, 8);
    this.cameraRadius = 0.5;
    this.cameraAzimuth = 225;
    this.cameraElevation = 45;
    this.updateCameraPosition();
    this.activePointers = new Map();
    window.ui.gameWindow.addEventListener('wheel', this.onMouseScroll.bind(this), false);
    window.ui.gameWindow.addEventListener('pointerdown', this.onPointerDown.bind(this), false);
    window.ui.gameWindow.addEventListener('pointerup', this.onPointerUp.bind(this), false);
    window.ui.gameWindow.addEventListener('pointercancel', this.onPointerUp.bind(this), false);
    window.ui.gameWindow.addEventListener('pointermove', this.onPointerMove.bind(this), false);
  }
  updateCameraPosition() {
    this.camera.zoom = this.cameraRadius;
    this.camera.position.x = 100 * Math.sin(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.y = 100 * Math.sin(this.cameraElevation * DEG2RAD);
    this.camera.position.z = 100 * Math.cos(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.add(this.cameraOrigin);
    this.camera.lookAt(this.cameraOrigin);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }
  onPointerDown(event) {
    window.ui.gameWindow.setPointerCapture(event.pointerId);
    this.activePointers.set(event.pointerId, event);
    if (event.pointerType === 'touch' && this.activePointers.size === 1) {
       this.lastTouchCenter = { x: event.clientX, y: event.clientY };
    }
  }
  onPointerUp(event) {
    window.ui.gameWindow.releasePointerCapture(event.pointerId);
    this.activePointers.delete(event.pointerId);
    this.lastTouchDistance = null;
    if (this.activePointers.size === 1) {
       const remaining = Array.from(this.activePointers.values())[0];
       this.lastTouchCenter = { x: remaining.clientX, y: remaining.clientY };
    } else {
       this.lastTouchCenter = null;
    }
  }
  onPointerMove(event) {
    if (this.activePointers.has(event.pointerId)) {
      this.activePointers.set(event.pointerId, event);
    }
    
    if (this.activePointers.size === 2) {
      const pointers = Array.from(this.activePointers.values());
      const p1 = pointers[0];
      const p2 = pointers[1];
      
      const dx = p1.clientX - p2.clientX;
      const dy = p1.clientY - p2.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (this.lastTouchDistance !== null && this.lastTouchDistance !== undefined) {
         // positive delta means fingers spread apart (should zoom in / magnify)
         const deltaZoom = distance - this.lastTouchDistance;
         this.cameraRadius *= 1 + (deltaZoom * ZOOM_SENSITIVITY);
         this.cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, this.cameraRadius));
      }
      
      this.lastTouchDistance = distance;
      this.updateCameraPosition();
      return;
    }
    
    // 1-finger pan
    if (this.activePointers.size === 1 && event.pointerType === 'touch') {
      if (this.lastTouchCenter) {
         const deltaX = event.clientX - this.lastTouchCenter.x;
         const deltaY = event.clientY - this.lastTouchCenter.y;
         
         const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
         const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
         
         this.cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * deltaY));
         this.cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * deltaX));
      }
      
      this.lastTouchCenter = { x: event.clientX, y: event.clientY };
      this.updateCameraPosition();
      return;
    }

    // Standard mouse drag rotation and panning
    if (event.buttons & RIGHT_MOUSE_BUTTON && !event.ctrlKey) {
      this.cameraAzimuth += -(event.movementX * AZIMUTH_SENSITIVITY);
      this.cameraElevation += (event.movementY * ELEVATION_SENSITIVITY);
      this.cameraElevation = Math.min(MAX_CAMERA_ELEVATION, Math.max(MIN_CAMERA_ELEVATION, this.cameraElevation));
    }
    if (event.buttons & RIGHT_MOUSE_BUTTON && event.ctrlKey) {
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
      const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
      this.cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * event.movementY));
      this.cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * event.movementX));
    }
    this.updateCameraPosition();
  }
  onMouseScroll(event) {
    this.cameraRadius *= 1 - (event.deltaY * ZOOM_SENSITIVITY);
    this.cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, this.cameraRadius));
    this.updateCameraPosition();
  }
  resize() {
    const aspect = window.ui.gameWindow.clientWidth / window.ui.gameWindow.clientHeight;
    this.camera.left = (CAMERA_SIZE * aspect) / -2;
    this.camera.right = (CAMERA_SIZE * aspect) / 2;
    this.camera.updateProjectionMatrix();
  }
}