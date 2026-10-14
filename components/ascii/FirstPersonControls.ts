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

  private joystickInput = { x: 0, y: 0 };

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

    // 6. Study Doorway Portal (East wall at X = 2.8, opening Z: -19.5 to -16.5)
    // Generously bridges Entrance Hall (X <= 2.55) and Study (X >= 2.8) with no gap
    if (x >= 1.8 && x <= 4.0 && z >= -19.5 + margin && z <= -16.5 - margin) {
      return true;
    }

    // 7. Study / Home Office (X: 2.8 to 11.8, Z: -23.0 to -13.0)
    if (x >= 2.8 + margin && x <= 11.8 - margin && z >= -23.0 + margin && z <= -13.0 - margin) {
      // Solid collision for desk (desk body at X: 8.0 to 9.0, Z: -19.3 to -16.7)
      if (x >= 8.0 && x <= 9.0 && z >= -19.3 && z <= -16.7) {
        return false;
      }
      return true;
    }

    // 8. Art Room Doorway Portal (East wall at X = 2.8, opening Z: -8.8 to -6.2)
    // Seamless bridge between Entrance Hall (X <= 2.55) and Art Room (X >= 2.8)
    if (x >= 1.8 && x <= 4.0 && z >= -8.8 + margin && z <= -6.2 - margin) {
      return true;
    }

    // 9. Art Room / Personal Studio (X: 2.8 to 11.8, Z: -13.0 to -3.0)
    if (x >= 2.8 + margin && x <= 11.8 - margin && z >= -13.0 + margin && z <= -3.0 - margin) {
      // Solid collision for large artist worktable (X: 5.8 to 8.2, Z: -5.6 to -4.0)
      if (x >= 5.8 && x <= 8.2 && z >= -5.6 && z <= -4.0) {
        return false;
      }
      // Solid collision for easel base (X: 9.3 to 10.3, Z: -7.7 to -6.7)
      if (x >= 9.3 && x <= 10.3 && z >= -7.7 && z <= -6.7) {
        return false;
      }
      return true;
    }

    // 10. Exterior Walkway Alongside House (East side, X: 11.8 to 14.5, Z: -14.0 to 3.0)
    if (x >= 11.8 + margin && x <= 14.5 - margin && z >= -14.0 && z <= 3.0) {
      return true;
    }
    // Connection between Driveway / Forecourt and Exterior Side Walkway
    if (x >= 4.5 && x <= 14.5 - margin && z >= 0.5 && z <= 4.0) {
      return true;
    }

    return false;
  }

  public detectCurrentRoom(x: number, z: number): string {
    if (z >= 0.5 || (x >= 11.8 && z <= 0.5)) return "exterior";
    if (x <= -2.8 && z <= -11.0 && z >= -25.0) return "living_room";
    if (x >= 2.8 && z <= -13.0 && z >= -23.0) return "study";
    if (x >= 2.8 && z >= -13.0 && z <= -3.0) return "art_room";
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

  /**
   * Sets continuous analog movement vector from virtual joystick.
   * x: [-1, 1] strafe left/right
   * y: [-1, 1] forward (positive) / backward (negative)
   */
  public setJoystickInput(x: number, y: number) {
    if (!this.enabled) {
      this.joystickInput.x = 0;
      this.joystickInput.y = 0;
      return;
    }
    this.joystickInput.x = Math.max(-1, Math.min(1, x));
    this.joystickInput.y = Math.max(-1, Math.min(1, y));
  }

  /**
   * Applies touch-drag rotational delta from mobile touch look zone.
   * deltaX: horizontal swipe in pixels
   * deltaY: vertical swipe in pixels
   */
  public handleTouchLook(deltaX: number, deltaY: number) {
    if (!this.enabled) return;
    const touchSensitivity = 0.0032;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= deltaX * touchSensitivity;
    this.euler.x -= deltaY * touchSensitivity;

    // Clamp vertical pitch (prevent flipping upside down)
    const maxPitch = Math.PI / 2 - 0.08;
    this.euler.x = Math.max(-maxPitch, Math.min(maxPitch, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  /**
   * Fully halts all movement inputs, clears joystick vector, and dampens velocity to 0.
   */
  public resetMovement() {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.joystickInput.x = 0;
    this.joystickInput.y = 0;
    this.velocity.set(0, 0, 0);
  }

  /**
   * Triggers interaction handler for mobile interaction button tap.
   */
  public triggerInteract() {
    if (!this.enabled) return;
    this.onInteractPress?.();
  }

  public update(delta: number) {
    if (!this.enabled) {
      this.resetMovement();
    }

    // Damping / friction
    const damping = Math.max(0, 1 - 10.0 * delta);
    this.velocity.x *= damping;
    this.velocity.z *= damping;

    // Combine keyboard and analog joystick inputs
    const keyZ = Number(this.moveForward) - Number(this.moveBackward);
    const keyX = Number(this.moveRight) - Number(this.moveLeft);

    const totalX = keyX + this.joystickInput.x;
    const totalZ = keyZ + this.joystickInput.y;

    const inputMagnitude = Math.hypot(totalX, totalZ);

    if (inputMagnitude > 0.01) {
      const normX = totalX / inputMagnitude;
      const normZ = totalZ / inputMagnitude;
      const clampedMag = Math.min(1.0, inputMagnitude);

      const walkSpeed = 38.0; // units / sec^2 acceleration
      this.velocity.x += normX * walkSpeed * delta * clampedMag;
      this.velocity.z -= normZ * walkSpeed * delta * clampedMag;
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
