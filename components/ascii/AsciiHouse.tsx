"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { CustomAsciiRenderer } from "./CustomAsciiRenderer";
import { HOUSE_OBJECTS_3D, InteractiveObject3D } from "@/data/house3d";
import { FirstPersonNavigator, ControlTelemetry } from "./FirstPersonControls";
import AsciiHUD from "./AsciiHUD";
import ObjectInspector from "./ObjectInspector";
import ProfileModal from "./ProfileModal";
import HouseMapModal from "./HouseMapModal";
import DialogueBox from "./DialogueBox";
import {
  HOST_FIRST_MEETING_LINES,
  HOST_REFUSAL_RESPONSE_LINE,
  getRandomHostName,
  getHostNameConfirmedDialogue,
  getHostNameRefusedDialogue,
  getHostObjectCommentary,
  PROFILE_EASTER_EGG_LINE_1,
  PROFILE_EASTER_EGG_LINE_2,
  STUDY_COMPUTER_FIRST_ENCOUNTER_LINES,
  STUDY_COMPUTER_AFTER_CLOSE_LINES,
  GALLERY_SLOT_EMPTY_LINES,
  DialogueLine,
} from "@/data/hostDialogue";
import { GALLERY_FRAMES, getGalleryFrame } from "@/data/gallery";
import InventoryModal from "./InventoryModal";
import NavigationHUDModal from "./NavigationHUDModal";
import ProjectDirectoryModal from "./ProjectDirectoryModal";
import OrientationPrompt from "./OrientationPrompt";
import TouchControls from "./TouchControls";
// import { skyShaderMaterial } from "./skyShader"; // sky shader removed
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
const houseGroup = new THREE.Group();
const objLoader = new OBJLoader();
// Load Fox model with materials (using MTLLoader)
const mtlLoader = new MTLLoader();
mtlLoader.setPath('/models/');
mtlLoader.load('fox.mtl', (materials) => {
  materials.preload();
  const foxObjLoader = new OBJLoader();
  foxObjLoader.setMaterials(materials);
  foxObjLoader.load('fox.obj', (fox) => {
    fox.position.set(-6, 0, -6);
    fox.scale.set(0.5, 0.5, 0.5);
    houseGroup.add(fox);
  });
});
// Load Shiba model if available (optional)
objLoader.load('/models/shiba.obj', (shiba) => {
  // Position shiba in the courtyard area
  shiba.position.set(-30, 0, -20);
  shiba.scale.set(0.4, 0.4, 0.4);
  houseGroup.add(shiba);
});

// Dialogue State Machine Instrumentation & Constants
const DEBUG_DIALOGUE = process.env.NODE_ENV !== "production";

export const INTRO_SCREENS = {
  welcome: {
    title: "Welcome",
    text: "Hi! You are here to see Ashani's work, im guessing? Its all in the house",
    buttonText: "OK",
    lines: [
      {
        speaker: "Welcome",
        text: "Hi! You are here to see Ashani's work, im guessing? Its all in the house",
      },
    ],
  },
  instructions: {
    title: "Master of the House",
    text: "Walk around. Click on blue items to see projects.",
    buttonText: "OK",
    lines: [
      {
        speaker: "Master of the House",
        text: "Walk around. Click on blue items to see projects.",
      },
    ],
  },
  warning: {
    title: "Master of the House",
    text: "Take whatever speaks to you.\nJust don't take too long.\nThe house doesn't take well to critical visitors",
    buttonText: "knock knock",
    lines: [
      {
        speaker: "Master of the House",
        text: "Take whatever speaks to you.\nJust don't take too long.\nThe house doesn't take well to critical visitors",
      },
    ],
  },
} as const;

export default function AsciiHouse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigatorRef = useRef<FirstPersonNavigator | null>(null);

  const [mode, setMode] = useState<"wander" | "work">("wander");
  const [webGLError, setWebGLError] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<ControlTelemetry>({
    x: 0,
    y: 1.7,
    z: 13.0,
    yawDegrees: 0,
    currentRoomId: "exterior",
    isLocked: false,
  });
  const [hoveredObject, setHoveredObject] = useState<InteractiveObject3D | null>(null);
  const [inspectedObject, setInspectedObject] = useState<InteractiveObject3D | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isProjectDirectoryOpen, setIsProjectDirectoryOpen] = useState(false);
  const [hasEncounteredStudyComputer, setHasEncounteredStudyComputer] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("house_study_computer_first_encounter") === "true";
      } catch {}
    }
    return false;
  });
  const [hasSeenStudyComputerPostDialogue, setHasSeenStudyComputerPostDialogue] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("house_study_computer_post_dialogue") === "true";
      } catch {}
    }
    return false;
  });

  // Mandatory Three-Stage Introduction State Machine
  // Transitions: welcome --OK--> instructions --OK--> warning --knock knock--> playing
  const [introStage, setIntroStage] = useState<"welcome" | "instructions" | "warning" | "playing">("welcome");

  // Ensure fresh session clears legacy dialogue flags so all narrative interactions work
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("house_intro_completed");
        sessionStorage.removeItem("house_has_met_host");
        sessionStorage.removeItem("house_player_name");
        sessionStorage.removeItem("house_dialogue_appearance_count");
        sessionStorage.removeItem("house_inspected_counts");
        sessionStorage.removeItem("house_profile_activation_count");
        sessionStorage.removeItem("house_study_computer_first_encounter");
        sessionStorage.removeItem("house_study_computer_post_dialogue");
      } catch {}
    }
  }, []);

  // Explicit, authoritative stage advance handler
  const advanceIntroFrom = useCallback((fromStage: "welcome" | "instructions" | "warning") => {
    setIntroStage((prev) => {
      if (prev !== fromStage) {
        if (DEBUG_DIALOGUE) {
          console.warn(`[Dialogue] Ignored advance from "${fromStage}" because current stage is "${prev}"`);
        }
        return prev;
      }
      let nextStage: "welcome" | "instructions" | "warning" | "playing" = "welcome";
      if (fromStage === "welcome") {
        nextStage = "instructions";
      } else if (fromStage === "instructions") {
        nextStage = "warning";
      } else if (fromStage === "warning") {
        nextStage = "playing";
      }
      if (DEBUG_DIALOGUE) {
        console.log(`[Dialogue] Stage transition: ${fromStage} -> ${nextStage}`);
      }
      return nextStage;
    });
  }, []);

  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isNavHUDOpen, setIsNavHUDOpen] = useState(false);
  const [collectedItemIds, setCollectedItemIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Host Narrative System State
  const [playerName, setPlayerName] = useState<string>("");
  const [hasMetHost, setHasMetHost] = useState<boolean>(false);
  const [inspectedCounts, setInspectedCounts] = useState<Record<string, number>>({});

  // Profile-click Easter egg counter (Session memory)
  const [profileActivationCount, setProfileActivationCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("house_profile_activation_count");
        if (stored) return parseInt(stored, 10);
      } catch {}
    }
    return 0;
  });

  const [visitedRooms, setVisitedRooms] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("house_visited_rooms");
        return stored ? new Set(JSON.parse(stored)) : new Set(["exterior"]);
      } catch {
        return new Set(["exterior"]);
      }
    }
    return new Set(["exterior"]);
  });

  const [hostDialogueConfig, setHostDialogueConfig] = useState<{
    lines: DialogueLine[];
    title?: string;
    hasNameInput?: boolean;
    confirmButtonText?: string;
    showCancelButton?: boolean;
    hideCloseButton?: boolean;
    disableKeyboardAdvance?: boolean;
    instantText?: boolean;
    allowBackdropDismiss?: boolean;
    onProceed?: () => void;
  } | null>(null);

  // Appearance counter for progressive placement (Starts at 1 for opening dialogue)
  const [dialogueAppearanceCount, setDialogueAppearanceCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("house_dialogue_appearance_count");
        if (stored) return parseInt(stored, 10);
      } catch {}
    }
    return 1;
  });

  // Track visited rooms across player movements
  useEffect(() => {
    if (telemetry.currentRoomId) {
      setVisitedRooms((prev) => {
        if (prev.has(telemetry.currentRoomId)) return prev;
        const next = new Set(prev);
        next.add(telemetry.currentRoomId);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("house_visited_rooms", JSON.stringify(Array.from(next)));
          } catch {}
        }
        return next;
      });
    }
  }, [telemetry.currentRoomId]);

  const handleCollect = useCallback((objId: string) => {
    setCollectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(objId)) {
        next.delete(objId);
        setToastMessage("Specimen returned to the house.");
      } else {
        next.add(objId);
        setToastMessage("Artifact secured into satchel. [ I ] to view.");
      }
      return next;
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Keep a ref to hoveredObject so event listener closures always have the latest target
  const hoveredObjectRef = useRef<InteractiveObject3D | null>(null);

  // Profile Easter Egg Trigger (Sequential 2-step dialogue on 4th profile activation)
  const triggerProfileEasterEgg = useCallback(() => {
    setDialogueAppearanceCount((prev) => {
      const next = prev + 1;
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("house_dialogue_appearance_count", next.toString());
        } catch {}
      }
      return next;
    });

    setHostDialogueConfig({
      lines: [PROFILE_EASTER_EGG_LINE_1],
      title: "Master of the House",
      confirmButtonText: "LOL",
      showCancelButton: false,
      hideCloseButton: true,
      instantText: true,
      onProceed: () => {
        // Step 2: Clicking LOL opens Dialogue 2
        setDialogueAppearanceCount((prev) => {
          const next = prev + 1;
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem("house_dialogue_appearance_count", next.toString());
            } catch {}
          }
          return next;
        });

        setHostDialogueConfig({
          lines: [PROFILE_EASTER_EGG_LINE_2],
          title: "Master of the House",
          confirmButtonText: "ok",
          showCancelButton: false,
          hideCloseButton: true,
          instantText: true,
          onProceed: () => {
            // Step 3: Clicking ok dismisses dialogue and returns control
            setHostDialogueConfig(null);
          },
        });
      },
    });
  }, []);

  const handleInteract = useCallback(() => {
    if (introStage !== "playing" || !!hostDialogueConfig) return;

    const target = hoveredObjectRef.current;
    if (!target) return;

    if (navigatorRef.current) {
      navigatorRef.current.exitLock();
    }

    // Increment and persist inspection count for this object
    setInspectedCounts((prev) => {
      const nextCount = (prev[target.id] || 0) + 1;
      const next = { ...prev, [target.id]: nextCount };
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("house_inspected_counts", JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    if (target.id === "obj-hallway-portrait") {
      const nextCount = profileActivationCount + 1;
      setProfileActivationCount(nextCount);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("house_profile_activation_count", nextCount.toString());
        } catch {}
      }

      if (nextCount === 4) {
        // 4th activation triggers the Easter egg dialogue sequence
        // Do NOT open ProfileModal or any underlying dialogue
        triggerProfileEasterEgg();
        return;
      }

      // Clicks 1, 2, 3, and 5+ preserve standard profile interaction behaviour
      setIsProfileOpen(true);
    } else if (target.id === "obj-hallway-map") {
      setIsMapOpen(true);
    } else if (target.id === "obj-study-computer") {
      if (!hasEncounteredStudyComputer) {
        setHasEncounteredStudyComputer(true);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("house_study_computer_first_encounter", "true");
          } catch {}
        }
        setHostDialogueConfig({
          lines: STUDY_COMPUTER_FIRST_ENCOUNTER_LINES,
          title: "Master of the House",
          confirmButtonText: "OK",
          showCancelButton: false,
          hideCloseButton: true,
          instantText: true,
          onProceed: () => {
            setHostDialogueConfig(null);
            setIsProjectDirectoryOpen(true);
          },
        });
      } else {
        setIsProjectDirectoryOpen(true);
      }
    } else if (target.id.startsWith("gallery-frame-")) {
      const frameConfig = getGalleryFrame(target.id);
      if (frameConfig?.destinationUrl) {
        window.open(frameConfig.destinationUrl, "_blank", "noopener,noreferrer");
        return;
      }
      if (!frameConfig?.imagePath) {
        setHostDialogueConfig({
          lines: GALLERY_SLOT_EMPTY_LINES,
          title: "GALLERY SLOT",
          confirmButtonText: "OK",
          showCancelButton: false,
          hideCloseButton: true,
          instantText: true,
          onProceed: () => {
            setHostDialogueConfig(null);
          },
        });
        return;
      }
      setInspectedObject(target);
    } else {
      setInspectedObject(target);
    }
  }, [introStage, hostDialogueConfig, profileActivationCount, triggerProfileEasterEgg, hasEncounteredStudyComputer]);

  // Keep a stable ref to handleInteract so Three.js initialization effect NEVER re-runs on dialogue changes
  const handleInteractRef = useRef(handleInteract);
  useEffect(() => {
    handleInteractRef.current = handleInteract;
  });

  const handleSelectRoom = useCallback((roomId: string) => {
    if (navigatorRef.current) {
      navigatorRef.current.teleportToRoom(roomId);
    }
  }, []);

  const handleToggleMode = useCallback((newMode: "wander" | "work") => {
    if (newMode === "work" && navigatorRef.current) {
      navigatorRef.current.exitLock();
    }
    setMode(newMode);
  }, []);

  // Host name submission & refusal handlers (within same first-meeting sequence)
  const handleHostNameSubmit = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    setHasMetHost(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("house_player_name", trimmed);
        sessionStorage.setItem("house_has_met_host", "true");
      } catch {}
    }
    setHostDialogueConfig({
      lines: getHostNameConfirmedDialogue(trimmed),
      hasNameInput: false,
    });
  }, []);

  // Step 3 & 4: Proceed after refusal response, assign name once from 12 fixed names, and show reveal dialogue
  const handleProceedFromRefusal = useCallback(() => {
    let assigned = playerName;
    if (!assigned) {
      assigned = getRandomHostName();
      setPlayerName(assigned);
    }
    setHasMetHost(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("house_player_name", assigned);
        sessionStorage.setItem("house_has_met_host", "true");
      } catch {}
    }
    setHostDialogueConfig({
      lines: getHostNameRefusedDialogue(assigned),
      hasNameInput: false,
      showCancelButton: true,
    });
  }, [playerName]);

  // Step 2: The refusal response intermediate dialogue box
  const handleHostNameRefuse = useCallback(() => {
    setHostDialogueConfig({
      lines: [HOST_REFUSAL_RESPONSE_LINE],
      hasNameInput: false,
      confirmButtonText: "I guess?",
      showCancelButton: false,
      allowBackdropDismiss: true,
      onProceed: handleProceedFromRefusal,
    });
  }, [handleProceedFromRefusal]);

  // Closes an inspected object modal and triggers a new Host sequence or commentary
  const handleCloseObjectModal = useCallback(
    (objectId?: string, objectName?: string) => {
      setInspectedObject(null);
      setIsProfileOpen(false);
      setIsMapOpen(false);

      if (introStage !== "playing") {
        if (DEBUG_DIALOGUE) {
          console.warn("[Dialogue] Blocked handleCloseObjectModal: introStage is not playing", introStage);
        }
        return;
      }

      if (!hasMetHost) {
        // Player's first completed object inspection triggers the Host's first meeting and name prompt
        setDialogueAppearanceCount((prev) => {
          const next = prev + 1;
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem("house_dialogue_appearance_count", next.toString());
            } catch {}
          }
          return next;
        });
        setHostDialogueConfig({
          lines: HOST_FIRST_MEETING_LINES,
          hasNameInput: true,
        });
      } else if (objectId && objectName) {
        // Subtle contextual commentary on revisits or further inspections
        const count = inspectedCounts[objectId] || 1;
        if (count <= 2) {
          const commentary = getHostObjectCommentary(objectId, objectName, count, playerName);
          if (commentary && commentary.length > 0) {
            setDialogueAppearanceCount((prev) => {
              const next = prev + 1;
              if (typeof window !== "undefined") {
                try {
                  sessionStorage.setItem("house_dialogue_appearance_count", next.toString());
                } catch {}
              }
              return next;
            });
            setHostDialogueConfig({
              lines: commentary,
              hasNameInput: false,
            });
          }
        }
      }
    },
    [hasMetHost, inspectedCounts, playerName, introStage]
  );

  const handleCloseProjectDirectory = useCallback(() => {
    setIsProjectDirectoryOpen(false);
    if (!hasSeenStudyComputerPostDialogue) {
      setHasSeenStudyComputerPostDialogue(true);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("house_study_computer_post_dialogue", "true");
        } catch {}
      }
      setHostDialogueConfig({
        lines: STUDY_COMPUTER_AFTER_CLOSE_LINES,
        title: "Master of the House",
        confirmButtonText: "Moving on",
        showCancelButton: false,
        hideCloseButton: true,
        instantText: true,
        onProceed: () => {
          setHostDialogueConfig(null);
        },
      });
    } else {
      handleCloseObjectModal("obj-study-computer", "Terminal Workstation");
    }
  }, [hasSeenStudyComputerPostDialogue, handleCloseObjectModal]);

  // Full screen inspection modals that require pausing movement and freeing cursor
  const isFullScreenModalOpen =
    isInventoryOpen ||
    isNavHUDOpen ||
    isMapOpen ||
    isProfileOpen ||
    isProjectDirectoryOpen ||
    !!inspectedObject;

  // Generic modal flag for HUD reticle / indicator display
  const isAnyModalOpen =
    isFullScreenModalOpen ||
    introStage !== "playing" ||
    !!hostDialogueConfig;

  const handleRequestPointerLock = useCallback(() => {
    if (isFullScreenModalOpen || introStage !== "playing") return;
    if (navigatorRef.current) {
      navigatorRef.current.requestLock();
    }
  }, [isFullScreenModalOpen, introStage]);

  const [hasEnteredHouse, setHasEnteredHouse] = useState<boolean>(false);

  // Physical threshold entry: If player crosses the entrance threshold into the house (z < 0.5 or interior room), mark as entered
  useEffect(() => {
    if (telemetry.currentRoomId !== "exterior" || telemetry.z < 0.5) {
      setHasEnteredHouse(true);
    }
  }, [telemetry.currentRoomId, telemetry.z]);

  const handleEnterHouse = useCallback(() => {
    setHasEnteredHouse(true);
    handleRequestPointerLock();
  }, [handleRequestPointerLock]);

  // Full-screen modals, opening introduction, and dialogues disable navigation and exit pointer lock
  useEffect(() => {
    if (navigatorRef.current) {
      const isBlocked = isFullScreenModalOpen || introStage !== "playing" || !!hostDialogueConfig;
      navigatorRef.current.enabled = !isBlocked;
      if (isBlocked) {
        navigatorRef.current.exitLock();
        navigatorRef.current.resetMovement();
      }
    }
  }, [isFullScreenModalOpen, introStage, hostDialogueConfig]);

  // Context-sensitive input lock: only exit lock if an interactive name prompt or refusal response requires cursor clicking
  useEffect(() => {
    if (
      (hostDialogueConfig?.hasNameInput || hostDialogueConfig?.allowBackdropDismiss) &&
      navigatorRef.current
    ) {
      navigatorRef.current.exitLock();
    }
  }, [hostDialogueConfig?.hasNameInput, hostDialogueConfig?.allowBackdropDismiss]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore all hotkeys while opening introduction is active
      if (introStage !== "playing") return;

      // Don't intercept if user is typing in an input, textarea, or button
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLButtonElement
      ) {
        return;
      }

      // Quick room travel [ 1, 2, 3, 4, 5 ]
      if (e.key === "1") {
        if (!inspectedObject && !isProfileOpen && !isInventoryOpen) {
          handleSelectRoom("exterior");
          setIsNavHUDOpen(false);
          setIsMapOpen(false);
        }
      } else if (e.key === "2") {
        if (!inspectedObject && !isProfileOpen && !isInventoryOpen) {
          handleSelectRoom("entrance_hall");
          setIsNavHUDOpen(false);
          setIsMapOpen(false);
        }
      } else if (e.key === "3") {
        if (!inspectedObject && !isProfileOpen && !isInventoryOpen) {
          handleSelectRoom("living_room");
          setIsNavHUDOpen(false);
          setIsMapOpen(false);
        }
      } else if (e.key === "4") {
        if (!inspectedObject && !isProfileOpen && !isInventoryOpen) {
          handleSelectRoom("study");
          setIsNavHUDOpen(false);
          setIsMapOpen(false);
        }
      } else if (e.key === "5") {
        if (!inspectedObject && !isProfileOpen && !isInventoryOpen) {
          handleSelectRoom("art_room");
          setIsNavHUDOpen(false);
          setIsMapOpen(false);
        }
      } else if (e.code === "KeyI") {
        e.preventDefault();
        setIsInventoryOpen((prev) => !prev);
        setIsNavHUDOpen(false);
        setIsMapOpen(false);
        setInspectedObject(null);
        setIsProfileOpen(false);
        setIsProjectDirectoryOpen(false);
      } else if (e.key === "Tab") {
        e.preventDefault();
        setIsNavHUDOpen((prev) => !prev);
        setIsInventoryOpen(false);
        setIsMapOpen(false);
        setIsProjectDirectoryOpen(false);
        setInspectedObject(null);
        setIsProfileOpen(false);
      } else if (e.code === "KeyM") {
        if (!inspectedObject && !isProfileOpen && !isProjectDirectoryOpen) {
          e.preventDefault();
          setIsMapOpen((prev) => !prev);
          setIsNavHUDOpen(false);
          setIsInventoryOpen(false);
        }
      } else if (e.key === "Escape") {
        if (inspectedObject) {
          handleCloseObjectModal(inspectedObject.id, inspectedObject.name);
        } else if (isProfileOpen) {
          handleCloseObjectModal("obj-hallway-portrait", "Resident Portrait");
        } else if (isMapOpen) {
          handleCloseObjectModal("obj-hallway-map", "Architectural Map");
        } else if (isProjectDirectoryOpen) {
          handleCloseProjectDirectory();
        } else {
          setIsInventoryOpen(false);
          setIsNavHUDOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    introStage,
    hostDialogueConfig,
    inspectedObject,
    isProfileOpen,
    isMapOpen,
    isProjectDirectoryOpen,
    isInventoryOpen,
    handleSelectRoom,
    handleCloseProjectDirectory,
    handleCloseObjectModal,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─────────────────────────────────────────────────────────────
    // 1. SCENE & CAMERA (Spawn outside facing north)
    // ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    if (mode === "wander") {
    // scene.background removed for custom sky gradient
} else {
    // scene.background removed for custom sky gradient
}

    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const initialRoom = urlParams?.get("room");

    if (initialRoom === "portrait") {
      camera.position.set(-0.7, 1.85, -8.0);
      camera.lookAt(-2.51, 1.85, -8.0);
    } else if (initialRoom === "entrance_hall") {
      camera.position.set(0, 1.7, -6.0);
    } else if (initialRoom === "doorway") {
      camera.position.set(-0.5, 1.7, -18.0);
      camera.lookAt(-10.0, 1.7, -18.0);
    } else if (initialRoom === "living_room") {
      camera.position.set(-5.5, 1.7, -16.5);
      camera.lookAt(-10.5, 1.3, -18.2);
    } else if (initialRoom === "token_board") {
      camera.position.set(-10.0, 1.8, -21.0);
      camera.lookAt(-10.0, 2.2, -24.85);
    } else if (initialRoom === "dog_bed") {
      camera.position.set(-6.5, 1.3, -16.0);
      camera.lookAt(-6.5, 0.4, -13.5);
    } else if (initialRoom === "windows") {
      camera.position.set(-8.0, 1.8, -18.0);
      camera.lookAt(-17.5, 2.8, -18.0);
    } else if (initialRoom === "sofa") {
      camera.position.set(-7.5, 1.6, -18.0);
      camera.lookAt(-11.5, 1.2, -18.0);
    } else {
      camera.position.set(0, 1.7, 13.0); // Outside facing facade
    }

    // ─────────────────────────────────────────────────────────────
    // 2. WEBGL RENDERER & ASCII EFFECT
    // ─────────────────────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      });
      renderer.setClearColor(0x000000, 0);
    } catch (err: unknown) {
      console.error("WebGL failed to initialize:", err);
      const msg = err instanceof Error ? err.message : "WebGL context unavailable";
      queueMicrotask(() => setWebGLError(msg));
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Custom Architectural ASCII Renderer with perceptual tone-mapping & edge contours
    const effect = new CustomAsciiRenderer(renderer, " .·:+*x%@#", {
      resolution: 0.22,
      invert: true,
      color: true,
      gamma: 0.78, // Lift midtones and shadows for daytime clarity
      exposure: 1.70, // Brighter daytime exposure
      contrast: 1.15, // Preserve crisp architectural edges and contrast
      edgeDetection: true,
      edgeThreshold: 0.22, // Better contour detail on surfaces
      floorCeilingBoost: 0.08, // Avoid deep black crush on architectural surfaces
    });
    effect.setSize(container.clientWidth, container.clientHeight);

    const asciiDom = effect.domElement;
    asciiDom.tabIndex = 0;
    let aquariumWater: THREE.Mesh | null = null;
    let fish1Group: THREE.Group | null = null;
    let fish2Group: THREE.Group | null = null;
    let sparklePoints: THREE.Points | null = null;
    let sparkleBasePositions: { x: number; y: number; z: number }[] = [];
    let sparklePhases: number[] = [];

    container.innerHTML = "";
    container.appendChild(asciiDom);

    // Gallery artwork 3D meshes for raycasting and mouse interaction
    const galleryArtMeshes: THREE.Mesh[] = [];

    // ─────────────────────────────────────────────────────────────
    // 3. CONTROLS INITIALIZATION
    // ─────────────────────────────────────────────────────────────
    const navigator = new FirstPersonNavigator(camera, asciiDom, {
      onTelemetry: (t) => {
        setTelemetry(t);
        if (typeof window !== "undefined") {
          (window as unknown as { __ascii_telemetry?: ControlTelemetry }).__ascii_telemetry = t;
        }
      },
      onInteract: () => handleInteractRef.current(),
    });
    navigatorRef.current = navigator;
    if (typeof window !== "undefined") {
      (window as unknown as { __ascii_navigator?: FirstPersonNavigator }).__ascii_navigator = navigator;
    }

    // ─────────────────────────────────────────────────────────────
    // 4. ARCHITECTURAL MATERIALS & TEXTURES
    // ─────────────────────────────────────────────────────────────
    // Texture loader for high-contrast ASCII Profile Portrait
    const textureLoader = new THREE.TextureLoader();
    const portraitTexture = textureLoader.load("/cat.jpg");
    portraitTexture.minFilter = THREE.LinearFilter;
    portraitTexture.magFilter = THREE.LinearFilter;
    portraitTexture.generateMipmaps = true;

    // High-contrast portrait material with crisp 100% tonal reproduction
    const portraitMaterial = new THREE.MeshBasicMaterial({
      map: portraitTexture,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    // ─────────────────────────────────────────────────────────────
    // INTERACTIVE OBJECT VISUAL LANGUAGE (#769EFD FAMILY)
    // ─────────────────────────────────────────────────────────────
    // Deep tone for outer frame casings, substantial moulding & shadows (#1e3570)
    const interactiveDeep = new THREE.MeshLambertMaterial({ color: 0x1e3570 });
    // Mid-density tone for beveled fillets, reveals, cushions (#4e7be8)
    const interactiveMid = new THREE.MeshLambertMaterial({ color: 0x4e7be8 });
    // Core vibrant #769EFD for primary highlights, edges, accents & indicators (#769efd)
    const interactiveCore = new THREE.MeshLambertMaterial({ color: 0x769efd });
    // Soft luminous tint for bulbs, screens & glowing elements (#c2d6fe)
    const interactiveGlow = new THREE.MeshBasicMaterial({ color: 0xc2d6fe });
    // Dark backplate / drop-shadow panel beneath interactive frames (#0d162b)
    const interactiveShadow = new THREE.MeshBasicMaterial({ color: 0x0d162b });

    // Profile picture frame and fixture materials using #769EFD family
    const frameDarkMaterial = interactiveDeep; // Outer frame moulding
    const frameTrimMaterial = interactiveMid;  // Stepped beveled fillet
    const castShadowMaterial = interactiveShadow; // Dark drop-shadow on wall
    const brassLightMaterial = interactiveCore; // Picture light fixture arm & hood
    const brassDarkMaterial = interactiveDeep;  // Wall rosette mounting base
    const lampGlowMaterial = interactiveGlow;   // Diffuser bulb element

    // Architectural building materials
    const sidingMaterial = new THREE.MeshLambertMaterial({ color: 0xb5b0a4 }); // Exterior clapboard siding
    const shutterMaterial = new THREE.MeshLambertMaterial({ color: 0x181715 }); // Dark window shutters
    const windowFrameMaterial = new THREE.MeshLambertMaterial({ color: 0xe0dbd1 }); // White window trim & mullions
    const windowGlassMaterial = new THREE.MeshLambertMaterial({ color: 0x22252a }); // Dark reflective window glass
    const garageDoorMaterial = new THREE.MeshLambertMaterial({ color: 0x8a8479 }); // Ribbed garage door
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x38342f }); // Dark roof shingles & eaves
    const drivewayMaterial = new THREE.MeshLambertMaterial({ color: 0x756f64 }); // Paved concrete driveway
    const curbMaterial = new THREE.MeshLambertMaterial({ color: 0x48443d }); // Driveway perimeter curb
    const porchTrimMaterial = new THREE.MeshLambertMaterial({ color: 0xd2cdc2 }); // Dividing floor cornice trim

    // Procedural perspective plank texture for floor
    const createFloorPlankTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Base wood floor tone
      ctx.fillStyle = "#5c5448";
      ctx.fillRect(0, 0, 512, 512);

      // Longitudinal floorboards running along V (Z axis in 3D)
      const numPlanks = 8;
      const plankW = 512 / numPlanks;
      const plankTones = ["#62594d", "#554d42", "#695f52", "#5c5347", "#665d50"];

      for (let i = 0; i < numPlanks; i++) {
        ctx.fillStyle = plankTones[i % plankTones.length];
        ctx.fillRect(i * plankW, 0, plankW, 512);

        // Subtle longitudinal grain lines
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.fillRect(i * plankW + 12, 0, 1.5, 512);
        ctx.fillRect(i * plankW + 36, 0, 1.5, 512);

        // Clean subtle shadow seam between planks
        ctx.fillStyle = "rgba(24, 20, 16, 0.35)";
        ctx.fillRect(i * plankW, 0, 1.5, 512);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 8);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      return tex;
    };

    // Procedural coffered ceiling texture
    const createCeilingTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.fillStyle = "#4a443a";
      ctx.fillRect(0, 0, 512, 512);

      const panelSize = 128;
      for (let x = 0; x < 512; x += panelSize) {
        for (let y = 0; y < 512; y += panelSize) {
          ctx.fillStyle = "#3e3830";
          ctx.fillRect(x + 4, y + 4, panelSize - 8, panelSize - 8);

          ctx.strokeStyle = "#635a4d";
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 8, y + 8, panelSize - 16, panelSize - 16);
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 8);
      return tex;
    };

    const floorTexture = createFloorPlankTexture();
    const ceilingTexture = createCeilingTexture();

    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x9e978b });
    const darkWallMaterial = new THREE.MeshLambertMaterial({ color: 0x6e685f });
    const floorMaterial = floorTexture
      ? new THREE.MeshLambertMaterial({ map: floorTexture, color: 0xb5ab9c })
      : new THREE.MeshLambertMaterial({ color: 0x7a7266 });
    const extGroundMaterial = new THREE.MeshLambertMaterial({ color: 0x3d4734 }); // muted earthy autumn grass
    const stepMaterial = new THREE.MeshLambertMaterial({ color: 0x8a8479 });
    const ceilingMaterial = ceilingTexture
      ? new THREE.MeshLambertMaterial({ map: ceilingTexture, color: 0x9a8f80 })
      : new THREE.MeshLambertMaterial({ color: 0x686156 });
    const beamMaterial = new THREE.MeshLambertMaterial({ color: 0x42382e });
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x1f1d1a });

    // ─── LIVING ROOM HIGH-CONTRAST MATERIAL SUITE ───
    const createLivingFloorTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const numPlanks = 8;
      const plankW = 512 / numPlanks;
      const plankTones = ["#7c7263", "#6b6254", "#867b6c", "#726859", "#7f7566"];

      for (let i = 0; i < numPlanks; i++) {
        ctx.fillStyle = plankTones[i % plankTones.length];
        ctx.fillRect(i * plankW, 0, plankW, 512);

        // Subtle longitudinal grain lines
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(i * plankW + 10, 0, 1.5, 512);
        ctx.fillRect(i * plankW + 34, 0, 1.5, 512);

        // Clean subtle shadow seam between planks
        ctx.fillStyle = "rgba(20, 18, 15, 0.35)";
        ctx.fillRect(i * plankW, 0, 1.5, 512);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(5, 5);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      return tex;
    };

    const livingFloorTexture = createLivingFloorTexture();
    const livingFloorMaterial = livingFloorTexture
      ? new THREE.MeshLambertMaterial({ map: livingFloorTexture, color: 0xc8b8a0 })
      : new THREE.MeshLambertMaterial({ color: 0x8a7e6e });

    // Ceiling visibly darker than walls (maps to : . or space)
    const livingCeilingMaterial = new THREE.MeshLambertMaterial({ color: 0x221e1a });
    // Ceiling beams in clear contrast against the ceiling plane
    const livingBeamMaterial = new THREE.MeshLambertMaterial({ color: 0x483f34 });

    // Distinct wall orientation materials
    const livingWallNorthMaterial = new THREE.MeshLambertMaterial({ color: 0x948d82 });
    const livingWallSouthMaterial = new THREE.MeshLambertMaterial({ color: 0x585249 });
    const livingWallWestMaterial = new THREE.MeshLambertMaterial({ color: 0x443f36 });
    const livingWallEastMaterial = new THREE.MeshLambertMaterial({ color: 0x6e675c });

    // Architectural trims & junctions
    const livingBaseboardMaterial = new THREE.MeshLambertMaterial({ color: 0x141210 });
    const livingCrownMaterial = new THREE.MeshLambertMaterial({ color: 0x181512 });
    const livingCornerMaterial = new THREE.MeshBasicMaterial({ color: 0x0c0b0a });
    const contactShadowMaterial = new THREE.MeshBasicMaterial({ color: 0x0f0e0c });

    // Windows & daylight spill
    const windowEmbrasureMaterial = new THREE.MeshLambertMaterial({ color: 0x1c1a17 });
    const windowSpillFloorMaterial = new THREE.MeshLambertMaterial({ color: 0xb5cbe0 });

    // Doorway jambs & portal
    const doorwayJambMaterial = new THREE.MeshLambertMaterial({ color: 0x151311 });

    // Architectural furniture & column
    const consoleMaterial = new THREE.MeshLambertMaterial({ color: 0x2b241d });
    const consoleFolioMaterial1 = new THREE.MeshLambertMaterial({ color: 0x5a544b });
    const consoleFolioMaterial2 = new THREE.MeshLambertMaterial({ color: 0x767064 });
    const columnPlinthMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1816 });
    const columnShaftMaterial = new THREE.MeshLambertMaterial({ color: 0x4e483f });

    // Outdoor environment materials (West garden, trees & sky beyond windows)
    const gardenGrassMaterial = new THREE.MeshLambertMaterial({ color: 0x3d4734 }); // Muted earthy lawn
    const gardenBedMaterial = new THREE.MeshLambertMaterial({ color: 0x221e1a });   // Dark soil bedding
    const gardenBorderMaterial = new THREE.MeshLambertMaterial({ color: 0x282623 }); // Foundation plinth & curb
    const treeTrunkMaterial = new THREE.MeshLambertMaterial({ color: 0x2c231b });   // Dark organic bark
    const treeBranchMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3026 });  // Secondary boughs
    const treeCanopyMaterial1 = new THREE.MeshLambertMaterial({ color: 0xB3541E }); // Autumn deep orange
    const treeCanopyMaterial2 = new THREE.MeshLambertMaterial({ color: 0xD68A4C }); // Autumn mid-tone orange
    const treeCanopyMaterial3 = new THREE.MeshLambertMaterial({ color: 0xF2C078 }); // Autumn light orange
    const shrubMaterial = new THREE.MeshLambertMaterial({ color: 0x3a4835 });       // Low foundation shrubs
    // const skyBackdropMaterial = skyShaderMaterial; // Atmospheric gradient sky // Deprecated sky material
    const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xf5faff });         // Cumulus cloud white

    // ─────────────────────────────────────────────────────────────
    // 5. 3D GEOMETRY BUILDER: EXTERIOR → ENTRANCE HALL → LIVING ROOM
    // ─────────────────────────────────────────────────────────────
    // houseGroup defined earlier

    const addBox = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      mat: THREE.Material
    ) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      houseGroup.add(mesh);
      return mesh;
    };

    // Helper for triangular gable pediment
    const addTriangularGable = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      x3: number,
      y3: number,
      z: number,
      depth: number,
      mat: THREE.Material
    ) => {
      const shape = new THREE.Shape();
      shape.moveTo(x1, y1);
      shape.lineTo(x2, y2);
      shape.lineTo(x3, y3);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = z - depth / 2;
      houseGroup.add(mesh);
      return mesh;
    };

    // Helper for shuttered window assembly
    const addShutteredWindow = (
      cx: number,
      cy: number,
      cz: number,
      w: number,
      h: number,
      hasShutters = true
    ) => {
      // White outer frame
      addBox(w, h, 0.14, cx, cy, cz, windowFrameMaterial);
      // Dark glass pane
      addBox(w - 0.24, h - 0.24, 0.04, cx, cy, cz + 0.03, windowGlassMaterial);
      // Horizontal mullions (dividing into 6 panes)
      addBox(w - 0.24, 0.06, 0.06, cx, cy - (h * 0.2), cz + 0.06, windowFrameMaterial);
      addBox(w - 0.24, 0.06, 0.06, cx, cy + (h * 0.2), cz + 0.06, windowFrameMaterial);
      // Vertical central mullion
      addBox(0.06, h - 0.24, 0.06, cx, cy, cz + 0.06, windowFrameMaterial);
      // Projecting bottom sill
      addBox(w + 0.2, 0.14, 0.24, cx, cy - h / 2 - 0.07, cz + 0.08, windowFrameMaterial);

      if (hasShutters) {
        const shutterW = Math.max(0.42, w * 0.32);
        // Left shutter
        addBox(shutterW, h, 0.10, cx - w / 2 - shutterW / 2 + 0.02, cy, cz + 0.04, shutterMaterial);
        // Right shutter
        addBox(shutterW, h, 0.10, cx + w / 2 + shutterW / 2 - 0.02, cy, cz + 0.04, shutterMaterial);
      }
    };

    // ─── A. EXTERIOR ARCHITECTURE (Matching house ext.jpg) ───
    // 1. Grounds & Lawn
    addBox(200.0, 0.2, 200.0, 0, -0.22, 0, extGroundMaterial); // Extended ground safely below all floors

    // 2. Central Stone Walkway (From spawn [0, 1.7, 13.0] to entrance)
    addBox(2.4, 0.20, 14.0, 0, -0.01, 7.5, stepMaterial);

    // 3. Angled Paved Driveway leading to garage (widening from garage to foreground right)
    const drivewaySlabs = [
      { x: 5.25, z: 2.2, w: 5.6, d: 3.2 },
      { x: 5.70, z: 5.4, w: 5.9, d: 3.2 },
      { x: 6.20, z: 8.6, w: 6.2, d: 3.2 },
      { x: 6.80, z: 11.8, w: 6.6, d: 3.2 },
      { x: 7.50, z: 15.0, w: 7.1, d: 3.2 },
    ];
    drivewaySlabs.forEach((s) => {
      addBox(s.w, 0.20, s.d, s.x, -0.01, s.z, drivewayMaterial);
    });
    // Driveway perimeter edge curbs
    addBox(0.18, 0.24, 16.0, 2.6, 0.01, 8.8, curbMaterial);
    addBox(0.18, 0.24, 16.0, 10.8, 0.01, 8.8, curbMaterial);

    // 4. Stone Steps & Porch Threshold leading to front door
    addBox(4.0, 0.16, 1.2, 0.0, 0.08, 1.6, stepMaterial); // Step 1
    addBox(3.4, 0.16, 1.0, 0.0, 0.24, 0.7, stepMaterial); // Step 2
    addBox(2.8, 0.14, 0.6, 0.0, 0.38, 0.0, stepMaterial); // Threshold sill

    // 5. Lower Ground Floor Facade (Z = 0.0)
    // Left Lower Wing (siding wall + lower shuttered window)
    addBox(7.2, 4.0, 0.6, -5.1, 2.0, 0.0, sidingMaterial);
    addShutteredWindow(-5.1, 2.0, 0.32, 2.1, 2.0, true);

    // Center Entrance Aperture Frame (dark structural casing & door)
    addBox(0.3, 3.4, 0.8, -1.35, 1.7, 0.0, frameMaterial); // Left post
    addBox(0.3, 3.4, 0.8, 1.35, 1.7, 0.0, frameMaterial); // Right post
    addBox(3.0, 0.6, 0.8, 0.0, 3.7, 0.0, frameMaterial); // Door lintel trim
    addBox(3.4, 0.22, 1.1, 0.0, 3.85, 0.45, porchTrimMaterial); // Portico overhang

    // Right Lower Wing: Attached Garage Volume & Roll-up Door
    addBox(7.4, 4.0, 0.6, 5.2, 2.0, 0.0, sidingMaterial);
    // Garage door outer frame
    addBox(5.6, 3.1, 0.2, 5.2, 1.55, 0.32, windowFrameMaterial);
    // Garage door recessed panel
    addBox(5.2, 2.9, 0.1, 5.2, 1.45, 0.28, garageDoorMaterial);
    // Roll-up horizontal slats across garage door
    [0.45, 1.15, 1.85, 2.55].forEach((sy) => {
      addBox(5.1, 0.06, 0.06, 5.2, sy, 0.34, shutterMaterial);
    });

    // 6. Horizontal Porch Roofline / Dividing Cornice Trim (between floors)
    addBox(18.2, 0.28, 0.7, 0.0, 4.0, 0.35, porchTrimMaterial);

    // 7. Upper Floor Facade
    // Left Upper Gabled Wing (Triangle pitched roof + 2 shuttered windows)
    addBox(9.2, 1.8, 0.6, -4.1, 4.9, 0.0, sidingMaterial);
    addTriangularGable(-8.6, 4.0, 0.4, 4.0, -4.1, 7.3, 0.0, 0.6, sidingMaterial);

    // Sloping Gable Roof Eaves & Fascia
    const leftEave = addBox(5.6, 0.22, 0.8, -6.35, 5.65, 0.1, roofMaterial);
    leftEave.rotation.z = Math.atan2(3.3, 4.5);
    const rightEave = addBox(5.6, 0.22, 0.8, -1.85, 5.65, 0.1, roofMaterial);
    rightEave.rotation.z = -Math.atan2(3.3, 4.5);
    addBox(0.4, 0.25, 0.85, -4.1, 7.38, 0.1, roofMaterial); // Ridge cap

    // Twin Upper Shuttered Windows in Gable
    addShutteredWindow(-6.1, 5.15, 0.32, 1.45, 1.8, true); // Left window
    addShutteredWindow(-2.1, 5.15, 0.32, 1.45, 1.8, true); // Right window

    // Right Upper Floor (Flat/hip roofline + single smaller window)
    addBox(8.4, 1.8, 0.6, 4.7, 4.9, 0.0, sidingMaterial);
    addBox(8.6, 0.25, 0.8, 4.7, 5.8, 0.25, roofMaterial); // Roofline trim
    addShutteredWindow(4.2, 4.95, 0.32, 1.15, 1.35, false); // Upper right dormer window

    // ─── B. ENTRANCE HALL (Z: 0.0 to -21.0, X: -2.8 to +2.8, Height 4.2m) ───
    // Hall Floor (dark planks elevated safely above ground)
    addBox(5.6, 0.22, 21.0, 0.0, -0.01, -10.5, floorMaterial);
    // Hall Ceiling
    addBox(5.6, 0.2, 21.0, 0.0, 4.2, -10.5, ceilingMaterial);
    // Hall North End Wall (deepest point of the axial corridor)
    addBox(5.6, 4.2, 0.6, 0.0, 2.1, -21.0, darkWallMaterial);

    // East Wall (Hallway inner face at X = 2.56, back at X = 2.80, with Art Room aperture at Z = -7.5 and Study aperture at Z = -18.0)
    addBox(0.24, 4.2, 6.2, 2.68, 2.1, -3.1, wallMaterial);       // South of Art Room (Z: 0.0 to -6.2)
    addBox(0.24, 1.0, 2.6, 2.68, 3.7, -7.5, frameMaterial);      // Art Room doorway lintel header (Z: -6.2 to -8.8)
    addBox(0.24, 4.2, 7.7, 2.68, 2.1, -12.65, wallMaterial);     // Wall between Art Room & Study (Z: -8.8 to -16.5)
    addBox(0.24, 1.0, 3.0, 2.68, 3.7, -18.0, frameMaterial);     // Study doorway lintel header (Z: -16.5 to -19.5)
    addBox(0.24, 4.2, 1.5, 2.68, 2.1, -20.25, wallMaterial);    // North of Study (Z: -19.5 to -21.0)

    // Doorway Frame to Art Room (bridging X = 2.54 to 3.06 across opening Z: -6.2 to -8.8)
    addBox(0.52, 3.2, 0.20, 2.80, 1.6, -6.2, frameMaterial); // South jamb post
    addBox(0.52, 3.2, 0.20, 2.80, 1.6, -8.8, frameMaterial); // North jamb post
    addBox(0.52, 0.15, 2.6, 2.80, 3.12, -7.5, frameMaterial); // Soffit trim

    // Doorway Frame to Study (bridging X = 2.54 to 3.06 across opening Z: -16.5 to -19.5)
    addBox(0.52, 3.2, 0.20, 2.80, 1.6, -16.5, frameMaterial); // South jamb post
    addBox(0.52, 3.2, 0.20, 2.80, 1.6, -19.5, frameMaterial); // North jamb post
    addBox(0.52, 0.15, 3.0, 2.80, 3.12, -18.0, frameMaterial); // Soffit trim

    // West Wall (with Living Room aperture at Z = -18.0)
    addBox(0.5, 4.2, 16.5, -2.8, 2.1, -8.25, wallMaterial); // South segment
    addBox(0.5, 1.0, 3.0, -2.8, 3.7, -18.0, frameMaterial); // Doorway lintel
    addBox(0.5, 4.2, 1.5, -2.8, 2.1, -20.25, wallMaterial); // North segment

    // Doorway Frame to Living Room
    addBox(0.6, 3.2, 0.25, -2.8, 1.6, -16.5, frameMaterial); // Post 1
    addBox(0.6, 3.2, 0.25, -2.8, 1.6, -19.5, frameMaterial); // Post 2
    addBox(0.6, 0.25, 3.2, -2.8, 3.2, -18.0, frameMaterial); // Lintel trim

    // Exposed Ceiling Beams across the Hallway (sharply converging perspective lines)
    [-3.5, -7.0, -10.5, -14.0, -17.5, -20.5].forEach((bz) => {
      addBox(5.6, 0.32, 0.28, 0.0, 4.04, bz, beamMaterial);
    });

    // Hallway Baseboard Moulding (crisp architectural lines running along the bottom of the walls)
    const baseboardMaterial = new THREE.MeshLambertMaterial({ color: 0x24201c });
    // West wall baseboard (split to leave doorway Z: -16.5 to -19.5 completely unobstructed)
    addBox(0.08, 0.18, 16.4, -2.52, 0.09, -8.2, baseboardMaterial);   // South segment (Z: 0.0 to -16.4)
    addBox(0.08, 0.18, 1.4, -2.52, 0.09, -20.3, baseboardMaterial);   // North segment (Z: -19.6 to -21.0)
    // East wall baseboard (split to leave Art Room doorway Z: -6.2 to -8.8 and Study doorway Z: -16.5 to -19.5 unobstructed)
    addBox(0.08, 0.18, 6.1, 2.52, 0.09, -3.05, baseboardMaterial);    // South segment (Z: 0.0 to -6.1)
    addBox(0.08, 0.18, 7.5, 2.52, 0.09, -12.65, baseboardMaterial);   // Middle segment (Z: -8.9 to -16.4)
    addBox(0.08, 0.18, 1.4, 2.52, 0.09, -20.3, baseboardMaterial);    // North segment (Z: -19.6 to -21.0)

    // Hallway Crown Moulding Trim (crisp architectural lines running along the top of the walls)
    const crownTrimMaterial = new THREE.MeshLambertMaterial({ color: 0x2e2924 });
    addBox(0.10, 0.14, 21.0, -2.51, 4.03, -10.5, crownTrimMaterial); // West wall crown
    addBox(0.10, 0.14, 21.0, 2.51, 4.03, -10.5, crownTrimMaterial);  // East wall crown

    // Flush Doorway Threshold Sills into Living Room, Art Room and Study (smooth level crossing)
    addBox(0.6, 0.04, 3.0, -2.8, 0.02, -18.0, stepMaterial); // Living Room threshold
    addBox(0.52, 0.04, 2.6, 2.80, 0.02, -7.5, stepMaterial);  // Art Room threshold
    addBox(0.52, 0.04, 3.0, 2.80, 0.02, -18.0, stepMaterial);  // Study threshold

    // ─── C. HALLWAY PHYSICAL WALL FIXTURES ───
    // 1. Framed Profile Portrait on West Wall (Inner wall face is at X = -2.55, Z = -8.0, Y = 1.85)
    // Wall drop shadow panel beneath the frame (emphasizing 18cm protrusion from wall)
    addBox(0.01, 0.22, 1.70, -2.545, 0.80, -8.0, castShadowMaterial);
    addBox(0.01, 0.08, 1.66, -2.545, 2.85, -8.0, castShadowMaterial);

    // Backing mounting board flush against wall surface
    addBox(0.02, 1.96, 1.64, -2.54, 1.85, -8.0, frameDarkMaterial);

    // Substantial outer raised moulding (18cm thick protrusion from wall to X = -2.37)
    addBox(0.18, 0.12, 1.64, -2.46, 2.77, -8.0, frameDarkMaterial); // Top rail
    addBox(0.18, 0.12, 1.64, -2.46, 0.93, -8.0, frameDarkMaterial); // Bottom rail
    addBox(0.18, 1.96, 0.12, -2.46, 1.85, -7.24, frameDarkMaterial); // Left rail (+Z)
    addBox(0.18, 1.96, 0.12, -2.46, 1.85, -8.76, frameDarkMaterial); // Right rail (-Z)

    // Inner beveled fillet / stepped reveal (stepping down towards canvas)
    addBox(0.12, 0.08, 1.44, -2.49, 2.67, -8.0, frameTrimMaterial); // Top fillet
    addBox(0.12, 0.08, 1.44, -2.49, 1.03, -8.0, frameTrimMaterial); // Bottom fillet
    addBox(0.12, 1.72, 0.08, -2.49, 1.85, -7.34, frameTrimMaterial); // Left fillet
    addBox(0.12, 1.72, 0.08, -2.49, 1.85, -8.66, frameTrimMaterial); // Right fillet

    // Recessed canvas mount panel
    addBox(0.04, 1.62, 1.30, -2.53, 1.85, -8.0, frameDarkMaterial);

    // Dedicated 3D portrait canvas plane displaying high-contrast cat photo ASCII texture
    const portraitGeo = new THREE.PlaneGeometry(1.20, 1.45);
    const portraitMesh = new THREE.Mesh(portraitGeo, portraitMaterial);
    portraitMesh.position.set(-2.48, 1.85, -8.0);
    portraitMesh.rotation.y = Math.PI / 2;
    houseGroup.add(portraitMesh);

    // Dedicated Overhead Picture Light Fixture
    // Wall mounting rosette
    addBox(0.04, 0.18, 0.24, -2.54, 3.02, -8.0, brassDarkMaterial);
    // Cantilever brass arms extending out from wall
    addBox(0.42, 0.03, 0.03, -2.33, 3.02, -8.22, brassLightMaterial);
    addBox(0.42, 0.03, 0.03, -2.33, 3.02, -7.78, brassLightMaterial);
    // Arm drop elbows
    addBox(0.04, 0.12, 0.03, -2.12, 2.96, -8.22, brassLightMaterial);
    addBox(0.04, 0.12, 0.03, -2.12, 2.96, -7.78, brassLightMaterial);
    // Horizontal cylindrical hood
    addBox(0.12, 0.08, 0.96, -2.12, 2.90, -8.0, brassLightMaterial);
    // Underside luminous bulb diffuser
    addBox(0.08, 0.02, 0.88, -2.12, 2.85, -8.0, lampGlowMaterial);

    // 2. Framed House Blueprint Map on East Wall (X = 2.65, Z = -12.0)
    addBox(0.12, 1.5, 2.2, 2.65, 1.85, -12.0, interactiveDeep); // Beveled map frame
    addBox(0.04, 1.25, 1.95, 2.61, 1.85, -12.0, interactiveMid); // Blueprint schematic plane
    addBox(0.25, 0.06, 0.9, 2.55, 2.7, -12.0, interactiveCore); // Overhead blueprint light fixture arm

    // ─── D. THE LIVING ROOM (X: -17.5 to -2.8, Z: -25.0 to -11.0, Height 5.6m) ───
    // 1. Living Room Floor & Tonal Surface (elevated safely above ground)
    addBox(14.7, 0.22, 14.0, -10.15, -0.01, -18.0, livingFloorMaterial);

    // 2. High Ceiling Plane & Structural Timber Grid
    // Dark ceiling plane (maps to : . or space, clearly separating from walls)
    addBox(14.7, 0.2, 14.0, -10.15, 5.6, -18.0, livingCeilingMaterial);

    // Exposed structural timber beams hanging down from ceiling (creates strong perspective lines & contrast)
    // Longitudinal main girder along Z = -18.0
    addBox(14.7, 0.45, 0.40, -10.15, 5.35, -18.0, livingBeamMaterial);
    // Transverse structural cross-beams spanning North-South
    [-5.0, -8.0, -11.0, -14.0].forEach((bx) => {
      addBox(0.35, 0.38, 14.0, bx, 5.40, -18.0, livingBeamMaterial);
    });

    // 3. Walls (Tuned to Lighting Orientation)
    // North Wall (receives token board downlight, lighter tone)
    addBox(14.7, 5.6, 0.6, -10.15, 2.8, -25.0, livingWallNorthMaterial);
    // South Wall (architectural shadow side, backing console credenza)
    addBox(14.7, 5.6, 0.6, -10.15, 2.8, -11.0, livingWallSouthMaterial);
    // East Wall Partitions (flanking the 3.0m wide doorway opening at Z: -19.5 to -16.5)
    addBox(0.6, 5.6, 5.5, -2.8, 2.8, -13.75, livingWallEastMaterial); // South partition
    addBox(0.6, 5.6, 5.5, -2.8, 2.8, -22.25, livingWallEastMaterial); // North partition
    addBox(0.6, 2.4, 3.0, -2.8, 4.4, -18.0, livingWallEastMaterial);   // Doorway lintel header

    // West Outer Wall with Window Cutouts
    addBox(0.6, 1.2, 14.0, -17.5, 0.6, -18.0, livingWallWestMaterial);   // Bottom spandrel beneath windows
    addBox(0.6, 1.2, 14.0, -17.5, 5.0, -18.0, livingWallWestMaterial);   // Top header above windows
    addBox(0.6, 3.2, 3.0, -17.5, 2.8, -18.0, livingWallWestMaterial);    // Center pier between windows
    addBox(0.6, 3.2, 2.5, -17.5, 2.8, -23.75, livingWallWestMaterial);   // North pier
    addBox(0.6, 3.2, 2.5, -17.5, 2.8, -12.25, livingWallWestMaterial);   // South pier

    // 4. Baseboards & Crown Moulding (Crisp Architectural Junctions)
    // Deep dark baseboard trims along all walls
    addBox(14.7, 0.28, 0.08, -10.15, 0.14, -24.66, livingBaseboardMaterial); // North baseboard
    addBox(14.7, 0.28, 0.08, -10.15, 0.14, -11.34, livingBaseboardMaterial); // South baseboard
    addBox(0.08, 0.28, 14.0, -17.16, 0.14, -18.0, livingBaseboardMaterial);  // West baseboard
    addBox(0.08, 0.28, 5.5, -3.14, 0.14, -13.75, livingBaseboardMaterial);   // East baseboard South
    addBox(0.08, 0.28, 5.5, -3.14, 0.14, -22.25, livingBaseboardMaterial);   // East baseboard North

    // Crown mouldings along top of room
    addBox(14.7, 0.20, 0.10, -10.15, 5.48, -24.65, livingCrownMaterial); // North crown
    addBox(14.7, 0.20, 0.10, -10.15, 5.48, -11.35, livingCrownMaterial); // South crown
    addBox(0.10, 0.20, 14.0, -17.15, 5.48, -18.0, livingCrownMaterial);  // West crown
    addBox(0.10, 0.20, 14.0, -3.15, 5.48, -18.0, livingCrownMaterial);   // East crown

    // Dark vertical corner fillets (ensures corners darken and planes do not merge)
    addBox(0.24, 5.6, 0.24, -17.08, 2.8, -24.58, livingCornerMaterial); // NW Corner
    addBox(0.24, 5.6, 0.24, -17.08, 2.8, -11.42, livingCornerMaterial); // SW Corner
    addBox(0.24, 5.6, 0.24, -3.22, 2.8, -24.58, livingCornerMaterial);  // NE Corner
    addBox(0.24, 5.6, 0.24, -3.22, 2.8, -11.42, livingCornerMaterial);  // SE Corner

    // 5. Doorway Portal & Recess Jambs (Hallway -> Living Room Transition)
    addBox(0.65, 3.2, 0.20, -2.8, 1.6, -16.6, doorwayJambMaterial); // Left jamb
    addBox(0.65, 3.2, 0.20, -2.8, 1.6, -19.4, doorwayJambMaterial); // Right jamb
    addBox(0.65, 0.20, 3.0, -2.8, 3.1, -18.0, doorwayJambMaterial); // Soffit lining

    // 6. Windows on West Wall (Deep Embrasures, Architectural Mullions & Floor Daylight Spill)
    [-15.0, -21.0].forEach((wz) => {
      // Deep dark window embrasures for maximum contrast
      addBox(0.40, 0.18, 2.6, -17.3, 1.25, wz, windowEmbrasureMaterial); // Sill
      addBox(0.40, 0.18, 2.6, -17.3, 4.35, wz, windowEmbrasureMaterial); // Head
      addBox(0.40, 3.2, 0.18, -17.3, 2.8, wz + 1.25, windowEmbrasureMaterial); // South jamb
      addBox(0.40, 3.2, 0.18, -17.3, 2.8, wz - 1.25, windowEmbrasureMaterial); // North jamb

      // Architectural window mullions in dark trim (crossbars framing outdoor view)
      addBox(0.08, 0.08, 2.3, -17.42, 2.8, wz, windowEmbrasureMaterial); // Mullion H
      addBox(0.08, 2.9, 0.08, -17.42, 2.8, wz, windowEmbrasureMaterial); // Mullion V

      // Daylight light spill patch across the floorboards in front of window
      addBox(3.2, 0.006, 3.6, -15.2, 0.003, wz, windowSpillFloorMaterial);
    });

    // ─────────────────────────────────────────────────────────────
    // OUTDOOR ENVIRONMENT (WEST GARDEN, OUTDOOR TREE, SKY & CLOUDS)
    // Sky plane extending to horizon
    // Sky surrounding box for full‑screen gradient
    // Sky plane extending far behind the house
    // Sky plane extending far behind the house, elevated for full view
    // =============================
    // New Autumn Exterior Environment
    // =============================

    // Sky gradient plane (far background)
    // addBox(400, 200, 0.1, 0, 80, -250, skyShaderMaterial); // sky plane removed // large sky plane covering view

    // Ground plane (large field)
    addBox(400, 0.2, 400, 0, -0.1, 0, extGroundMaterial); // autumn field extending to horizon

    // Directional sunlight simulated by a bright point light
    const sunLight = new THREE.PointLight(0xffe5b4, 1.5, 500, 2);
    sunLight.position.set(100, 150, 100);
    scene.add(sunLight);

    // Ambient fill for subtle lighting
    const ambient = new THREE.AmbientLight(0x808080, 0.3);
    scene.add(ambient);

    // Helper to create an architectural tree with solid branching boughs connecting trunk to foliage
    function addTree(x: number, z: number, trunkHeight: number = 3.6, canopyRadius: number = 2.4) {
      // 1. Root base flare
      addBox(0.80, 0.30, 0.80, x, 0.05, z, treeTrunkMaterial);
      addBox(0.60, 0.40, 0.60, x, 0.20, z, treeTrunkMaterial);

      // 2. Continuous upright vertical trunk
      const trunkMidY = trunkHeight / 2;
      addBox(0.48, trunkHeight, 0.48, x, trunkMidY, z, treeTrunkMaterial);

      // 3. Structural boughs / branches connecting trunk directly into foliage cushions
      const branchY = trunkHeight - 0.45;
      // North Branch
      addBox(0.24, 0.24, 0.90, x, branchY + 0.35, z - 0.60, treeBranchMaterial);
      addBox(0.20, 0.55, 0.20, x, branchY + 0.65, z - 0.95, treeBranchMaterial);
      // South Branch
      addBox(0.24, 0.24, 0.90, x, branchY + 0.30, z + 0.60, treeBranchMaterial);
      addBox(0.20, 0.55, 0.20, x, branchY + 0.60, z + 0.95, treeBranchMaterial);
      // East Branch
      addBox(0.90, 0.24, 0.24, x + 0.60, branchY + 0.40, z, treeBranchMaterial);
      addBox(0.20, 0.55, 0.20, x + 0.95, branchY + 0.70, z, treeBranchMaterial);
      // West Branch
      addBox(0.90, 0.24, 0.24, x - 0.60, branchY + 0.35, z, treeBranchMaterial);
      addBox(0.20, 0.55, 0.20, x - 0.95, branchY + 0.65, z, treeBranchMaterial);
      // Central crown stem
      addBox(0.28, 0.85, 0.28, x, trunkHeight + 0.40, z, treeTrunkMaterial);

      // 4. Foliage clusters resting directly on the branches and crown
      // Lower canopy pillows supported by the boughs
      addBox(1.5, 0.85, 1.5, x, branchY + 0.55, z - 0.75, treeCanopyMaterial1);
      addBox(1.5, 0.85, 1.5, x, branchY + 0.50, z + 0.75, treeCanopyMaterial2);
      addBox(1.5, 0.85, 1.5, x + 0.75, branchY + 0.60, z, treeCanopyMaterial2);
      addBox(1.5, 0.85, 1.5, x - 0.75, branchY + 0.55, z, treeCanopyMaterial1);

      // Mid main canopy mass enveloping trunk crown
      addBox(canopyRadius * 1.05, 1.05, canopyRadius * 1.05, x, trunkHeight + 0.75, z, treeCanopyMaterial2);
      addBox(canopyRadius * 0.85, 0.95, canopyRadius * 0.85, x, trunkHeight + 1.45, z, treeCanopyMaterial3);

      // Upper canopy dome
      addBox(canopyRadius * 0.55, 0.75, canopyRadius * 0.55, x, trunkHeight + 2.05, z, treeCanopyMaterial1);
    }

    // Place trees around the house (keeping exterior well clear of Art Room and Study)
    addTree(-12, -8);
    addTree(-9, -4);
    addTree(16.5, -4);
    addTree(16.5, -10);
    // Tree relocated from behind/inside to the front lawn beside the central stone walkway
    addTree(-3.5, 6.5, 3.8, 2.5);

    // Fallen leaves (simple point cloud)
    const leafCount = 200;
    const leafGeometry = new THREE.BufferGeometry();
    const leafPositions = new Float32Array(leafCount * 3);
    for (let i = 0; i < leafCount; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = Math.random() * 0.2;
      const z = (Math.random() - 0.5) * 200;
      leafPositions[i * 3] = x;
      leafPositions[i * 3 + 1] = y;
      leafPositions[i * 3 + 2] = z;
    }
    leafGeometry.setAttribute('position', new THREE.BufferAttribute(leafPositions, 3));
    const leafMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xd68d3b });
    const leafPoints = new THREE.Points(leafGeometry, leafMaterial);
    scene.add(leafPoints);

    // Fox placeholder (small orange box)
    // Fox model loaded via OBJ/MTL loader above
    // ─────────────────────────────────────────────────────────────








    
    
    

    
    





    

    // Interior tree removed (was positioned inside Entrance Hall)
    // Main trunk column
    addBox(0.44, 2.0, 0.44, -21.5, 1.1, -16.2, treeTrunkMaterial);
    // Mid trunk section (slight natural lean towards aperture)
    addBox(0.38, 1.8, 0.38, -21.3, 2.8, -16.1, treeTrunkMaterial);
    // Lower branch 1 reaching towards Window 1 (Z = -15.0)
    addBox(1.2, 0.22, 0.22, -20.6, 2.5, -15.2, treeBranchMaterial);
    addBox(0.8, 0.18, 0.18, -20.0, 2.9, -14.6, treeBranchMaterial);
    // Lower branch 2 reaching towards Window 2 (Z = -21.0)
    addBox(1.2, 0.22, 0.22, -20.7, 2.7, -17.4, treeBranchMaterial);
    addBox(0.8, 0.18, 0.18, -20.2, 3.1, -18.4, treeBranchMaterial);
    // Central upward bough
    addBox(0.24, 1.6, 0.24, -21.2, 4.2, -16.2, treeBranchMaterial);
    // Western deep branch
    addBox(1.4, 0.2, 0.2, -22.4, 3.2, -16.0, treeBranchMaterial);

    // Tree Foliage Canopies (Tiered organic volumes in high-contrast ASCII)
    // Lower South Canopy (clearly framed within Window 1)
    addBox(1.9, 1.2, 1.7, -20.0, 3.2, -14.6, treeCanopyMaterial1);
    addBox(1.5, 0.9, 1.4, -19.8, 3.4, -14.4, treeCanopyMaterial2);
    addBox(1.0, 0.6, 1.0, -19.5, 3.5, -14.2, treeCanopyMaterial3);
    // Lower North Canopy (framed within Window 2)
    addBox(1.8, 1.2, 1.8, -20.2, 3.4, -18.2, treeCanopyMaterial1);
    addBox(1.4, 0.9, 1.4, -20.0, 3.6, -18.4, treeCanopyMaterial2);
    // Main Crown Canopy (central dense volume)
    addBox(2.8, 1.8, 2.8, -21.2, 4.6, -16.2, treeCanopyMaterial1);
    addBox(2.2, 1.4, 2.2, -20.9, 4.8, -16.0, treeCanopyMaterial2);
    addBox(1.6, 1.0, 1.6, -20.6, 5.0, -15.9, treeCanopyMaterial3);
    // Top Crown Canopy (silhouetted high against the sky)
    addBox(1.8, 1.2, 1.8, -21.1, 5.8, -16.2, treeCanopyMaterial2);
    addBox(1.2, 0.8, 1.2, -21.0, 6.2, -16.1, treeCanopyMaterial3);

    // Additional Tree 2 (variation, exterior east garden lawn)
    addBox(0.7, 0.25, 0.7, 17.5, 0.12, -1.0, treeTrunkMaterial);
    addBox(0.44, 2.0, 0.44, 17.5, 1.1, -1.0, treeTrunkMaterial);
    addBox(0.38, 1.8, 0.38, 17.3, 2.8, -0.9, treeTrunkMaterial);
    addBox(1.2, 0.22, 0.22, 16.6, 2.5, -0.4, treeBranchMaterial);
    addBox(0.8, 0.18, 0.18, 16.0, 2.9, 0.2, treeBranchMaterial);
    addBox(1.9, 1.2, 1.7, 17.5, 3.2, -0.5, treeCanopyMaterial1);
    addBox(1.5, 0.9, 1.4, 17.5, 3.4, -0.3, treeCanopyMaterial2);
    addBox(1.0, 0.6, 1.0, 17.2, 3.5, -0.1, treeCanopyMaterial3);

addBox(0.38, 1.8, 0.38, -22.3, 2.8, -15.4, treeTrunkMaterial);
addBox(1.2, 0.22, 0.22, -21.6, 2.5, -14.8, treeBranchMaterial);
addBox(0.8, 0.18, 0.18, -21.0, 2.9, -14.2, treeBranchMaterial);
addBox(1.9, 1.2, 1.7, -21.2, 3.2, -14.0, treeCanopyMaterial1);
addBox(1.5, 0.9, 1.4, -21.0, 3.4, -13.8, treeCanopyMaterial2);
addBox(1.0, 0.6, 1.0, -20.7, 3.5, -13.6, treeCanopyMaterial3);

// Additional Tree 3
addBox(0.7, 0.25, 0.7, -19.0, 0.12, -12.0, treeTrunkMaterial);
addBox(0.44, 2.0, 0.44, -19.0, 1.1, -12.0, treeTrunkMaterial);
addBox(0.38, 1.8, 0.38, -18.8, 2.8, -11.9, treeTrunkMaterial);
addBox(1.2, 0.22, 0.22, -18.2, 2.5, -11.4, treeBranchMaterial);
addBox(0.8, 0.18, 0.18, -17.6, 2.9, -10.8, treeBranchMaterial);
addBox(1.9, 1.2, 1.7, -18.0, 3.2, -10.5, treeCanopyMaterial1);
addBox(1.5, 0.9, 1.4, -17.8, 3.4, -10.3, treeCanopyMaterial2);
addBox(1.0, 0.6, 1.0, -17.5, 3.5, -10.1, treeCanopyMaterial3);

// Additional Tree 4
addBox(0.7, 0.25, 0.7, -24.0, 0.12, -18.5, treeTrunkMaterial);
addBox(0.44, 2.0, 0.44, -24.0, 1.1, -18.5, treeTrunkMaterial);
addBox(0.38, 1.8, 0.38, -23.8, 2.8, -18.4, treeTrunkMaterial);
addBox(1.2, 0.22, 0.22, -23.2, 2.5, -17.9, treeBranchMaterial);
addBox(0.8, 0.18, 0.18, -22.6, 2.9, -17.3, treeBranchMaterial);
addBox(1.9, 1.2, 1.7, -23.0, 3.2, -17.0, treeCanopyMaterial1);
addBox(1.5, 0.9, 1.4, -22.8, 3.4, -16.8, treeCanopyMaterial2);
addBox(1.0, 0.6, 1.0, -22.5, 3.5, -16.6, treeCanopyMaterial3);

// Additional Tree 5
addBox(0.7, 0.25, 0.7, -18.5, 0.12, -16.5, treeTrunkMaterial);
addBox(0.44, 2.0, 0.44, -18.5, 1.1, -16.5, treeTrunkMaterial);
addBox(0.38, 1.8, 0.38, -18.3, 2.8, -16.4, treeTrunkMaterial);
addBox(1.2, 0.22, 0.22, -17.7, 2.5, -15.9, treeBranchMaterial);
addBox(0.8, 0.18, 0.18, -17.1, 2.9, -15.3, treeBranchMaterial);
addBox(1.9, 1.2, 1.7, -17.5, 3.2, -15.0, treeCanopyMaterial1);
addBox(1.5, 0.9, 1.4, -17.3, 3.4, -14.8, treeCanopyMaterial2);
addBox(1.0, 0.6, 1.0, -17.0, 3.5, -14.6, treeCanopyMaterial3);

// Additional Tree 6
addBox(0.7, 0.25, 0.7, -20.5, 0.12, -14.0, treeTrunkMaterial);
addBox(0.44, 2.0, 0.44, -20.5, 1.1, -14.0, treeTrunkMaterial);
addBox(0.38, 1.8, 0.38, -20.3, 2.8, -13.9, treeTrunkMaterial);
addBox(1.2, 0.22, 0.22, -19.7, 2.5, -13.4, treeBranchMaterial);
addBox(0.8, 0.18, 0.18, -19.1, 2.9, -12.8, treeBranchMaterial);
addBox(1.9, 1.2, 1.7, -19.5, 3.2, -12.5, treeCanopyMaterial1);
addBox(1.5, 0.9, 1.4, -19.3, 3.4, -12.3, treeCanopyMaterial2);
addBox(1.0, 0.6, 1.0, -19.0, 3.5, -12.1, treeCanopyMaterial3);

// Additional Tree 7
addBox(0.7, 0.25, 0.7, -23.0, 0.12, -13.5, treeTrunkMaterial);
addBox(0.44, 2.0, 0.44, -23.0, 1.1, -13.5, treeTrunkMaterial);
addBox(0.38, 1.8, 0.38, -22.8, 2.8, -13.4, treeTrunkMaterial);
addBox(1.2, 0.22, 0.22, -22.2, 2.5, -12.9, treeBranchMaterial);
addBox(0.8, 0.18, 0.18, -21.6, 2.9, -12.3, treeBranchMaterial);
addBox(1.9, 1.2, 1.7, -22.0, 3.2, -12.0, treeCanopyMaterial1);
addBox(1.5, 0.9, 1.4, -21.8, 3.4, -11.8, treeCanopyMaterial2);
addBox(1.0, 0.6, 1.0, -21.5, 3.5, -11.6, treeCanopyMaterial3);

// Additional Tree 8
addBox(0.7, 0.25, 0.7, -21.0, 0.12, -19.0, treeTrunkMaterial);
addBox(0.44, 2.0, 0.44, -21.0, 1.1, -19.0, treeTrunkMaterial);
addBox(0.38, 1.8, 0.38, -20.8, 2.8, -18.9, treeTrunkMaterial);
addBox(1.2, 0.22, 0.22, -20.2, 2.5, -18.4, treeBranchMaterial);
addBox(0.8, 0.18, 0.18, -19.6, 2.9, -17.8, treeBranchMaterial);
addBox(1.9, 1.2, 1.7, -20.0, 3.2, -17.5, treeCanopyMaterial1);
addBox(1.5, 0.9, 1.4, -19.8, 3.4, -17.3, treeCanopyMaterial2);
addBox(1.0, 0.6, 1.0, -19.5, 3.5, -17.1, treeCanopyMaterial3);

    // Secondary slender birch tree in the distance
    // 4. Localized Window Sky & Clouds (Framed strictly behind west window apertures, occluded by house from exterior)
    // Sits at X = -27.0, spanning Z: -23.0 to -13.0, Y: 1.0 to 5.0 (well below roof and far behind facade Z = 0)
    // Sky backdrop removed (no sky render)
    addBox(0.2, 0.9, 2.6, -26.5, 4.0, -15.0, cloudMaterial); // Cloud in Window 1
    addBox(0.2, 0.9, 2.8, -26.5, 4.2, -21.0, cloudMaterial); // Cloud in Window 2



    // 7. Architectural Furniture: Credenza (Central Structural Column completely removed)
    // Modernist Credenza / Console on South Wall (X = -12.25, Z = -11.8)
    // Contact shadow beneath credenza
    addBox(1.2, 0.005, 4.0, -12.25, 0.002, -11.8, contactShadowMaterial);
    // Credenza base plinth & dark timber carcass
    addBox(0.8, 0.14, 3.6, -12.25, 0.07, -11.8, consoleMaterial);
    addBox(0.7, 0.75, 3.4, -12.25, 0.52, -11.8, consoleMaterial);
    addBox(0.68, 0.04, 3.3, -12.25, 0.52, -11.8, consoleMaterial); // Middle shelf
    // Design folios / book spines on shelves
    addBox(0.5, 0.28, 0.8, -12.25, 0.32, -12.8, consoleFolioMaterial1);
    addBox(0.5, 0.28, 0.6, -12.25, 0.32, -11.8, consoleFolioMaterial2);
    addBox(0.5, 0.28, 0.9, -12.25, 0.32, -10.9, consoleFolioMaterial1);

    // ─── LIVING ROOM PORTFOLIO OBJECTS (#769EFD VISUAL LANGUAGE) ───

    // 1. Resident's Dog Bed with Dog Toys (obj-dog-bed at X = -6.5, Z = -13.5)
    // Floor contact shadow beneath dog bed
    addBox(2.0, 0.005, 1.6, -6.5, 0.002, -13.5, contactShadowMaterial);
    // Bolster bed outer rim in deep interactive blue
    addBox(1.6, 0.26, 0.16, -6.5, 0.13, -12.82, interactiveDeep); // South rim
    addBox(1.6, 0.26, 0.16, -6.5, 0.13, -14.18, interactiveDeep); // North rim
    addBox(0.16, 0.26, 1.20, -7.22, 0.13, -13.5, interactiveDeep); // West rim
    addBox(0.16, 0.26, 1.20, -5.78, 0.13, -13.5, interactiveDeep); // East rim
    // Soft inner cushion in mid periwinkle
    addBox(1.28, 0.16, 1.20, -6.5, 0.08, -13.5, interactiveMid);
    // Real 3D Dog Toys in vibrant #769EFD
    // Toy 1: Squeaky chew bone
    addBox(0.38, 0.08, 0.12, -6.4, 0.18, -13.4, interactiveCore);
    addBox(0.10, 0.11, 0.22, -6.57, 0.18, -13.4, interactiveCore); // Bone knob left
    addBox(0.10, 0.11, 0.22, -6.23, 0.18, -13.4, interactiveCore); // Bone knob right
    // Toy 2: Textured rope knot ball
    addBox(0.16, 0.16, 0.16, -6.7, 0.19, -13.65, interactiveGlow);

    // 2. Low Architectural Sofa (obj-sofa at X = -11.5, Z = -18.0)
    // Floor contact shadow beneath sofa
    addBox(2.2, 0.005, 4.4, -11.5, 0.002, -18.0, contactShadowMaterial);
    // Dark timber modernist base plinth
    addBox(1.5, 0.32, 3.8, -11.5, 0.16, -18.0, consoleMaterial);
    // Deep backrest along west edge
    addBox(0.35, 0.65, 3.8, -12.08, 0.65, -18.0, interactiveDeep);
    // Armrest North
    addBox(1.5, 0.44, 0.26, -11.5, 0.54, -16.23, interactiveDeep);
    // Armrest South
    addBox(1.5, 0.44, 0.26, -11.5, 0.54, -19.77, interactiveDeep);
    // Upholstered seat cushions in mid periwinkle
    addBox(1.25, 0.20, 3.28, -11.38, 0.42, -18.0, interactiveMid);
    // Architectural accent throw pillow in vibrant #769EFD
    addBox(0.42, 0.18, 0.85, -11.35, 0.56, -17.2, interactiveCore);

    // 3. Cast Coffee Table & Workstation (obj-coffee-table at X = -9.2, Z = -18.0)
    // Floor contact shadow beneath coffee table
    addBox(1.8, 0.005, 3.0, -9.2, 0.002, -18.0, contactShadowMaterial);
    // Monolithic concrete low table
    addBox(1.2, 0.38, 2.4, -9.2, 0.19, -18.0, columnShaftMaterial);
    // Tabletop perimeter reveal trim in #769EFD
    addBox(1.24, 0.03, 2.44, -9.2, 0.395, -18.0, interactiveCore);
    // Recessed dark slate tabletop surface
    addBox(1.14, 0.02, 2.34, -9.2, 0.41, -18.0, columnPlinthMaterial);
    // Designer's Laptop open on table
    addBox(0.38, 0.03, 0.54, -9.1, 0.435, -17.8, columnPlinthMaterial); // Base
    addBox(0.03, 0.36, 0.54, -8.92, 0.60, -17.8, interactiveDeep);       // Screen frame
    addBox(0.02, 0.32, 0.50, -8.94, 0.60, -17.8, interactiveGlow);       // Screen glowing #769EFD
    // Design specimen tray with #769EFD accent
    addBox(0.28, 0.03, 0.42, -9.2, 0.435, -18.6, interactiveMid);
    addBox(0.12, 0.14, 0.12, -9.2, 0.50, -18.6, interactiveCore);
    // 5. Cetacean Communication Station Aquarium (obj-aquarium immediately to the RIGHT of sofa against North wall)
    // Floor contact shadow beneath aquarium cabinet
    addBox(1.70, 0.005, 0.70, -13.50, 0.002, -24.40, contactShadowMaterial);
    // Substantial base plinth & cabinet with signature interactive blue styling (#1e3570 / #4e7be8)
    addBox(1.60, 0.65, 0.60, -13.50, 0.325, -24.40, interactiveDeep);
    addBox(1.58, 0.04, 0.58, -13.50, 0.63, -24.40, interactiveMid);
    // Interactive blue frame bottom rim
    addBox(1.56, 0.08, 0.54, -13.50, 0.69, -24.40, interactiveMid);
    // Interactive blue frame top hood / cap in vibrant #769EFD
    addBox(1.56, 0.12, 0.54, -13.50, 1.84, -24.40, interactiveCore);
    // Vertical frame corner stiles in #769EFD
    addBox(0.08, 1.10, 0.08, -14.22, 1.25, -24.63, interactiveCore);
    addBox(0.08, 1.10, 0.08, -12.78, 1.25, -24.63, interactiveCore);
    addBox(0.08, 1.10, 0.08, -14.22, 1.25, -24.17, interactiveCore);
    addBox(0.08, 1.10, 0.08, -12.78, 1.25, -24.17, interactiveCore);

    // Primary interactive aquarium casing
    const aquariumFrame = addBox(1.52, 1.25, 0.50, -13.50, 1.25, -24.40, interactiveDeep);
    aquariumFrame.userData = { interactive: true, objId: "obj-aquarium" };

    // Water volume in vibrant #769EFD
    const aquariumWaterMat = new THREE.MeshLambertMaterial({
      color: 0x769efd,
      transparent: true,
      opacity: 0.55,
    });
    aquariumWater = addBox(1.42, 1.05, 0.42, -13.50, 1.25, -24.40, aquariumWaterMat);

    // Two swimming orange fish inside the aquarium
    const fishOrangeMat = new THREE.MeshLambertMaterial({ color: 0xff6600 });
    const fishGoldMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
    const fishFinMat = new THREE.MeshLambertMaterial({ color: 0xff4400 });

    // Fish 1 (Vibrant bright orange)
    fish1Group = new THREE.Group();
    fish1Group.position.set(-13.65, 1.30, -24.38);
    const fish1Body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.04), fishOrangeMat);
    fish1Group.add(fish1Body);
    const fish1Tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.11, 0.02), fishFinMat);
    fish1Tail.position.set(-0.10, 0, 0);
    fish1Group.add(fish1Tail);
    const fish1Dorsal = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.02), fishFinMat);
    fish1Dorsal.position.set(0.01, 0.045, 0);
    fish1Group.add(fish1Dorsal);
    houseGroup.add(fish1Group);

    // Fish 2 (Golden orange)
    fish2Group = new THREE.Group();
    fish2Group.position.set(-13.25, 1.18, -24.40);
    const fish2Body = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.06, 0.035), fishGoldMat);
    fish2Group.add(fish2Body);
    const fish2Tail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.02), fishOrangeMat);
    fish2Tail.position.set(-0.08, 0, 0);
    fish2Group.add(fish2Tail);
    const fish2Dorsal = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.02), fishOrangeMat);
    fish2Dorsal.position.set(0.01, 0.038, 0);
    fish2Group.add(fish2Dorsal);
    houseGroup.add(fish2Group);

    // Interior Aquatic Plants (tall organic kelp fronds & sea grasses)
    const aquaticPlant1 = new THREE.MeshLambertMaterial({ color: 0x245e52 });
    const aquaticPlant2 = new THREE.MeshLambertMaterial({ color: 0x367a68 });
    const aquaticPlant3 = new THREE.MeshLambertMaterial({ color: 0x4d9c86 });
    // Left cluster
    addBox(0.06, 0.65, 0.06, -14.05, 1.05, -24.42, aquaticPlant1);
    addBox(0.05, 0.80, 0.05, -13.95, 1.12, -24.38, aquaticPlant2);
    addBox(0.06, 0.50, 0.06, -13.85, 0.98, -24.44, aquaticPlant3);
    addBox(0.05, 0.35, 0.05, -13.75, 0.90, -24.36, aquaticPlant2);
    // Right cluster
    addBox(0.06, 0.70, 0.06, -12.95, 1.08, -24.42, aquaticPlant2);
    addBox(0.05, 0.85, 0.05, -13.05, 1.15, -24.38, aquaticPlant1);
    addBox(0.06, 0.55, 0.06, -13.15, 1.00, -24.45, aquaticPlant3);

    // Visible Whale Silhouette suspended inside the periwinkle water
    const whaleMaterial = new THREE.MeshLambertMaterial({ color: 0x141f33 });
    // Fusiform body (torso)
    addBox(0.50, 0.16, 0.04, -13.50, 1.32, -24.38, whaleMaterial);
    // Rostrum & rounded head
    addBox(0.18, 0.13, 0.04, -13.18, 1.30, -24.38, whaleMaterial);
    // Tapered caudal peduncle
    addBox(0.18, 0.09, 0.04, -13.82, 1.34, -24.38, whaleMaterial);
    // Caudal flukes (tail fin)
    addBox(0.06, 0.24, 0.04, -13.94, 1.36, -24.38, whaleMaterial);
    // Pectoral flipper angled downwards
    addBox(0.14, 0.04, 0.06, -13.40, 1.23, -24.36, whaleMaterial);
    // Dorsal fin
    addBox(0.08, 0.06, 0.04, -13.65, 1.42, -24.38, whaleMaterial);

    // Dedicated soft internal aquarium light
    const aquariumLight = new THREE.PointLight(0x769efd, 1.6, 4.5);
    aquariumLight.position.set(-13.50, 1.35, -24.35);
    scene.add(aquariumLight);

    // Interactive Artifacts Sparkle Particle System
    const sparkleAnchors = [
      { x: -13.50, y: 1.35, z: -24.38, rx: 0.70, ry: 0.50, rz: 0.25 }, // Aquarium
      { x: -2.48, y: 1.85, z: -8.0, rx: 0.10, ry: 0.75, rz: 0.60 },   // Portrait
      { x: 2.48, y: 1.85, z: -12.0, rx: 0.10, ry: 0.75, rz: 0.70 },   // Blueprint Map
      { x: -10.0, y: 2.20, z: -24.85, rx: 1.5, ry: 0.90, rz: 0.10 },  // Token Board
      { x: -9.2, y: 0.55, z: -18.0, rx: 0.60, ry: 0.25, rz: 0.90 },   // Laptop & Folio
      { x: -6.5, y: 0.50, z: -13.5, rx: 0.60, ry: 0.30, rz: 0.60 },   // Dog Bed
    ];

    const particlesPerAnchor = 16;
    const totalSparkleCount = sparkleAnchors.length * particlesPerAnchor;
    const sparklePositions = new Float32Array(totalSparkleCount * 3);
    sparkleBasePositions = [];
    sparklePhases = [];

    let spkIdx = 0;
    for (const anchor of sparkleAnchors) {
      for (let p = 0; p < particlesPerAnchor; p++) {
        const ox = (Math.random() - 0.5) * 2 * anchor.rx;
        const oy = (Math.random() - 0.5) * 2 * anchor.ry;
        const oz = (Math.random() - 0.5) * 2 * anchor.rz;
        const bx = anchor.x + ox;
        const by = anchor.y + oy;
        const bz = anchor.z + oz;
        sparklePositions[spkIdx * 3] = bx;
        sparklePositions[spkIdx * 3 + 1] = by;
        sparklePositions[spkIdx * 3 + 2] = bz;
        sparkleBasePositions.push({ x: bx, y: by, z: bz });
        sparklePhases.push(Math.random() * Math.PI * 2);
        spkIdx++;
      }
    }

    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));
    const sparkleMat = new THREE.PointsMaterial({
      size: 0.14,
      color: 0x98c5ff,
      transparent: true,
      opacity: 0.85,
    });
    sparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparklePoints);
    // 4. Component Token Board (obj-token-board on North wall at X = -10.0, Y = 2.2, Z = -24.85)
    // Drop shadow panel behind frame
    addBox(3.44, 2.14, 0.02, -10.0, 2.2, -24.98, interactiveShadow);
    // Substantial outer frame in deep interactive blue (#1e3570)
    addBox(3.40, 0.12, 0.12, -10.0, 3.25, -24.92, interactiveDeep); // Top rail
    addBox(3.40, 0.12, 0.12, -10.0, 1.15, -24.92, interactiveDeep); // Bottom rail
    addBox(0.12, 2.22, 0.12, -11.64, 2.2, -24.92, interactiveDeep); // Left stile
    addBox(0.12, 2.22, 0.12, -8.36, 2.2, -24.92, interactiveDeep);  // Right stile
    // Inner beveled fillet in mid periwinkle (#4e7be8)
    addBox(3.16, 0.08, 0.08, -10.0, 3.16, -24.90, interactiveMid);
    addBox(3.16, 0.08, 0.08, -10.0, 1.24, -24.90, interactiveMid);
    addBox(0.08, 1.98, 0.08, -11.54, 2.2, -24.90, interactiveMid);
    addBox(0.08, 1.98, 0.08, -8.46, 2.2, -24.90, interactiveMid);
    // Central matrix board backing
    addBox(3.0, 1.84, 0.04, -10.0, 2.2, -24.91, columnPlinthMaterial);
    // Pinned component token cells in #769EFD
    [-11.0, -10.5, -10.0, -9.5, -9.0].forEach((tx) => {
      [1.6, 2.2, 2.8].forEach((ty) => {
        addBox(0.36, 0.22, 0.05, tx, ty, -24.88, interactiveCore);
        addBox(0.28, 0.14, 0.06, tx, ty, -24.87, interactiveGlow);
      });
    });
    // Overhead token board picture light in #769EFD
    addBox(0.24, 0.08, 0.04, -10.0, 3.42, -24.96, interactiveDeep); // Wall rosette
    addBox(0.04, 0.04, 0.42, -10.0, 3.42, -24.75, interactiveCore); // Brass arm
    addBox(1.2, 0.08, 0.12, -10.0, 3.38, -24.54, interactiveCore);  // Lamp hood
    addBox(1.1, 0.02, 0.08, -10.0, 3.33, -24.54, interactiveGlow);  // Diffuser

    // ─── D. STUDY / HOME OFFICE (Across Hallway from Living Room at X: 2.8 to 11.8, Z: -23.0 to -13.0) ───
    const studyFloorMaterial = new THREE.MeshLambertMaterial({ color: 0x483a2c });
    const studyCeilingMaterial = new THREE.MeshLambertMaterial({ color: 0x2e2722 });
    const studyBeamMaterial = new THREE.MeshLambertMaterial({ color: 0x3d3024 });
    const studyWallMaterial = new THREE.MeshLambertMaterial({ color: 0x6e6659 }); // Matches Living Room plaster brightness for clean midtone rendering
    const studyBaseboardMaterial = new THREE.MeshLambertMaterial({ color: 0x28201a });
    const studyCrownMaterial = new THREE.MeshLambertMaterial({ color: 0x342a22 });

    // 1. Architecture: Floor & Ceiling
    // Study Floor (elevated planks level with hallway)
    addBox(9.0, 0.22, 10.0, 7.3, -0.01, -18.0, studyFloorMaterial);
    // Study Ceiling (height 4.2m)
    addBox(9.0, 0.20, 10.0, 7.3, 4.2, -18.0, studyCeilingMaterial);
    // Exposed Ceiling Beams in Study
    [-15.0, -18.0, -21.0].forEach((bz) => {
      addBox(8.7, 0.28, 0.24, 7.4, 4.05, bz, studyBeamMaterial);
    });

    // 2. Enclosing Perimeter Walls (Seamless, Non-Overlapping Geometry)
    // East Back Wall (X = 11.80)
    addBox(0.48, 4.2, 10.0, 11.80, 2.1, -18.0, studyWallMaterial);
    // North Wall (Z = -23.0, running from X = 3.04 to 11.80)
    addBox(8.76, 4.2, 0.48, 7.42, 2.1, -23.0, studyWallMaterial);
    // South Wall (Z = -13.0, running from X = 3.04 to 11.80, shared with Art Room)
    addBox(8.76, 4.2, 0.24, 7.42, 2.1, -13.0, studyWallMaterial);

    // West Partition Wall (Study side inner face at X = 3.04, thickness 0.24, back at X = 2.80)
    // Meets Hallway East wall at X = 2.80 with ZERO Z-fighting overlap!
    addBox(0.24, 4.2, 3.5, 2.92, 2.1, -14.75, studyWallMaterial); // South partition (Z: -13.0 to -16.5)
    addBox(0.24, 1.0, 3.0, 2.92, 3.7, -18.0, frameMaterial);      // Doorway lintel Study face (Z: -16.5 to -19.5)
    addBox(0.24, 4.2, 3.5, 2.92, 2.1, -21.25, studyWallMaterial); // North partition (Z: -19.5 to -23.0)

    // Study Interior Baseboards
    addBox(0.08, 0.18, 9.6, 11.52, 0.09, -18.0, studyBaseboardMaterial);  // East wall
    addBox(8.4, 0.18, 0.08, 7.4, 0.09, -22.72, studyBaseboardMaterial);   // North wall
    addBox(8.4, 0.18, 0.08, 7.4, 0.09, -13.28, studyBaseboardMaterial);   // South wall
    addBox(0.08, 0.18, 3.2, 3.08, 0.09, -14.8, studyBaseboardMaterial);   // West South partition
    addBox(0.08, 0.18, 3.2, 3.08, 0.09, -21.2, studyBaseboardMaterial);   // West North partition

    // Study Crown Moulding
    addBox(0.10, 0.14, 9.6, 11.51, 4.03, -18.0, studyCrownMaterial); // East
    addBox(8.4, 0.14, 0.10, 7.4, 4.03, -22.71, studyCrownMaterial);  // North
    addBox(8.4, 0.14, 0.10, 7.4, 4.03, -13.29, studyCrownMaterial);  // South
    addBox(0.10, 0.14, 3.2, 3.09, 4.03, -14.8, studyCrownMaterial);   // West South
    addBox(0.10, 0.14, 3.2, 3.09, 4.03, -21.2, studyCrownMaterial);   // West North

    // ─────────────────────────────────────────────────────────────
    // ARCHITECTURAL BOOKSHELF & INDIVIDUAL 3D BOOKS (North Wall, Non-Interactive)
    // ─────────────────────────────────────────────────────────────
    // Bookshelf materials with rich medium-to-dark brown finish contrasting wall (0x6e6659)
    const bookcaseWoodMat = new THREE.MeshLambertMaterial({ color: 0x483220 }); // Main walnut casework
    const bookcaseBackMat = new THREE.MeshLambertMaterial({ color: 0x382517 }); // Recessed dark shadow backing
    const bookcaseTrimMat = new THREE.MeshLambertMaterial({ color: 0x5a3f28 }); // Highlighted front edge trims
    const bookendMat = new THREE.MeshLambertMaterial({ color: 0x9c7a4b });      // Warm bronze architectural bookends

    // Distinct restrained book spine materials
    const bookRedMat = new THREE.MeshLambertMaterial({ color: 0x8f3429 });      // Muted crimson / leather red
    const bookTealMat = new THREE.MeshLambertMaterial({ color: 0x2e5e66 });     // Muted deep teal
    const bookNavyMat = new THREE.MeshLambertMaterial({ color: 0x253b5c });     // Deep oxford navy
    const bookOchreMat = new THREE.MeshLambertMaterial({ color: 0xb58438 });    // Warm aged ochre
    const bookCreamMat = new THREE.MeshLambertMaterial({ color: 0xd2c6a7 });    // Antique parchment cream
    const bookGreenMat = new THREE.MeshLambertMaterial({ color: 0x335439 });    // Forest / sage green
    const bookTerracottaMat = new THREE.MeshLambertMaterial({ color: 0x9e4e36 });// Warm terracotta
    const bookCharcoalMat = new THREE.MeshLambertMaterial({ color: 0x30363d }); // Dark slate charcoal

    // North Wall inner surface is at Z = -22.76. Bookshelf center X = 7.00.
    // 1. Recessed Back Panel (creates realistic interior bay depth behind books)
    addBox(3.92, 2.96, 0.04, 7.00, 1.55, -22.70, bookcaseBackMat);

    // 2. Base Plinth (rests solid on floor Y = 0.0)
    addBox(4.00, 0.16, 0.48, 7.00, 0.08, -22.48, bookcaseWoodMat);

    // 3. Vertical Outer Uprights (Gables) & Center Divider
    addBox(0.08, 3.08, 0.48, 5.04, 1.54, -22.48, bookcaseWoodMat); // West Upright (Left)
    addBox(0.08, 3.08, 0.48, 8.96, 1.54, -22.48, bookcaseWoodMat); // East Upright (Right)
    addBox(0.06, 2.92, 0.45, 7.00, 1.54, -22.49, bookcaseWoodMat); // Center Architectural Divider

    // 4. Top Cornice & Crown Header
    addBox(4.08, 0.14, 0.52, 7.00, 3.08, -22.47, bookcaseWoodMat);
    addBox(4.14, 0.05, 0.55, 7.00, 3.16, -22.46, bookcaseTrimMat); // Crown lip

    // 5. Horizontal Shelves & Visible Edge Facings
    // Shelf surface heights:
    // Shelf 1 (Bottom): Y = 0.16 (top Y = 0.185)
    // Shelf 2:          Y = 0.88 (top Y = 0.905)
    // Shelf 3:          Y = 1.60 (top Y = 1.625, eye level)
    // Shelf 4:          Y = 2.32 (top Y = 2.345)
    [0.16, 0.88, 1.60, 2.32].forEach((sy) => {
      // Main shelf slab
      addBox(3.92, 0.05, 0.43, 7.00, sy, -22.49, bookcaseWoodMat);
      // Highlighted front trim rail for crisp ASCII edge detection
      addBox(3.92, 0.06, 0.03, 7.00, sy, -22.26, bookcaseTrimMat);
    });

    // 6. Individual 3D Books & Horizontal Stacks
    // Helper for adding a vertical book on a shelf
    // Bookshelf faces +Z into the room. Spines face +Z.
    const addBook = (x: number, yShelfTop: number, h: number, w: number, mat: THREE.Material) => {
      // Depth of pages into shelf: 0.28m
      const depth = 0.28;
      addBox(w, h, depth, x, yShelfTop + h / 2, -22.46, mat);
    };

    // Helper for adding a horizontal book stack
    const addBookStack = (x: number, yShelfTop: number, books: { h: number; w: number; d: number; mat: THREE.Material }[]) => {
      let curY = yShelfTop;
      books.forEach((b) => {
        addBox(b.w, b.h, b.d, x, curY + b.h / 2, -22.46, b.mat);
        curY += b.h;
      });
    };

    // ── SHELF 1 (Bottom Shelf, yShelfTop = 0.185) ──
    // Left Bay: Hefty folios and encyclopedia volumes
    [
      { w: 0.11, h: 0.50, m: bookNavyMat },
      { w: 0.09, h: 0.47, m: bookNavyMat },
      { w: 0.10, h: 0.52, m: bookRedMat },
      { w: 0.08, h: 0.44, m: bookCharcoalMat },
      { w: 0.12, h: 0.51, m: bookGreenMat },
      { w: 0.09, h: 0.46, m: bookOchreMat },
      { w: 0.10, h: 0.48, m: bookNavyMat },
      { w: 0.08, h: 0.42, m: bookTerracottaMat },
      { w: 0.11, h: 0.49, m: bookTealMat },
      { w: 0.10, h: 0.45, m: bookRedMat },
    ].reduce((curX, b) => {
      addBook(curX + b.w / 2, 0.185, b.h, b.w, b.m);
      return curX + b.w + 0.01;
    }, 5.14);
    // Stack of 3 large horizontal art atlases on right side of Left Bay
    addBookStack(6.58, 0.185, [
      { w: 0.36, h: 0.075, d: 0.32, mat: bookNavyMat },
      { w: 0.34, h: 0.065, d: 0.30, mat: bookCreamMat },
      { w: 0.32, h: 0.060, d: 0.28, mat: bookRedMat },
    ]);

    // Right Bay: Archival volumes and reference collection
    addBookStack(7.28, 0.185, [
      { w: 0.34, h: 0.070, d: 0.30, mat: bookCharcoalMat },
      { w: 0.32, h: 0.065, d: 0.29, mat: bookOchreMat },
      { w: 0.30, h: 0.060, d: 0.28, mat: bookGreenMat },
    ]);
    [
      { w: 0.10, h: 0.48, m: bookOchreMat },
      { w: 0.08, h: 0.43, m: bookCreamMat },
      { w: 0.11, h: 0.51, m: bookRedMat },
      { w: 0.09, h: 0.45, m: bookTealMat },
      { w: 0.10, h: 0.47, m: bookNavyMat },
      { w: 0.08, h: 0.40, m: bookGreenMat },
      { w: 0.12, h: 0.52, m: bookTerracottaMat },
      { w: 0.09, h: 0.44, m: bookCharcoalMat },
      { w: 0.10, h: 0.48, m: bookNavyMat },
      { w: 0.08, h: 0.42, m: bookCreamMat },
    ].reduce((curX, b) => {
      addBook(curX + b.w / 2, 0.185, b.h, b.w, b.m);
      return curX + b.w + 0.01;
    }, 7.70);

    // ── SHELF 2 (Middle Shelf, yShelfTop = 0.905) ──
    // Left Bay: Mixed monographs, histories and journals
    [
      { w: 0.08, h: 0.42, m: bookTealMat },
      { w: 0.07, h: 0.36, m: bookOchreMat },
      { w: 0.09, h: 0.44, m: bookCreamMat },
      { w: 0.06, h: 0.32, m: bookRedMat },
      { w: 0.08, h: 0.39, m: bookNavyMat },
      { w: 0.07, h: 0.35, m: bookGreenMat },
      { w: 0.09, h: 0.41, m: bookTerracottaMat },
      { w: 0.06, h: 0.33, m: bookTealMat },
      { w: 0.08, h: 0.38, m: bookCreamMat },
      { w: 0.10, h: 0.45, m: bookNavyMat },
      { w: 0.07, h: 0.34, m: bookOchreMat },
      { w: 0.08, h: 0.40, m: bookRedMat },
    ].reduce((curX, b) => {
      addBook(curX + b.w / 2, 0.905, b.h, b.w, b.m);
      return curX + b.w + 0.01;
    }, 5.14);
    addBookStack(6.60, 0.905, [
      { w: 0.28, h: 0.055, d: 0.26, mat: bookCreamMat },
      { w: 0.26, h: 0.050, d: 0.25, mat: bookNavyMat },
      { w: 0.24, h: 0.045, d: 0.24, mat: bookTealMat },
    ]);

    // Right Bay: Classic design and typography literature
    [
      { w: 0.08, h: 0.38, m: bookCreamMat },
      { w: 0.09, h: 0.44, m: bookNavyMat },
      { w: 0.07, h: 0.34, m: bookOchreMat },
      { w: 0.08, h: 0.41, m: bookRedMat },
      { w: 0.06, h: 0.31, m: bookGreenMat },
      { w: 0.09, h: 0.43, m: bookTealMat },
      { w: 0.07, h: 0.36, m: bookTerracottaMat },
      { w: 0.08, h: 0.39, m: bookNavyMat },
      { w: 0.09, h: 0.42, m: bookCreamMat },
      { w: 0.06, h: 0.30, m: bookCharcoalMat },
      { w: 0.08, h: 0.37, m: bookOchreMat },
      { w: 0.07, h: 0.35, m: bookRedMat },
      { w: 0.09, h: 0.40, m: bookGreenMat },
    ].reduce((curX, b) => {
      addBook(curX + b.w / 2, 0.905, b.h, b.w, b.m);
      return curX + b.w + 0.01;
    }, 7.14);
    // Bronze architectural bookend at right end of bay
    addBox(0.06, 0.20, 0.22, 8.78, 0.905 + 0.10, -22.46, bookendMat);

    // ── SHELF 3 (Eye-Level Shelf, yShelfTop = 1.625) ──
    // Left Bay: Philosophy, architecture and engineering treatises
    [
      { w: 0.08, h: 0.40, m: bookOchreMat },
      { w: 0.09, h: 0.45, m: bookNavyMat },
      { w: 0.07, h: 0.35, m: bookCreamMat },
      { w: 0.08, h: 0.38, m: bookTerracottaMat },
      { w: 0.06, h: 0.30, m: bookGreenMat },
      { w: 0.09, h: 0.43, m: bookTealMat },
      { w: 0.08, h: 0.39, m: bookRedMat },
      { w: 0.07, h: 0.34, m: bookCreamMat },
      { w: 0.08, h: 0.37, m: bookCharcoalMat },
      { w: 0.09, h: 0.42, m: bookNavyMat },
      { w: 0.07, h: 0.33, m: bookOchreMat },
    ].reduce((curX, b) => {
      addBook(curX + b.w / 2, 1.625, b.h, b.w, b.m);
      return curX + b.w + 0.01;
    }, 5.14);
    // Stack of 3 journals
    addBookStack(6.46, 1.625, [
      { w: 0.28, h: 0.055, d: 0.26, mat: bookTealMat },
      { w: 0.26, h: 0.050, d: 0.25, mat: bookOchreMat },
      { w: 0.24, h: 0.045, d: 0.24, mat: bookNavyMat },
    ]);
    // Leaning book against the stack
    addBook(6.80, 1.625, 0.36, 0.08, bookRedMat);

    // Right Bay: Contemporary computing and theory series
    addBookStack(7.26, 1.625, [
      { w: 0.30, h: 0.060, d: 0.26, mat: bookRedMat },
      { w: 0.28, h: 0.050, d: 0.25, mat: bookCreamMat },
    ]);
    [
      { w: 0.08, h: 0.38, m: bookNavyMat },
      { w: 0.07, h: 0.34, m: bookTealMat },
      { w: 0.09, h: 0.42, m: bookOchreMat },
      { w: 0.08, h: 0.39, m: bookCreamMat },
      { w: 0.06, h: 0.31, m: bookGreenMat },
      { w: 0.09, h: 0.44, m: bookTerracottaMat },
      { w: 0.07, h: 0.36, m: bookNavyMat },
      { w: 0.08, h: 0.40, m: bookRedMat },
      { w: 0.09, h: 0.43, m: bookTealMat },
      { w: 0.07, h: 0.35, m: bookCreamMat },
      { w: 0.08, h: 0.37, m: bookCharcoalMat },
      { w: 0.08, h: 0.39, m: bookOchreMat },
    ].reduce((curX, b) => {
      addBook(curX + b.w / 2, 1.625, b.h, b.w, b.m);
      return curX + b.w + 0.01;
    }, 7.62);

    // ── SHELF 4 (Upper Shelf, yShelfTop = 2.345) ──
    // Archival binders and collections
    [
      { w: 0.10, h: 0.46, m: bookCreamMat },
      { w: 0.09, h: 0.42, m: bookNavyMat },
      { w: 0.11, h: 0.48, m: bookCharcoalMat },
      { w: 0.08, h: 0.38, m: bookGreenMat },
      { w: 0.10, h: 0.45, m: bookOchreMat },
      { w: 0.09, h: 0.41, m: bookRedMat },
      { w: 0.10, h: 0.47, m: bookTealMat },
      { w: 0.08, h: 0.39, m: bookNavyMat },
    ].reduce((curX, b) => {
      addBook(curX + b.w / 2, 2.345, b.h, b.w, b.m);
      return curX + b.w + 0.01;
    }, 5.16);

    [
      { w: 0.09, h: 0.42, m: bookTealMat },
      { w: 0.10, h: 0.45, m: bookRedMat },
      { w: 0.08, h: 0.37, m: bookNavyMat },
      { w: 0.11, h: 0.48, m: bookCreamMat },
      { w: 0.09, h: 0.40, m: bookOchreMat },
      { w: 0.10, h: 0.44, m: bookGreenMat },
      { w: 0.08, h: 0.38, m: bookTerracottaMat },
    ].reduce((curX, b) => {
      addBook(curX + b.w / 2, 2.345, b.h, b.w, b.m);
      return curX + b.w + 0.01;
    }, 7.20);
    addBookStack(8.36, 2.345, [
      { w: 0.32, h: 0.060, d: 0.28, mat: bookNavyMat },
      { w: 0.30, h: 0.055, d: 0.27, mat: bookCreamMat },
    ]);

    // ─────────────────────────────────────────────────────────────
    // TALL ARCHITECTURAL FLOOR LAMP (North-East Rear Corner, against wall intersection)
    // ─────────────────────────────────────────────────────────────
    // Placed in the rear corner where North Wall (Z = -22.76) meets East Wall (X = 11.56)
    // Center at X = 11.08, Z = -22.28 (clear of baseboards, fully inside room, clear of collision & furniture)
    const floorLampBaseMat = new THREE.MeshLambertMaterial({ color: 0x221f1b });
    const floorLampStemMat = new THREE.MeshLambertMaterial({ color: 0xd4b86a });
    const floorLampShadeMat = new THREE.MeshLambertMaterial({
      color: 0xfff4e6,
      emissive: 0xffddaa,
      emissiveIntensity: 0.8,
    });
    const floorLampGlowMat = new THREE.MeshLambertMaterial({
      color: 0xffeedd,
      emissive: 0xffddaa,
      emissiveIntensity: 1.5,
    });
    // 1. Heavy circular/square plinth base resting firmly on floor (Y = 0.0 to 0.08)
    addBox(0.60, 0.08, 0.60, 11.08, 0.04, -22.28, floorLampBaseMat);
    addBox(0.40, 0.05, 0.40, 11.08, 0.10, -22.28, floorLampStemMat);
    // 2. Tall slender vertical brass stem rising 2.20m high (thickness 0.10m for solid ASCII presence)
    addBox(0.10, 2.16, 0.10, 11.08, 1.20, -22.28, floorLampStemMat);
    // 3. Brass fitter collar & harp
    addBox(0.20, 0.10, 0.20, 11.08, 2.32, -22.28, floorLampStemMat);
    // 4. Large architectural linen shade (Y = 2.37 to 2.97m, height 0.60m, width 0.76m, towering clearly above desk & chair)
    addBox(0.76, 0.60, 0.76, 11.08, 2.67, -22.28, floorLampShadeMat);
    // Top and bottom brass shade trim rings
    addBox(0.78, 0.04, 0.78, 11.08, 2.97, -22.28, floorLampStemMat);
    addBox(0.78, 0.04, 0.78, 11.08, 2.37, -22.28, floorLampStemMat);
    // 5. Inner luminous bulb glow radiating light
    addBox(0.52, 0.46, 0.52, 11.08, 2.67, -22.28, floorLampGlowMat);

    // 3. Environmental Furniture (Strictly Non-Interactive)
    const deskWoodMaterial = new THREE.MeshLambertMaterial({ color: 0x3d2a1b });
    const deskTopMaterial = new THREE.MeshLambertMaterial({ color: 0x4c3522 });
    const deskHardwareMaterial = new THREE.MeshLambertMaterial({ color: 0xd4b86a });
    const chairWoodMaterial = new THREE.MeshLambertMaterial({ color: 0x362316 });
    const chairLeatherMaterial = new THREE.MeshLambertMaterial({ color: 0x261d19 });
    const cpuCaseMaterial = new THREE.MeshLambertMaterial({ color: 0x484b52 });
    const monitorBezelMaterial = new THREE.MeshLambertMaterial({ color: 0x3e4147 });
    const keyboardMaterial = new THREE.MeshLambertMaterial({ color: 0x484b52 });
    const keycapMaterial = new THREE.MeshLambertMaterial({ color: 0x2e3036 });
    const mousePadMaterial = new THREE.MeshLambertMaterial({ color: 0x1e2024 });
    const mouseMaterial = new THREE.MeshLambertMaterial({ color: 0x3e4147 });
    const deskLampMaterial = new THREE.MeshLambertMaterial({ color: 0xd4b86a });
    const deskLampShadeMaterial = new THREE.MeshLambertMaterial({ color: 0x20452d });

    // Substantial Executive Walnut Desk (Center at X = 8.5, Z = -18.0)
    addBox(1.05, 0.06, 2.45, 8.5, 0.76, -18.0, deskTopMaterial);
    // Left drawer pedestal (South: Z = -17.2, X = 8.5)
    addBox(0.92, 0.72, 0.58, 8.5, 0.36, -17.2, deskWoodMaterial);
    [0.16, 0.38, 0.60].forEach((dy) => {
      addBox(0.02, 0.18, 0.50, 8.03, dy, -17.2, deskTopMaterial);
      addBox(0.03, 0.03, 0.14, 8.01, dy, -17.2, deskHardwareMaterial);
    });
    // Right drawer pedestal (North: Z = -18.8, X = 8.5)
    addBox(0.92, 0.72, 0.58, 8.5, 0.36, -18.8, deskWoodMaterial);
    [0.16, 0.38, 0.60].forEach((dy) => {
      addBox(0.02, 0.18, 0.50, 8.03, dy, -18.8, deskTopMaterial);
      addBox(0.03, 0.03, 0.14, 8.01, dy, -18.8, deskHardwareMaterial);
    });
    // Modesty panel
    addBox(0.04, 0.55, 1.05, 8.85, 0.45, -18.0, deskWoodMaterial);

    // Matching Executive Office Chair (Behind desk at X = 9.35, Z = -18.0, facing West)
    addBox(0.55, 0.04, 0.55, 9.35, 0.06, -18.0, chairWoodMaterial);
    addBox(0.08, 0.38, 0.08, 9.35, 0.25, -18.0, chairWoodMaterial);
    addBox(0.54, 0.10, 0.54, 9.35, 0.48, -18.0, chairLeatherMaterial);
    addBox(0.10, 0.68, 0.50, 9.58, 0.84, -18.0, chairLeatherMaterial);
    addBox(0.38, 0.06, 0.08, 9.35, 0.64, -17.72, chairWoodMaterial);
    addBox(0.38, 0.06, 0.08, 9.35, 0.64, -18.28, chairWoodMaterial);

    // Desk Accessories (CPU Tower, Keyboard, Mouse, Banker's Lamp - All Non-Interactive)
    addBox(0.45, 0.56, 0.22, 8.6, 1.08, -17.15, cpuCaseMaterial);
    addBox(0.02, 0.06, 0.16, 8.36, 1.25, -17.15, keycapMaterial);
    addBox(0.02, 0.04, 0.12, 8.36, 1.15, -17.15, keycapMaterial);
    addBox(0.02, 0.02, 0.02, 8.36, 0.95, -17.10, lampGlowMaterial);
    addBox(0.18, 0.025, 0.52, 8.28, 0.805, -18.0, keyboardMaterial);
    addBox(0.14, 0.015, 0.48, 8.28, 0.822, -18.0, keycapMaterial);
    addBox(0.24, 0.005, 0.28, 8.32, 0.795, -17.55, mousePadMaterial);
    addBox(0.12, 0.035, 0.07, 8.32, 0.815, -17.55, mouseMaterial);
    addBox(0.20, 0.03, 0.20, 8.65, 0.81, -18.85, deskLampMaterial);
    addBox(0.04, 0.38, 0.04, 8.65, 1.00, -18.85, deskLampMaterial);
    addBox(0.14, 0.10, 0.26, 8.55, 1.20, -18.85, deskLampShadeMaterial);
    addBox(0.08, 0.03, 0.18, 8.55, 1.14, -18.85, lampGlowMaterial);

    // 4. Interactive Desktop Computer Workstation (Screen in #769EFD)
    const computerScreenMaterial = new THREE.MeshLambertMaterial({
      color: 0x769efd,
      emissive: 0x224294,
      emissiveIntensity: 0.85,
    });
    // Monitor Stand & Housing
    addBox(0.24, 0.03, 0.28, 8.55, 0.805, -18.0, monitorBezelMaterial);
    addBox(0.08, 0.22, 0.10, 8.55, 0.92, -18.0, monitorBezelMaterial);
    addBox(0.24, 0.48, 0.66, 8.55, 1.24, -18.0, monitorBezelMaterial);
    // Interactive Monitor Screen (Facing West towards player, finished in #769EFD)
    addBox(0.02, 0.40, 0.58, 8.42, 1.24, -18.0, computerScreenMaterial);
    // Screen Bezel Trim
    addBox(0.04, 0.48, 0.04, 8.44, 1.24, -17.69, monitorBezelMaterial);
    addBox(0.04, 0.48, 0.04, 8.44, 1.24, -18.31, monitorBezelMaterial);
    addBox(0.04, 0.04, 0.66, 8.44, 1.46, -18.0, monitorBezelMaterial);
    addBox(0.04, 0.04, 0.66, 8.44, 1.02, -18.0, monitorBezelMaterial);

    // ─── E. THE ART ROOM (STUDIO & GALLERY WALL) ───
    // Directly adjacent to Study at X: 2.8 to 11.8, Z: -13.0 to -3.0, Height: 4.2m
    const studioFloorMaterial = new THREE.MeshLambertMaterial({ color: 0x4e3e30 });
    const studioCeilingMaterial = new THREE.MeshLambertMaterial({ color: 0x2e2722 });
    const studioBeamMaterial = new THREE.MeshLambertMaterial({ color: 0x3d3024 });
    const studioWallMaterial = new THREE.MeshLambertMaterial({ color: 0x726a5c }); // Warm studio plaster
    const studioBaseboardMaterial = new THREE.MeshLambertMaterial({ color: 0x28201a });
    const studioCrownMaterial = new THREE.MeshLambertMaterial({ color: 0x342a22 });

    // Studio Floor & Ceiling (matching hallway elevation and 4.2m ceiling height)
    addBox(9.0, 0.22, 10.0, 7.3, -0.01, -8.0, studioFloorMaterial);
    addBox(9.0, 0.20, 10.0, 7.3, 4.2, -8.0, studioCeilingMaterial);

    // Studio Exposed Ceiling Beams (converging perspective across X)
    [-4.5, -6.8, -9.2, -11.5].forEach((bz) => {
      addBox(8.7, 0.28, 0.24, 7.4, 4.05, bz, studioBeamMaterial);
    });

    // Art Room Perimeter Walls
    // North Partition Wall (shared with Study at Z = -13.0, inner studio face at Z = -12.88)
    // South Outer Wall (at Z = -3.0)
    addBox(8.76, 4.2, 0.48, 7.42, 2.1, -3.0, studioWallMaterial);

    // West Partition Wall (inner face towards Hallway, split for doorway at Z = -7.5, width 2.6)
    addBox(0.24, 4.2, 3.2, 2.92, 2.1, -4.6, studioWallMaterial);   // South segment (Z: -3.0 to -6.2)
    addBox(0.24, 1.0, 2.6, 2.92, 3.7, -7.5, frameMaterial);        // Doorway lintel inner face (Z: -6.2 to -8.8)
    addBox(0.24, 4.2, 4.2, 2.92, 2.1, -10.9, studioWallMaterial);  // North segment (Z: -8.8 to -13.0)

    // East Outer Wall (at X = 11.8) WITH WALKWAY-FACING WINDOW (centered at Z = -8.0, 3.2m wide, 2.4m high)
    const windowCasingMaterial = new THREE.MeshLambertMaterial({ color: 0x342a22 });
    const windowMullionMaterial = new THREE.MeshLambertMaterial({ color: 0x241d17 });
    const glassMaterial = new THREE.MeshLambertMaterial({
      color: 0x90a8b8,
      transparent: true,
      opacity: 0.15,
    });

    addBox(0.48, 4.2, 3.4, 11.80, 2.1, -4.7, studioWallMaterial);   // South of window (Z: -3.0 to -6.4)
    addBox(0.48, 4.2, 3.4, 11.80, 2.1, -11.3, studioWallMaterial);  // North of window (Z: -9.6 to -13.0)
    addBox(0.48, 0.9, 3.2, 11.80, 0.45, -8.0, studioWallMaterial);  // Wall below window sill (Y: 0.0 to 0.9)
    addBox(0.48, 0.9, 3.2, 11.80, 3.75, -8.0, studioWallMaterial);  // Wall above window lintel (Y: 3.3 to 4.2)

    // Window Architectural Framework (Deep sill, casing, lintel, mullions)
    addBox(0.60, 0.08, 3.35, 11.80, 0.91, -8.0, windowCasingMaterial);  // Window sill
    addBox(0.60, 0.08, 3.35, 11.80, 3.29, -8.0, windowCasingMaterial);  // Window lintel casing
    addBox(0.60, 2.40, 0.10, 11.80, 2.10, -6.4, windowCasingMaterial);  // South jamb casing
    addBox(0.60, 2.40, 0.10, 11.80, 2.10, -9.6, windowCasingMaterial);  // North jamb casing
    // Window mullions (crossbars creating multi-pane studio window)
    addBox(0.48, 2.38, 0.06, 11.80, 2.10, -8.0, windowMullionMaterial); // Vertical mullion
    addBox(0.48, 0.06, 3.18, 11.80, 2.10, -8.0, windowMullionMaterial); // Horizontal transom
    // Clear glass pane allowing two-way sightline between exterior walkway and studio
    addBox(0.04, 2.36, 3.16, 11.80, 2.10, -8.0, glassMaterial);

    // Studio Interior Baseboards & Crown Moulding
    addBox(8.4, 0.18, 0.08, 7.4, 0.09, -12.82, studioBaseboardMaterial); // North gallery wall baseboard
    addBox(8.4, 0.18, 0.08, 7.4, 0.09, -3.26, studioBaseboardMaterial);  // South wall baseboard
    addBox(0.08, 0.18, 3.1, 3.08, 0.09, -4.6, studioBaseboardMaterial);   // West South partition baseboard
    addBox(0.08, 0.18, 4.1, 3.08, 0.09, -10.9, studioBaseboardMaterial);  // West North partition baseboard
    addBox(0.08, 0.18, 3.3, 11.52, 0.09, -4.7, studioBaseboardMaterial);  // East South baseboard
    addBox(0.08, 0.18, 3.3, 11.52, 0.09, -11.3, studioBaseboardMaterial); // East North baseboard

    addBox(8.4, 0.14, 0.10, 7.4, 4.03, -12.83, studioCrownMaterial); // North
    addBox(8.4, 0.14, 0.10, 7.4, 4.03, -3.27, studioCrownMaterial);  // South
    addBox(0.10, 0.14, 3.1, 3.09, 4.03, -4.6, studioCrownMaterial);   // West South
    addBox(0.10, 0.14, 4.1, 3.09, 4.03, -10.9, studioCrownMaterial);  // West North
    addBox(0.10, 0.14, 9.6, 11.51, 4.03, -8.0, studioCrownMaterial);  // East

    // Exterior Stone Walkway alongside East side of the house
    const stoneWalkwayMaterial = new THREE.MeshLambertMaterial({ color: 0x5a544c });
    const stoneCurbMaterial = new THREE.MeshLambertMaterial({ color: 0x3d3934 });
    const stoneLanternMaterial = new THREE.MeshLambertMaterial({ color: 0x2f2b26 });
    const lanternGlowMaterial = new THREE.MeshLambertMaterial({
      color: 0xffe2b0,
      emissive: 0xdd9944,
      emissiveIntensity: 0.9,
    });

    // Paved stone walkway surface (X: 11.8 to 14.2, Z: -14.0 to 2.5)
    addBox(2.4, 0.06, 16.5, 13.0, 0.02, -5.75, stoneWalkwayMaterial);
    // Outer stone curb edging (X = 14.22)
    addBox(0.12, 0.12, 16.5, 14.22, 0.05, -5.75, stoneCurbMaterial);
    // Low stone garden lanterns along walkway
    [-1.0, -5.5, -10.5].forEach((lz) => {
      addBox(0.32, 0.65, 0.32, 13.6, 0.33, lz, stoneLanternMaterial);
      addBox(0.24, 0.22, 0.24, 13.6, 0.72, lz, lanternGlowMaterial);
      addBox(0.38, 0.08, 0.38, 13.6, 0.86, lz, stoneLanternMaterial);
    });

    // ─── GALLERY WALL OF 7 SIGNATURE BLUE FRAMES (#769EFD) ───
    const blueFrameMaterial = new THREE.MeshLambertMaterial({
      color: 0x769efd,
      emissive: 0x224294,
      emissiveIntensity: 0.75,
    });
    const emptyCanvasMatte = new THREE.MeshLambertMaterial({
      color: 0xf5f3ee,
      emissive: 0xd8d4cb,
      emissiveIntensity: 0.35,
    });
    // Dark velvet matte for filled frames to ensure 0 ASCII bleed through or behind images
    const darkBackingMatte = new THREE.MeshLambertMaterial({
      color: 0x010101,
      emissive: 0x000000,
    });
    const frameInnerShadow = new THREE.MeshLambertMaterial({ color: 0x13265c });
    const frameWireMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });

    GALLERY_FRAMES.forEach((gf) => {
      const [fx, fy, fz] = gf.position;
      const fw = gf.width;
      const fh = gf.height;
      const fd = gf.depth || 0.10;
      const border = 0.09; // Frame border width

      // Top molding
      addBox(fw, border, fd, fx, fy + fh / 2 - border / 2, fz, blueFrameMaterial);
      // Bottom molding
      addBox(fw, border, fd, fx, fy - fh / 2 + border / 2, fz, blueFrameMaterial);
      // Left molding
      addBox(border, fh - border * 2, fd, fx - fw / 2 + border / 2, fy, fz, blueFrameMaterial);
      // Right molding
      addBox(border, fh - border * 2, fd, fx + fw / 2 - border / 2, fy, fz, blueFrameMaterial);

      // Inner shadow bezel
      addBox(fw - border * 1.6, fh - border * 1.6, 0.04, fx, fy, fz - 0.01, frameInnerShadow);

      // Mount Backing (archival white for empty slots, pitch-black matte for filled slots to avoid ASCII bleed)
      addBox(
        fw - border * 2,
        fh - border * 2,
        0.02,
        fx,
        fy,
        fz - 0.02,
        gf.imagePath ? darkBackingMatte : emptyCanvasMatte
      );

      // Top hanging bracket
      addBox(0.04, 0.08, 0.02, fx, fy + fh / 2 + 0.04, fz - 0.02, frameWireMaterial);

      // Dedicated 3D Artwork Canvas Mesh (Native WebGL textured plane converted to ASCII)
      if (gf.imagePath) {
        const texture = textureLoader.load(gf.imagePath);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;

        const innerW = fw - border * 2;
        const innerH = fh - border * 2;

        const artGeo = new THREE.PlaneGeometry(innerW, innerH);
        const artMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.FrontSide,
          depthWrite: true,
        });

        const artMesh = new THREE.Mesh(artGeo, artMat);
        // Positioned at z = -12.76, resting flush inside the signature blue molding
        artMesh.position.set(fx, fy, -12.76);
        artMesh.userData = {
          isGalleryArtwork: true,
          frameId: gf.id,
          destinationUrl: gf.destinationUrl,
          title: gf.title,
        };
        houseGroup.add(artMesh);
        galleryArtMeshes.push(artMesh);
      }
    });

    // ─── STUDIO FURNITURE & LIVED-IN ELEMENTS (Strictly Non-Interactive) ───
    const studioWoodMaterial = new THREE.MeshLambertMaterial({ color: 0x6c4e32 });
    const studioLightWoodMaterial = new THREE.MeshLambertMaterial({ color: 0x9b7b56 });
    const canvasMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f0e6 });
    const canvasEdgeMaterial = new THREE.MeshLambertMaterial({ color: 0x9e7e59 });
    const paletteWoodMaterial = new THREE.MeshLambertMaterial({ color: 0xb59265 });
    const corkMaterial = new THREE.MeshLambertMaterial({ color: 0xa48054 });
    const paperWhiteMaterial = new THREE.MeshLambertMaterial({ color: 0xded8ce });
    const paperSketchMaterial = new THREE.MeshLambertMaterial({ color: 0xc8c0b2 });
    const brushJarMaterial = new THREE.MeshLambertMaterial({ color: 0x364a5c });
    const metalFerruleMaterial = new THREE.MeshLambertMaterial({ color: 0xb0b0b0 });
    const brushBristleMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });

    // 1. Large Artist Easel with Primed Stretched Canvas & Mixing Palette (X = 9.2, Z = -9.8)
    // Easel A-frame legs
    addBox(0.06, 2.10, 0.06, 8.85, 1.05, -9.60, studioLightWoodMaterial);
    addBox(0.06, 2.10, 0.06, 9.55, 1.05, -9.60, studioLightWoodMaterial);
    addBox(0.06, 2.15, 0.06, 9.20, 1.05, -10.25, studioLightWoodMaterial); // Rear diagonal leg
    // Center mast
    addBox(0.08, 2.35, 0.06, 9.20, 1.20, -9.65, studioLightWoodMaterial);
    // Lower crank shelf tray
    addBox(0.95, 0.05, 0.22, 9.20, 1.05, -9.60, studioWoodMaterial);
    // Signature Blue Canvas on easel (1.1m x 0.9m in signature blue #769EFD)
    const easelCanvasMaterial = new THREE.MeshLambertMaterial({
      color: 0x769efd,
      emissive: 0x224294,
      emissiveIntensity: 0.55,
    });
    const easelCanvasMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.10, 0.90, 0.04),
      easelCanvasMaterial
    );
    easelCanvasMesh.position.set(9.20, 1.55, -9.56);
    easelCanvasMesh.userData = {
      isEaselCanvas: true,
      objectId: "obj-studio-easel",
    };
    houseGroup.add(easelCanvasMesh);
    galleryArtMeshes.push(easelCanvasMesh);
    addBox(1.12, 0.92, 0.02, 9.20, 1.55, -9.58, canvasEdgeMaterial);
    // Wooden palette on easel shelf
    addBox(0.42, 0.015, 0.28, 8.95, 1.08, -9.55, paletteWoodMaterial);
    // Paint dabs on palette
    const paintDabs = [0xb82828, 0x1848a0, 0xd4a020, 0x207850, 0xffffff, 0xe06020];
    paintDabs.forEach((pcol, i) => {
      addBox(0.03, 0.01, 0.03, 8.85 + i * 0.04, 1.09, -9.55, new THREE.MeshLambertMaterial({ color: pcol }));
    });

    // 2. Heavy Joinery Artist Worktable (Center X = 6.8, Z = -6.2)
    // Table Top (2.4m x 1.1m x 0.08m at Y = 0.78)
    addBox(2.40, 0.08, 1.10, 6.80, 0.78, -6.20, studioWoodMaterial);
    // Four heavy block legs
    [5.80, 7.80].forEach((lx) => {
      [-5.80, -6.60].forEach((lz) => {
        addBox(0.12, 0.74, 0.12, lx, 0.37, lz, studioWoodMaterial);
      });
    });
    // Table cross stretchers
    addBox(2.00, 0.06, 0.08, 6.80, 0.22, -5.80, studioWoodMaterial);
    addBox(2.00, 0.06, 0.08, 6.80, 0.22, -6.60, studioWoodMaterial);

    // Studio Clutter & Art Supplies on Worktable
    // Large open sketchbook with thick paper pages
    addBox(0.48, 0.03, 0.36, 6.30, 0.83, -6.10, paperWhiteMaterial);
    addBox(0.44, 0.01, 0.32, 6.30, 0.845, -6.10, paperSketchMaterial);
    // Stack of closed hardcover sketchbooks
    addBox(0.35, 0.06, 0.26, 7.20, 0.85, -6.35, new THREE.MeshLambertMaterial({ color: 0x26384a }));
    addBox(0.32, 0.05, 0.24, 7.20, 0.90, -6.35, new THREE.MeshLambertMaterial({ color: 0x4a2e26 }));

    // Mason jar holding paintbrushes
    addBox(0.14, 0.18, 0.14, 7.70, 0.91, -6.00, brushJarMaterial);
    // 5 Assorted paintbrushes sticking out
    [-0.04, -0.02, 0.0, 0.02, 0.04].forEach((boff, bi) => {
      const bh = 0.32 + (bi % 3) * 0.06;
      addBox(0.015, bh, 0.015, 7.70 + boff, 0.95 + bh / 2, -6.00 + (bi % 2 === 0 ? 0.02 : -0.02), studioLightWoodMaterial);
      addBox(0.018, 0.04, 0.018, 7.70 + boff, 0.95 + bh - 0.04, -6.00 + (bi % 2 === 0 ? 0.02 : -0.02), metalFerruleMaterial);
      addBox(0.016, 0.05, 0.016, 7.70 + boff, 0.95 + bh, -6.00 + (bi % 2 === 0 ? 0.02 : -0.02), brushBristleMaterial);
    });

    // Palette knife can & charcoal sticks
    addBox(0.11, 0.14, 0.11, 7.50, 0.89, -6.40, new THREE.MeshLambertMaterial({ color: 0x5a5a60 }));
    addBox(0.02, 0.24, 0.01, 7.50, 1.02, -6.40, metalFerruleMaterial);
    addBox(0.01, 0.20, 0.01, 7.52, 1.00, -6.38, new THREE.MeshLambertMaterial({ color: 0x111111 }));

    // Assorted paint tubes scattered on table
    const paintTubeColors = [0xb82828, 0x1848a0, 0xd4a020, 0x207850, 0x882060, 0xffffff];
    paintTubeColors.forEach((tc, ti) => {
      const tx = 6.75 + (ti % 3) * 0.12;
      const tz = -5.85 - Math.floor(ti / 3) * 0.10;
      addBox(0.08, 0.025, 0.04, tx, 0.835, tz, new THREE.MeshLambertMaterial({ color: 0x9e9ea4 }));
      addBox(0.03, 0.028, 0.035, tx - 0.01, 0.837, tz, new THREE.MeshLambertMaterial({ color: tc }));
    });

    // 3. Large South Wall Cork Pinboard with Concept Sketches & Swatches
    // Pinboard centered at X = 7.5, Y = 2.2, Z = -3.22 (3.8m wide x 1.4m high)
    addBox(3.80, 1.40, 0.04, 7.50, 2.20, -3.22, corkMaterial);
    // Pinboard oak frame
    addBox(3.88, 0.06, 0.06, 7.50, 2.92, -3.22, studioWoodMaterial); // Top
    addBox(3.88, 0.06, 0.06, 7.50, 1.48, -3.22, studioWoodMaterial); // Bottom
    addBox(0.06, 1.40, 0.06, 5.60, 2.20, -3.22, studioWoodMaterial); // Left
    addBox(0.06, 1.40, 0.06, 9.40, 2.20, -3.22, studioWoodMaterial); // Right

    // Pinned notes, concept sketches and swatches on pinboard
    const pinNotes = [
      { x: 6.20, y: 2.45, w: 0.45, h: 0.55, c: 0xdedad2 },
      { x: 6.85, y: 2.40, w: 0.55, h: 0.65, c: 0xe8e4dc },
      { x: 7.60, y: 2.50, w: 0.40, h: 0.40, c: 0xd8d0c0 },
      { x: 8.30, y: 2.40, w: 0.50, h: 0.60, c: 0xedeae2 },
      { x: 8.95, y: 2.35, w: 0.42, h: 0.48, c: 0xded4c4 },
      { x: 6.50, y: 1.85, w: 0.50, h: 0.35, c: 0xeee8d8 },
      { x: 7.20, y: 1.80, w: 0.60, h: 0.42, c: 0xe0d8cc },
      { x: 8.00, y: 1.82, w: 0.48, h: 0.38, c: 0xdcd6cb },
      { x: 8.70, y: 1.80, w: 0.35, h: 0.35, c: 0xe8e0d0 },
    ];
    pinNotes.forEach((pn) => {
      addBox(pn.w, pn.h, 0.01, pn.x, pn.y, -3.24, new THREE.MeshLambertMaterial({ color: pn.c }));
      // Push pin
      addBox(0.02, 0.02, 0.025, pn.x, pn.y + pn.h / 2 - 0.03, -3.25, new THREE.MeshLambertMaterial({ color: 0xcc2222 }));
    });

    scene.add(houseGroup);

    // ─────────────────────────────────────────────────────────────
    // 6. INTERACTIVE PROXIMITY MARKERS (#769EFD Shimmer)
    // ─────────────────────────────────────────────────────────────
    const markerGroup = new THREE.Group();
    const markerMeshes: { mesh: THREE.Mesh; objId: string }[] = [];

    HOUSE_OBJECTS_3D.forEach((item) => {
      // Gallery wall frames and studio easel canvas are rendered in signature blue (#769EFD); omit wireframe markers so presentation is clean
      if (item.id.startsWith("gallery-frame-") || item.id === "obj-studio-easel") return;
      const markerGeo = new THREE.OctahedronGeometry(0.16, 0);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0x769efd,
        wireframe: true,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.set(item.position[0], item.position[1] + 0.35, item.position[2]);
      markerGroup.add(markerMesh);
      markerMeshes.push({ mesh: markerMesh, objId: item.id });
    });
    scene.add(markerGroup);

    // ─────────────────────────────────────────────────────────────
    // 7. CHIAROSCURO LIGHTING (Defines True 3D Depth in ASCII)
    // ─────────────────────────────────────────────────────────────
    // Hemisphere Light for natural daytime sky and floor ambient reflection
    const hemiLight = new THREE.HemisphereLight(0xfff8ee, 0x8a8274, 1.25);
    scene.add(hemiLight);

    // Warm, bright daytime ambient fill
    const ambientLight = new THREE.AmbientLight(0x9a958b, 0.95);
    scene.add(ambientLight);

    // Exterior Daytime Key Light (brightens facade, roof, yard, trees and grounds with crisp sun angle)
    const extSunLight = new THREE.DirectionalLight(0xfff0db, 1.55);
    extSunLight.position.set(15, 30, 25);
    extSunLight.target.position.set(0, 2, 0);
    scene.add(extSunLight);
    scene.add(extSunLight.target);

    // Vintage street lamp: Front Left
    {
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, 4, 8),
            new THREE.MeshLambertMaterial({ color: 0x2c231b })
        );
        // Slightly left of facade and forward
        post.position.set(-5, 2, 2.5);
        scene.add(post);

        const lantern = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            new THREE.MeshLambertMaterial({ color: 0x555555 })
        );
        lantern.position.set(-5, 4.2, 2.5);
        scene.add(lantern);

        // Brighter light with larger radius
        const lampLight = new THREE.PointLight(0xffa500, 8.0, 25);
        lampLight.position.set(-5, 4.5, 2.5);
        scene.add(lampLight);
    }

    // Vintage street lamp: Front Right
    {
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, 4, 8),
            new THREE.MeshLambertMaterial({ color: 0x2c231b })
        );
        // Slightly right of facade and forward
        post.position.set(5, 2, 2.5);
        scene.add(post);

        const lantern = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            new THREE.MeshLambertMaterial({ color: 0x555555 })
        );
        lantern.position.set(5, 4.2, 2.5);
        scene.add(lantern);

        // Brighter light with larger radius
        const lampLight = new THREE.PointLight(0xffa500, 8.0, 25);
        lampLight.position.set(5, 4.5, 2.5);
        scene.add(lampLight);
    }

    // extMoonLight.position.set(6, 14, 15);
// scene.add(extMoonLight);
// scene.add(extMoonLight);

    // Interior Doorway Spill Light (warm light casting forward onto steps & porch)
    const doorSpillLight = new THREE.PointLight(0xffeedd, 2.8, 14);
    doorSpillLight.position.set(0, 2.8, -0.6);
    scene.add(doorSpillLight);

    // Entrance Hall Central Pendant Downlights (spaced down the 21m axial corridor)
    const hallPendant1 = new THREE.PointLight(0xfff4e8, 4.2, 16);
    hallPendant1.position.set(0.0, 3.7, -4.5);
    scene.add(hallPendant1);

    const hallPendant2 = new THREE.PointLight(0xfff4e8, 4.2, 16);
    hallPendant2.position.set(0.0, 3.7, -9.0);
    scene.add(hallPendant2);

    const hallPendant3 = new THREE.PointLight(0xfff4e8, 4.2, 16);
    hallPendant3.position.set(0.0, 3.7, -13.5);
    scene.add(hallPendant3);

    const hallPendant4 = new THREE.PointLight(0xfff4e8, 4.2, 16);
    hallPendant4.position.set(0.0, 3.7, -18.0);
    scene.add(hallPendant4);

    const hallPendant5 = new THREE.PointLight(0xffeedd, 3.8, 14);
    hallPendant5.position.set(0.0, 3.7, -20.5);
    scene.add(hallPendant5);

    // Entrance Hall Sconce Lights (warm perimeter sconces)
    const hallSconce1 = new THREE.PointLight(0xffe8cf, 3.5, 12);
    hallSconce1.position.set(-2.2, 2.8, -4.0);
    scene.add(hallSconce1);

    const hallSconceEast1 = new THREE.PointLight(0xffe8cf, 3.5, 12);
    hallSconceEast1.position.set(2.2, 2.8, -8.0);
    scene.add(hallSconceEast1);

    const hallSconceWest2 = new THREE.PointLight(0xffe8cf, 3.5, 12);
    hallSconceWest2.position.set(-2.2, 2.8, -12.0);
    scene.add(hallSconceWest2);

    const hallSconce2 = new THREE.PointLight(0xffe8cf, 3.5, 12);
    hallSconce2.position.set(2.2, 2.8, -16.5);
    scene.add(hallSconce2);

    const hallSconceWest3 = new THREE.PointLight(0xffe8cf, 3.2, 11);
    hallSconceWest3.position.set(-2.2, 2.8, -20.2);
    scene.add(hallSconceWest3);

    // Dedicated Profile Portrait Accent Light in #769EFD
    const portraitLight = new THREE.PointLight(0x769efd, 3.5, 8.0);
    portraitLight.position.set(-2.08, 2.82, -8.0);
    scene.add(portraitLight);

    // Dedicated House Map Accent Light in #769EFD
    const mapLight = new THREE.PointLight(0x769efd, 3.2, 8.5);
    mapLight.position.set(2.2, 2.6, -12.0);
    scene.add(mapLight);

    // Dedicated Component Token Board Accent Light in #769EFD
    const tokenBoardLight = new THREE.PointLight(0x769efd, 3.4, 8.5);
    tokenBoardLight.position.set(-10.0, 3.25, -24.4);
    scene.add(tokenBoardLight);

    // Dedicated Dog Bed Ambient Accent Light in #769EFD
    const dogBedLight = new THREE.PointLight(0x769efd, 2.6, 7.0);
    dogBedLight.position.set(-6.5, 2.2, -13.5);
    scene.add(dogBedLight);

    // Living Room Central Downlight (illuminating plinth table & laptop)
    const livingRoomLight = new THREE.PointLight(0xfff8ee, 5.5, 26);
    livingRoomLight.position.set(-10.0, 4.8, -18.0);
    scene.add(livingRoomLight);

    // Living Room Entry & Seating Downlight
    const livingRoomLight2 = new THREE.PointLight(0xfff2e0, 4.8, 22);
    livingRoomLight2.position.set(-6.5, 4.2, -16.5);
    scene.add(livingRoomLight2);

    // Living Room North Wall & Aquarium Downlight Wash
    const livingNorthLight = new THREE.PointLight(0xfff2e0, 4.2, 18);
    livingNorthLight.position.set(-12.5, 4.6, -23.0);
    scene.add(livingNorthLight);

    // Living Room South Credenza Downlight Wash
    const livingSouthLight = new THREE.PointLight(0xfff2e0, 3.8, 18);
    livingSouthLight.position.set(-12.0, 4.2, -13.0);
    scene.add(livingSouthLight);

    // Living Room West Wall Lounge Fill Light
    const livingWestLight = new THREE.PointLight(0xe0eeff, 4.2, 20);
    livingWestLight.position.set(-15.5, 4.5, -18.0);
    scene.add(livingWestLight);

    // Living Room East Entry Zone Downlight
    const livingEastLight = new THREE.PointLight(0xfff2e0, 3.8, 16);
    livingEastLight.position.set(-4.5, 4.2, -21.0);
    scene.add(livingEastLight);

    // Window 1 Daylight Spill Spotlight (casting daylight gradient from window 1 across floor)
    const windowSpot1 = new THREE.SpotLight(0xcde0f7, 4.5, 16, Math.PI / 4, 0.4);
    windowSpot1.position.set(-17.2, 3.5, -15.0);
    windowSpot1.target.position.set(-11.0, 0.0, -16.5);
    scene.add(windowSpot1);
    scene.add(windowSpot1.target);

    // Window 2 Daylight Spill Spotlight (casting daylight gradient from window 2 across floor)
    const windowSpot2 = new THREE.SpotLight(0xcde0f7, 4.5, 16, Math.PI / 4, 0.4);
    windowSpot2.position.set(-17.2, 3.5, -21.0);
    windowSpot2.target.position.set(-11.0, 0.0, -19.5);
    scene.add(windowSpot2);
    scene.add(windowSpot2.target);

    // Living Room Doorway Transition Spill Light
    const doorwaySpillLight = new THREE.SpotLight(0xffecd4, 2.5, 12, Math.PI / 4, 0.5);
    doorwaySpillLight.position.set(-4.5, 3.0, -18.0);
    doorwaySpillLight.target.position.set(-1.0, 0.0, -18.0);
    scene.add(doorwaySpillLight);
    scene.add(doorwaySpillLight.target);

    // Study Room Overhead Downlight (Ambient Wash)
    const studyOverheadLight = new THREE.PointLight(0xfff5ea, 5.8, 22);
    studyOverheadLight.position.set(7.3, 3.8, -18.0);
    scene.add(studyOverheadLight);

    // Dedicated Bookshelf Wash Downlight (directly illuminates shelves & 3D book spines on North Wall)
    const bookshelfWashLight = new THREE.PointLight(0xfff6ec, 6.2, 14.0);
    bookshelfWashLight.position.set(7.00, 3.60, -21.40);
    scene.add(bookshelfWashLight);

    // Study North-East Rear Corner Floor Lamp Warm Glow (from tall floor lamp at X = 11.08, Z = -22.28)
    const floorLampLight = new THREE.PointLight(0xffecd0, 8.5, 16.0);
    floorLampLight.position.set(11.08, 2.67, -22.28);
    scene.add(floorLampLight);

    // Floor Lamp Base & Corner Floor Wash
    const floorLampFloorLight = new THREE.PointLight(0xffecd0, 4.5, 6.0);
    floorLampFloorLight.position.set(11.08, 0.40, -22.28);
    scene.add(floorLampFloorLight);

    // Study South Wall Downlight Wash
    const studySouthLight = new THREE.PointLight(0xffefe0, 4.8, 18);
    studySouthLight.position.set(7.3, 3.8, -14.8);
    scene.add(studySouthLight);

    // Study Desk Zone Overhead Fill Light
    const studyDeskWashLight = new THREE.PointLight(0xfff5ea, 5.0, 16);
    studyDeskWashLight.position.set(8.8, 3.4, -18.0);
    scene.add(studyDeskWashLight);

    // Study Desk Task Light (banker's brass lamp)
    const deskTaskLight = new THREE.PointLight(0xffeedd, 3.6, 7.0);
    deskTaskLight.position.set(8.55, 1.35, -18.85);
    scene.add(deskTaskLight);

    // Interactive Blue Monitor Glow Point Light (#769EFD)
    const monitorGlowLight = new THREE.PointLight(0x769efd, 3.2, 5.5);
    monitorGlowLight.position.set(8.1, 1.25, -18.0);
    scene.add(monitorGlowLight);

    // Study Doorway Spill Spotlight into Hallway
    const studyDoorwaySpillLight = new THREE.SpotLight(0xffecd4, 3.5, 14, Math.PI / 4, 0.4);
    studyDoorwaySpillLight.position.set(5.5, 3.2, -18.0);
    studyDoorwaySpillLight.target.position.set(1.0, 0.0, -18.0);
    scene.add(studyDoorwaySpillLight);
    scene.add(studyDoorwaySpillLight.target);

    // ─── ART ROOM & GALLERY WALL LIGHTING ───
    // Central Studio Overhead Warm Ambient Wash
    const studioOverheadLight = new THREE.PointLight(0xfff2e0, 5.5, 22);
    studioOverheadLight.position.set(7.3, 3.8, -8.0);
    scene.add(studioOverheadLight);

    // Dedicated Gallery Wall Directional Wash Light (illuminating the 7 signature blue frames on North wall)
    const galleryWashLight = new THREE.PointLight(0xfff6ec, 7.5, 20);
    galleryWashLight.position.set(7.0, 3.6, -11.5);
    scene.add(galleryWashLight);

    // Studio Worktable Overhead Task Glow
    const worktableTaskLight = new THREE.PointLight(0xffeed6, 3.4, 10);
    worktableTaskLight.position.set(6.8, 2.2, -6.2);
    scene.add(worktableTaskLight);

    // East Window Natural Daylight Wash (spilling into studio and visible from walkway)
    const studioWindowDaylight = new THREE.PointLight(0xdde8f6, 4.2, 16);
    studioWindowDaylight.position.set(11.2, 2.5, -8.0);
    scene.add(studioWindowDaylight);

    // East Exterior Walkway Garden Lantern Glow
    const walkwayLanternLight = new THREE.PointLight(0xffe2b0, 2.6, 12);
    walkwayLanternLight.position.set(13.4, 1.2, -7.5);
    scene.add(walkwayLanternLight);

    // Art Room Doorway Spill Spotlight into Hallway
    const artDoorwaySpillLight = new THREE.SpotLight(0xffecd4, 3.2, 14, Math.PI / 4, 0.4);
    artDoorwaySpillLight.position.set(5.5, 3.2, -7.5);
    artDoorwaySpillLight.target.position.set(1.0, 0.0, -7.5);
    scene.add(artDoorwaySpillLight);
    scene.add(artDoorwaySpillLight.target);

    // Outdoor Daylight & Sunlight shining from the West Sky
    const outdoorDaylight = new THREE.DirectionalLight(0xdde9f7, 1.35);
    outdoorDaylight.position.set(-28, 12, -18);
    outdoorDaylight.target.position.set(-17, 3, -18);
    scene.add(outdoorDaylight);
    scene.add(outdoorDaylight.target);

    // ─────────────────────────────────────────────────────────────
    // 8. ANIMATION & RENDER LOOP
    // ─────────────────────────────────────────────────────────────
    let animationFrameId: number;
    let lastTime = performance.now();


    const forwardVec = new THREE.Vector3();
    const toObjVec = new THREE.Vector3();

    const render = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Update player navigation & collision
      navigator.update(delta);

      // Rotate proximity markers
      markerMeshes.forEach(({ mesh }) => {
        mesh.rotation.y += delta * 1.5;
        mesh.rotation.x += delta * 0.8;
      });

      const animTime = now * 0.001;

      // Animate aquarium water subtle opacity breathing
      if (aquariumWater) {
        const opacity = 0.48 + 0.04 * Math.sin(animTime * 2);
        (aquariumWater.material as THREE.MeshLambertMaterial).opacity = opacity;
      }

      // Animate two swimming orange fish inside the aquarium
      if (fish1Group) {
        const t1 = animTime * 1.5;
        fish1Group.position.x = -13.65 + Math.sin(t1) * 0.24;
        fish1Group.position.y = 1.30 + Math.sin(t1 * 2) * 0.035;
        fish1Group.rotation.y = Math.cos(t1) >= 0 ? 0 : Math.PI;
      }
      if (fish2Group) {
        const t2 = animTime * 1.2 + 1.5;
        fish2Group.position.x = -13.25 - Math.sin(t2) * 0.20;
        fish2Group.position.y = 1.18 + Math.cos(t2 * 2.2) * 0.03;
        fish2Group.rotation.y = -Math.cos(t2) >= 0 ? 0 : Math.PI;
      }

      // Animate glistening sparkles around interactive objects
      if (sparklePoints) {
        const posArr = sparklePoints.geometry.attributes.position.array as Float32Array;
        const totalSpk = sparkleBasePositions.length;
        for (let s = 0; s < totalSpk; s++) {
          const bp = sparkleBasePositions[s];
          const ph = sparklePhases[s];
          posArr[s * 3] = bp.x + Math.sin(animTime * 2.0 + ph) * 0.06;
          posArr[s * 3 + 1] = bp.y + Math.cos(animTime * 2.5 + ph) * 0.06;
          posArr[s * 3 + 2] = bp.z + Math.sin(animTime * 1.8 + ph * 1.5) * 0.06;
        }
        sparklePoints.geometry.attributes.position.needsUpdate = true;
        (sparklePoints.material as THREE.PointsMaterial).opacity = 0.65 + 0.35 * Math.sin(animTime * 4.0);
      }

      // Proximity detection for interactive objects
      camera.getWorldDirection(forwardVec);
      forwardVec.y = 0;
      forwardVec.normalize();

      let closestObj: InteractiveObject3D | null = null;
      let minDistance = 999;

      HOUSE_OBJECTS_3D.forEach((obj) => {
        const objPos = new THREE.Vector3(...obj.position);
        const dist = camera.position.distanceTo(objPos);

        if (dist <= obj.interactionRadius) {
          toObjVec.copy(objPos).sub(camera.position);
          toObjVec.y = 0;
          toObjVec.normalize();

          const dot = forwardVec.dot(toObjVec);
          if (dot > 0.35 && dist < minDistance) {
            minDistance = dist;
            closestObj = obj;
          }
        }
      });

      hoveredObjectRef.current = closestObj;
      setHoveredObject(closestObj);

      // Render 3D scene through AsciiEffect
      effect.render(scene, camera);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // ─────────────────────────────────────────────────────────────
    // 9. DIRECT CLICK ON ASCII PORTRAITS (Raycasting Instagram Posts)
    // ─────────────────────────────────────────────────────────────
    const clickRaycaster = new THREE.Raycaster();
    const clickMouse = new THREE.Vector2();

    const handleCanvasArtworkClick = (e: MouseEvent) => {
      // Don't intercept UI buttons, input fields, or dialogue modals
      if (
        e.target instanceof HTMLButtonElement ||
        e.target instanceof HTMLInputElement ||
        (e.target as HTMLElement)?.closest?.("button") ||
        (e.target as HTMLElement)?.closest?.("[role='dialog']")
      ) {
        return;
      }

      const rect = asciiDom.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }

      if (document.pointerLockElement === asciiDom) {
        clickRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      } else {
        clickMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        clickMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        clickRaycaster.setFromCamera(clickMouse, camera);
      }

      const intersects = clickRaycaster.intersectObjects(galleryArtMeshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.isEaselCanvas) {
          const easelObj = HOUSE_OBJECTS_3D.find((o) => o.id === "obj-studio-easel");
          if (easelObj) {
            if (navigatorRef.current) {
              navigatorRef.current.exitLock();
            }
            setInspectedObject(easelObj);
          }
          return;
        }
        const dest = hit.userData?.destinationUrl;
        if (dest) {
          window.open(dest, "_blank", "noopener,noreferrer");
        }
      }
    };

    window.addEventListener("click", handleCanvasArtworkClick);

    // ─────────────────────────────────────────────────────────────
    // 10. RESIZE OBSERVER
    // ─────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      effect.setSize(width, height);
    };

    const handleOrientationChange = () => {
      handleResize();
      setTimeout(handleResize, 100);
      setTimeout(handleResize, 300);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener("change", handleOrientationChange);
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    // ─────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener("change", handleOrientationChange);
      }
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
      window.removeEventListener("click", handleCanvasArtworkClick);
      navigator.dispose();

      scene.clear();
      portraitTexture.dispose();
      renderer.dispose();
      container.innerHTML = "";
    };
  }, []);

  if (webGLError) {
    return (
      <div className="w-full h-screen bg-[#050504] text-[#d6d2c4] font-mono flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="text-base text-[#3b82f6] mb-2 font-semibold tracking-wider">
          [ 3D ASCII ENVIRONMENT &middot; HARDWARE ACCELERATION NOTICE ]
        </div>
        <p className="text-xs text-[#a8a396] max-w-md leading-relaxed mb-4">
          A WebGL context could not be created in this browser session. Please ensure hardware acceleration is enabled or open in a modern browser with WebGL support.
        </p>
        <div className="text-[11px] text-[#635f55] border border-[#2b2925] p-3 max-w-md bg-[#0f0e0c]">
          Technical detail: {webGLError}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#050504] select-none touch-none">
      {/* Landscape Orientation Welcome Prompt for Mobile Portrait Visitors */}
      <OrientationPrompt />

      {/* 3D ASCII Viewport Canvas Element */}
      <div
        ref={containerRef}
        onClick={handleEnterHouse}
        className="w-full h-full cursor-crosshair touch-none"
        style={{ touchAction: "none" }}
      />

      {/* Mobile Touch Navigation (Virtual Joystick & Touch Look) */}
      <TouchControls
        navigator={navigatorRef.current}
        hoveredObject={introStage !== "playing" || isAnyModalOpen ? null : hoveredObject}
        onInteract={handleInteract}
        disabled={isAnyModalOpen}
      />

      {/* Minimal Architectural HUD */}
      <AsciiHUD
        telemetry={telemetry}
        hoveredObject={introStage !== "playing" ? null : hoveredObject}
        mode={mode}
        onToggleMode={handleToggleMode}
        onSelectRoom={handleSelectRoom}
        onRequestPointerLock={handleRequestPointerLock}
        hasEnteredHouse={hasEnteredHouse}
        onEnterHouse={handleEnterHouse}
        isInspecting={isAnyModalOpen}
        onInteract={handleInteract}
        onOpenInventory={() => {
          if (introStage === "playing") setIsInventoryOpen(true);
        }}
        onOpenNavigation={() => {
          if (introStage === "playing") setIsNavHUDOpen(true);
        }}
        collectedCount={collectedItemIds.size}
        toastMessage={toastMessage}
      />

      {/* Mandatory Three-Stage Opening Introduction */}
      {introStage !== "playing" && (
        <>
          {/* Full-screen blocking backdrop: absorbs clicks so 3D scene and HUD never receive input */}
          <div
            className="fixed inset-0 z-40 bg-black/40 pointer-events-auto select-none"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <DialogueBox
            isOpen={true}
            title={INTRO_SCREENS[introStage].title}
            lines={INTRO_SCREENS[introStage].lines as unknown as DialogueLine[]}
            instantText={true}
            confirmButtonText={INTRO_SCREENS[introStage].buttonText}
            showCancelButton={false}
            hideCloseButton={true}
            disableKeyboardAdvance={true}
            appearanceCount={1}
            onComplete={() => advanceIntroFrom(introStage as "welcome" | "instructions" | "warning")}
          />
        </>
      )}

      {/* Host Narrative Dialogue (Only accessible once gameplay is active) */}
      {introStage === "playing" && hostDialogueConfig && (
        <DialogueBox
          isOpen={true}
          title={hostDialogueConfig.title}
          lines={hostDialogueConfig.lines}
          hasNameInput={hostDialogueConfig.hasNameInput}
          appearanceCount={dialogueAppearanceCount}
          confirmButtonText={hostDialogueConfig.confirmButtonText}
          showCancelButton={hostDialogueConfig.showCancelButton}
          hideCloseButton={hostDialogueConfig.hideCloseButton}
          disableKeyboardAdvance={hostDialogueConfig.disableKeyboardAdvance}
          instantText={hostDialogueConfig.instantText}
          allowBackdropDismiss={hostDialogueConfig.allowBackdropDismiss}
          onNameSubmit={handleHostNameSubmit}
          onNameRefuse={handleHostNameRefuse}
          onBackdropClick={() => {
            if (hostDialogueConfig.onProceed) {
              hostDialogueConfig.onProceed();
            } else {
              setHostDialogueConfig(null);
            }
          }}
          onComplete={() => {
            if (hostDialogueConfig.onProceed) {
              hostDialogueConfig.onProceed();
            } else {
              setHostDialogueConfig(null);
            }
          }}
        />
      )}

      {/* Satchel Inventory Archive */}
      <InventoryModal
        isOpen={isInventoryOpen}
        collectedItemIds={collectedItemIds}
        onClose={() => setIsInventoryOpen(false)}
        onSelectObject={(obj) => {
          setIsInventoryOpen(false);
          setInspectedObject(obj);
        }}
      />

      {/* House Architectural Directory (TAB) */}
      <NavigationHUDModal
        isOpen={isNavHUDOpen}
        currentRoomId={telemetry.currentRoomId}
        onClose={() => setIsNavHUDOpen(false)}
        onSelectRoom={(roomId) => {
          handleSelectRoom(roomId);
          setIsNavHUDOpen(false);
        }}
        onOpenMap={() => {
          setIsNavHUDOpen(false);
          setIsMapOpen(true);
        }}
      />

      {/* Interactive Object Inspector Modal */}
      {inspectedObject && (
        <ObjectInspector
          object={inspectedObject}
          isCollected={collectedItemIds.has(inspectedObject.id)}
          onCollect={handleCollect}
          onClose={() => handleCloseObjectModal(inspectedObject.id, inspectedObject.name)}
        />
      )}

      {/* Profile Portrait Modal */}
      {isProfileOpen && (
        <ProfileModal onClose={() => handleCloseObjectModal("obj-hallway-portrait", "Resident Portrait")} />
      )}

      {/* House Map Blueprint Modal */}
      {isMapOpen && (
        <HouseMapModal
          currentRoomId={telemetry.currentRoomId}
          onSelectRoom={handleSelectRoom}
          onClose={() => handleCloseObjectModal("obj-hallway-map", "Architectural Map")}
        />
      )}

      {/* Project Directory Modal (Study Interactive Computer) */}
      <ProjectDirectoryModal
        isOpen={isProjectDirectoryOpen}
        onClose={handleCloseProjectDirectory}
      />
    </div>
  );
}
