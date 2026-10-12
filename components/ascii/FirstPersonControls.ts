import * as THREE from "three";
import { HOUSE_ROOMS_3D } from "@/data/house3d";

export interface ControlTelemetry {
  x: number;
  y: number;
  z: number;
  yawDegrees: number;
  currentRoomId: string;
  isLocked: boolean;
}

export class FirstPersonNavigator {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  public enabled = true;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;

  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private euler = new THREE.Euler(0, 0, 0, "YXZ");

  private isLocked = false;
  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  private onTelemetryUpdate?: (telemetry: ControlTelemetry) => void;
  private onInteractPress?: () => void;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private boundPointerLockChange: () => void;

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    callbacks?: {
      onTelemetry?: (telemetry: ControlTelemetry) => void;
      onInteract?: () => void;
    }
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.onTelemetryUpdate = callbacks?.onTelemetry;
    this.onInteractPress = callbacks?.onInteract;

    this.euler.setFromQuaternion(this.camera.quaternion);

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundPointerLockChange = this.handlePointerLockChange.bind(this);

    this.attachListeners();
  }

  private attachListeners() {
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
    document.addEventListener("pointerlockchange", this.boundPointerLockChange);
    document.addEventListener("mousemove", this.boundMouseMove);
    this.domElement.addEventListener("mousedown", this.boundMouseDown);
    window.addEventListener("mouseup", this.boundMouseUp);
  }

  public dispose() {
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    document.removeEventListener("pointerlockchange", this.boundPointerLockChange);
    document.removeEventListener("mousemove", this.boundMouseMove);
    this.domElement.removeEventListener("mousedown", this.boundMouseDown);
    window.removeEventListener("mouseup", this.boundMouseUp);
  }

  public requestLock() {
    try {
      this.domElement.requestPointerLock();
    } catch {
      // Fallback to drag-to-look if pointerlock is disallowed
    }
  }

  public exitLock() {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  private handlePointerLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
  }

  private handleMouseDown(e: MouseEvent) {
    if (!this.enabled) return;
    if (!this.isLocked) {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    } else {
      if (e.button === 0 && this.onInteractPress) {
        this.onInteractPress();
      }
    }
  }

  private handleMouseUp() {
    this.isDragging = false;
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.enabled) return;
    let movementX = 0;
    let movementY = 0;

    if (this.isLocked) {
      movementX = e.movementX || 0;
      movementY = e.movementY || 0;
    } else if (this.isDragging) {
      movementX = e.clientX - this.lastMouseX;
      movementY = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    } else {
      return;
    }

    const sensitivity = 0.0024;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * sensitivity;
    this.euler.x -= movementY * sensitivity;

    // Clamp vertical pitch (prevent flipping upside down)
    const maxPitch = Math.PI / 2 - 0.08;
    this.euler.x = Math.max(-maxPitch, Math.min(maxPitch, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.enabled) return;
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLButtonElement
    ) {
      return;
    }
    // Prevent default scroll behavior for game controls
    if (["KeyW", "KeyS", "KeyA", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }

    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = true;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = true;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = true;
        break;
      case "KeyE":
        if (this.onInteractPress) {
          this.onInteractPress();
        }
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLButtonElement
    ) {
      return;
    }
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = false;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = false;
        break;
    }
  }

  /**
   * Collision check: Determines if a given horizontal position (x, z) is inside the house floor plan.
   * Returns true if valid, false if collides with perimeter walls.
   */
  private isPositionWalkable(x: number, z: number): boolean {
    const margin = 0.35;

    // 1. Exterior Forecourt (Z: 0.5 to 15.0)
    if (x >= -5.5 + margin && x <= 5.5 - margin && z >= 0.5 && z <= 15.0 - margin) {
      return true;
    }

    // 2. Main Entrance Threshold & Steps (Crossing Z = 0)
    if (x >= -1.2 && x <= 1.2 && z >= -1.5 && z <= 1.5) {
      return true;
    }

    // 3. Entrance Hall (Z: -20.8 to 0.2, X: -2.55 to 2.55)
    if (x >= -2.55 + margin && x <= 2.55 - margin && z >= -20.8 + margin && z <= 0.2) {
      return true;
    }

    // 4. Living Room Doorway Portal (West wall at X = -2.8, opening Z: -19.5 to -16.5)
    // Generously bridges Entrance Hall (X >= -2.2) and Living Room (X <= -3.0) with no gap
    if (x >= -4.0 && x <= -1.8 && z >= -19.5 + margin && z <= -16.5 - margin) {
      return true;
    }

    // 5. Living Room (X: -17.5 to -2.8, Z: -25.0 to -11.0)
    if (x >= -17.5 + margin && x <= -3.0 && z >= -25.0 + margin && z <= -11.0 - margin) {
      return true;
    }

    return false;
  }

  public detectCurrentRoom(x: number, z: number): string {
    if (z >= 0.5) return "exterior";
    if (x <= -2.8 && z <= -11.0 && z >= -25.0) return "living_room";
    return "entrance_hall";
  }

  public teleportTo(x: number, y: number, z: number, yaw: number) {
    this.camera.position.set(x, y, z);
    this.euler.set(0, yaw, 0, "YXZ");
    this.camera.quaternion.setFromEuler(this.euler);
    this.velocity.set(0, 0, 0);
  }

  public teleportToRoom(roomId: string) {
    const room = HOUSE_ROOMS_3D[roomId];
    if (room) {
      this.teleportTo(room.spawnPoint.x, room.spawnPoint.y, room.spawnPoint.z, room.spawnPoint.yaw);
    }
  }

  public update(delta: number) {
    if (!this.enabled) {
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.velocity.set(0, 0, 0);
    }

    // Damping / friction
    const damping = Math.max(0, 1 - 10.0 * delta);
    this.velocity.x *= damping;
    this.velocity.z *= damping;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    const walkSpeed = 38.0; // units / sec^2 acceleration
    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * walkSpeed * delta;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x += this.direction.x * walkSpeed * delta;
    }

    // Camera forward and right vectors projected onto XZ plane
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.y = 0;
    right.normalize();

    // Calculate displacement vector
    const moveX = (right.x * this.velocity.x - forward.x * this.velocity.z) * delta;
    const moveZ = (right.z * this.velocity.x - forward.z * this.velocity.z) * delta;

    const currentPos = this.camera.position;

    // Test sliding collision: X-axis independently
    const targetX = currentPos.x + moveX;
    if (this.isPositionWalkable(targetX, currentPos.z)) {
      currentPos.x = targetX;
    } else {
      this.velocity.x = 0;
    }

    // Test sliding collision: Z-axis independently
    const targetZ = currentPos.z + moveZ;
    if (this.isPositionWalkable(currentPos.x, targetZ)) {
      currentPos.z = targetZ;
    } else {
      this.velocity.z = 0;
    }

    // Keep camera at eye-level height
    currentPos.y = 1.7;

    // Calculate yaw in degrees (0..360)
    const yawDeg = Math.round(((-this.euler.y * 180) / Math.PI) % 360);
    const normalizedYaw = yawDeg < 0 ? yawDeg + 360 : yawDeg;

    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({
        x: currentPos.x,
        y: currentPos.y,
        z: currentPos.z,
        yawDegrees: normalizedYaw,
        currentRoomId: this.detectCurrentRoom(currentPos.x, currentPos.z),
        isLocked: this.isLocked,
      });
    }
  }
}
