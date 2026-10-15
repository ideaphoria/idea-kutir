import { ROOMS, PROJECTS, COLLECTIBLE_OBJECTS, Project, CollectibleObject } from "./house";
import { GALLERY_FRAMES } from "./gallery";

export interface Room3D {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  discipline: string;
  description: string;
  atmosphericNote: string;
  level: string;
  primaryProjectId?: string;
  projectIds: string[];
  objectIds: string[];
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    floorY: number;
    ceilY: number;
  };
  doorways: {
    x: number;
    z: number;
    width: number;
    height: number;
    orientation: "x" | "z";
    leadsTo: string;
  }[];
  spawnPoint: {
    x: number;
    y: number;
    z: number;
    yaw: number;
  };
}

export interface InteractiveObject3D {
  id: string;
  roomId: string;
  name: string;
  type: string;
  description: string;
  connectedProjectId?: string;
  position: [number, number, number];
  interactionRadius: number;
  propKind: "portrait" | "map" | "terminal" | "matrix" | "notebook" | "folio" | "exhibit";
}

export const HOUSE_ROOMS_3D: Record<string, Room3D> = {
  exterior: {
    id: "exterior",
    number: "00",
    name: "The Grounds",
    subtitle: "Forecourt & Main Facade",
    discipline: "Arrival & Architectural Facade",
    description: "The exterior approach to the house. Stone steps lead up to a framed doorway set into the austere facade.",
    atmosphericNote: "Night air, cold stone threshold, light casting forward from the open entrance.",
    level: "exterior",
    projectIds: [],
    objectIds: [],
    bounds: {
      minX: -6.0,
      maxX: 6.0,
      minZ: 0.5,
      maxZ: 16.0,
      floorY: 0,
      ceilY: 10.0,
    },
    doorways: [
      { x: 0, z: 0.0, width: 2.4, height: 3.2, orientation: "z", leadsTo: "entrance_hall" },
    ],
    spawnPoint: {
      x: 0,
      y: 1.7,
      z: 13.0,
      yaw: 0, // Facing North directly towards the house facade and entrance
    },
  },

  entrance_hall: {
    id: "entrance_hall",
    number: "01",
    name: "Entrance Hall",
    subtitle: "Axial Corridor & Gallery",
    discipline: "Circulation, Orientation & Memory",
    description: "An elongated architectural hallway with exposed ceiling beams and warm sconce illumination. Two framed objects hang on the walls.",
    atmosphericNote: "Quiet footing on dark floorboards, rhythmic ceiling lines, pools of light from wall sconces.",
    level: "ground",
    projectIds: [],
    objectIds: ["obj-hallway-portrait", "obj-hallway-map"],
    bounds: {
      minX: -2.8,
      maxX: 2.8,
      minZ: -21.0,
      maxZ: 0.5,
      floorY: 0,
      ceilY: 4.2,
    },
    doorways: [
      { x: 0, z: 0.0, width: 2.4, height: 3.2, orientation: "z", leadsTo: "exterior" },
      { x: -2.8, z: -18.0, width: 2.8, height: 3.2, orientation: "x", leadsTo: "living_room" },
      { x: 2.8, z: -18.0, width: 2.8, height: 3.2, orientation: "x", leadsTo: "study" },
      { x: 2.8, z: -7.5, width: 2.6, height: 3.2, orientation: "x", leadsTo: "art_room" },
    ],
    spawnPoint: {
      x: 0,
      y: 1.7,
      z: -3.0,
      yaw: 0,
    },
  },

  study: {
    id: "study",
    number: "03",
    name: "The Study",
    subtitle: "Home Office & Digital Terminal",
    discipline: "Digital Systems & Product Archive",
    description: "An intimate architectural workspace positioned directly across the hallway from the Living Room. Contains an executive walnut desk, chair, and an interactive desktop computer workstation.",
    atmosphericNote: "Warm pool of desk lamplight, dark walnut grain, interactive blue terminal glow.",
    level: "ground",
    primaryProjectId: "selected-ui-ux",
    projectIds: ["selected-ui-ux"],
    objectIds: ["obj-study-computer"],
    bounds: {
      minX: 2.8,
      maxX: 11.8,
      minZ: -23.0,
      maxZ: -13.0,
      floorY: 0,
      ceilY: 4.2,
    },
    doorways: [
      { x: 2.8, z: -18.0, width: 2.8, height: 3.2, orientation: "x", leadsTo: "entrance_hall" },
    ],
    spawnPoint: {
      x: 6.5,
      y: 1.7,
      z: -18.0,
      yaw: -Math.PI / 2, // Facing East towards the desk and computer workstation
    },
  },

  art_room: {
    id: "art_room",
    number: "04",
    name: "The Art Room",
    subtitle: "Personal Studio & Gallery Wall",
    discipline: "Visual Arts, Process & Physical Artifacts",
    description: "A lived-in personal art studio directly adjacent to the Study. Contains a large worktable, easel with paints, a pinboard of sketches, and a substantial gallery wall of signature-blue frames.",
    atmosphericNote: "Turpentine and linseed oil, natural daylight through the walkway window, vivid blue frames on the north wall.",
    level: "ground",
    primaryProjectId: "monster-on-the-hill",
    projectIds: ["monster-on-the-hill"],
    objectIds: [
      "obj-studio-easel",
      "gallery-frame-1",
      "gallery-frame-2",
      "gallery-frame-3",
      "gallery-frame-4",
      "gallery-frame-5",
      "gallery-frame-6",
      "gallery-frame-7",
    ],
    bounds: {
      minX: 2.8,
      maxX: 11.8,
      minZ: -13.0,
      maxZ: -3.0,
      floorY: 0,
      ceilY: 4.2,
    },
    doorways: [
      { x: 2.8, z: -7.5, width: 2.6, height: 3.2, orientation: "x", leadsTo: "entrance_hall" },
    ],
    spawnPoint: {
      x: 5.5,
      y: 1.7,
      z: -7.5,
      yaw: -Math.PI / 2, // Facing East into the studio
    },
  },

  living_room: {
    id: "living_room",
    number: "02",
    name: "The Living Room",
    subtitle: "Primary Living & Practice Chamber",
    discipline: "Product Systems & Digital Craft",
    description: "A spacious chamber with an elevated 5.6m ceiling and tall architectural windows on the west wall. Contains working tables and portfolio specimens.",
    atmosphericNote: "Generous spatial volume, deep evening shadows, cool light falling across furniture.",
    level: "ground",
    primaryProjectId: ROOMS.studio.primaryProjectId,
    projectIds: [ROOMS.studio.primaryProjectId],
    objectIds: ["obj-dog-bed", "obj-sofa", "obj-coffee-table", "obj-token-board", "obj-aquarium"],
    bounds: {
      minX: -17.5,
      maxX: -2.8,
      minZ: -25.0,
      maxZ: -11.0,
      floorY: 0,
      ceilY: 5.6,
    },
    doorways: [
      { x: -2.8, z: -18.0, width: 2.8, height: 3.2, orientation: "x", leadsTo: "entrance_hall" },
    ],
    spawnPoint: {
      x: -10.0,
      y: 1.7,
      z: -18.0,
      yaw: Math.PI / 2, // Facing West directly towards the windows, tree, and garden
    },
  },
};

export const HOUSE_OBJECTS_3D: InteractiveObject3D[] = [
  // Hallway Objects (discovered in sequence)
  {
    id: "obj-hallway-portrait",
    roomId: "entrance_hall",
    name: "Profile Portrait",
    type: "Archival Frame",
    description: "A deep-set framed portrait mounted to the west hallway wall, framed in #769EFD and illuminated by a dedicated overhead periwinkle fixture.",
    position: [-2.51, 1.85, -8.0],
    interactionRadius: 2.8,
    propKind: "portrait",
  },
  {
    id: "obj-hallway-map",
    roomId: "entrance_hall",
    name: "House Blueprint Map",
    type: "Spatial Schematic",
    description: "A framed architectural plan on the east wall charting the explored rooms and dormant wings of the house, framed in #769EFD.",
    position: [2.65, 1.8, -12.0],
    interactionRadius: 2.8,
    propKind: "map",
  },

  // Living Room Portfolio Objects (intentional architectural objects)
  {
    id: "obj-dog-bed",
    roomId: "living_room",
    name: COLLECTIBLE_OBJECTS["obj-dog-bed"].name,
    type: COLLECTIBLE_OBJECTS["obj-dog-bed"].type,
    description: COLLECTIBLE_OBJECTS["obj-dog-bed"].description,
    position: [-6.5, 0.4, -13.5],
    interactionRadius: 2.8,
    propKind: "folio",
  },
  {
    id: "obj-sofa",
    roomId: "living_room",
    name: COLLECTIBLE_OBJECTS["obj-sofa"].name,
    type: COLLECTIBLE_OBJECTS["obj-sofa"].type,
    description: COLLECTIBLE_OBJECTS["obj-sofa"].description,
    position: [-11.5, 0.65, -18.0],
    interactionRadius: 3.2,
    propKind: "folio",
  },
  {
    id: "obj-coffee-table",
    roomId: "living_room",
    name: COLLECTIBLE_OBJECTS["obj-coffee-table"].name,
    type: COLLECTIBLE_OBJECTS["obj-coffee-table"].type,
    description: COLLECTIBLE_OBJECTS["obj-coffee-table"].description,
    connectedProjectId: COLLECTIBLE_OBJECTS["obj-coffee-table"].connectedProjectId,
    position: [-9.2, 0.55, -18.0],
    interactionRadius: 2.8,
    propKind: "terminal",
  },
  {
    id: "obj-token-board",
    roomId: "living_room",
    name: COLLECTIBLE_OBJECTS["obj-token-board"].name,
    type: COLLECTIBLE_OBJECTS["obj-token-board"].type,
    description: COLLECTIBLE_OBJECTS["obj-token-board"].description,
    connectedProjectId: COLLECTIBLE_OBJECTS["obj-token-board"].connectedProjectId,
    position: [-10.0, 2.2, -24.7],
    interactionRadius: 3.2,
    propKind: "matrix",
  },
  {
    id: "obj-aquarium",
    roomId: "living_room",
    name: COLLECTIBLE_OBJECTS["obj-aquarium"].name,
    type: COLLECTIBLE_OBJECTS["obj-aquarium"].type,
    description: COLLECTIBLE_OBJECTS["obj-aquarium"].description,
    connectedProjectId: COLLECTIBLE_OBJECTS["obj-aquarium"].connectedProjectId,
    position: [-13.5, 1.25, -24.4],
    interactionRadius: 3.5,
    propKind: "exhibit",
  },

  // Study / Home Office Interactive Workstation
  {
    id: "obj-study-computer",
    roomId: "study",
    name: "Terminal Workstation",
    type: "Interactive Workstation",
    description: "A desktop computer terminal resting on a solid walnut desk. The screen displays an active prompt in signature blue #769EFD connecting to the complete project directory.",
    connectedProjectId: "selected-ui-ux",
    position: [8.4, 1.2, -18.0],
    interactionRadius: 2.8,
    propKind: "terminal",
  },

  // Art Room Studio Easel (Monster on the Hill)
  {
    id: "obj-studio-easel",
    roomId: "art_room",
    name: "Monster on the Hill",
    type: "Artist Easel & Canvas",
    description: "An artist's studio easel holding a stretched canvas finished in signature blue #769EFD. Features the project 'Monster on the Hill'.",
    connectedProjectId: "monster-on-the-hill",
    position: [9.20, 1.55, -9.56],
    interactionRadius: 3.0,
    propKind: "exhibit",
  },

  // Art Room Signature-Blue Gallery Frames (#769EFD)
  ...GALLERY_FRAMES.map((gf) => ({
    id: gf.id,
    roomId: "art_room",
    name: gf.title || "Gallery Frame Slot",
    type: "Signature Blue Frame",
    description: "An architectural frame finished in signature blue #769EFD mounted to the art studio gallery wall.",
    position: gf.position,
    interactionRadius: 3.2,
    propKind: "exhibit" as const,
  })),
];

export function getProjectData(projectId?: string): Project | undefined {
  if (!projectId) return undefined;
  return PROJECTS[projectId];
}

export function getCollectibleData(objectId?: string): CollectibleObject | undefined {
  if (!objectId) return undefined;
  return COLLECTIBLE_OBJECTS[objectId];
}
