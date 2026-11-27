import { HOUSE_OBJECTS_3D, InteractiveObject3D } from "./house3d";
import { GALLERY_FRAMES } from "./gallery";
import { BEHANCE_PROJECTS } from "@/components/ascii/ProjectDirectoryModal";

export type DirectoryCategory = "ALL WORK" | "UI / UX" | "ILLUSTRATION" | "ACADEMIC PROJECTS";

export interface DirectoryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  roomId: string;
  roomName: string;
  categories: DirectoryCategory[];
  icon: string;
  actionType: "inspect_object" | "open_directory" | "open_profile" | "open_map" | "external_url";
  actionLabel: "[ Open ]" | "[ Open Website ]" | "[ View Collection ]";
  targetUrl?: string;
  interactiveObjectId?: string;
  isUniqueProject: boolean;
  canonicalProjectId: string;
  specimenType: string;
  fileSize?: string;
  modifiedDate?: string;
}

export interface DirectoryRoom {
  id: string;
  name: string;
  folderPath: string;
  icon: string;
  openIcon: string;
  itemCount: number;
  items: DirectoryItem[];
}

export const GROUND_FLOOR_ROOM_IDS = [
  "entrance_hall",
  "living_room",
  "study",
  "art_room",
] as const;

export const DIRECTORY_ROOM_META: Record<
  string,
  { name: string; folderPath: string; icon: string; openIcon: string }
> = {
  entrance_hall: {
    name: "Entrance Hall",
    folderPath: "C:\\IdeaKutir\\GroundFloor\\EntranceHall",
    icon: "/icons/win95/folder-closed.svg",
    openIcon: "/icons/win95/folder-open.svg",
  },
  living_room: {
    name: "The Living Room",
    folderPath: "C:\\IdeaKutir\\GroundFloor\\LivingRoom",
    icon: "/icons/win95/room-lamp.svg",
    openIcon: "/icons/win95/room-lamp.svg",
  },
  study: {
    name: "The Study",
    folderPath: "C:\\IdeaKutir\\GroundFloor\\Study",
    icon: "/icons/win95/room-computer.svg",
    openIcon: "/icons/win95/room-computer.svg",
  },
  art_room: {
    name: "The Art Room",
    folderPath: "C:\\IdeaKutir\\GroundFloor\\ArtRoom",
    icon: "/icons/win95/room-palette.svg",
    openIcon: "/icons/win95/room-palette.svg",
  },
};

/**
 * Authoritative Ground-Floor Directory Entries (21 total entries).
 * Completely excludes second-floor spaces and items.
 */
export const DIRECTORY_ITEMS: DirectoryItem[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. ENTRANCE HALL (2 items)
  // ─────────────────────────────────────────────────────────────
  {
    id: "obj-hallway-portrait",
    title: "Profile Portrait",
    subtitle: "Ashani Gorakhnath CV & Profile",
    description: "Archival profile portrait and curriculum vitae mounted in the entrance hallway.",
    roomId: "entrance_hall",
    roomName: "Entrance Hall",
    categories: ["ALL WORK"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "open_profile",
    actionLabel: "[ Open ]",
    interactiveObjectId: "obj-hallway-portrait",
    isUniqueProject: false,
    canonicalProjectId: "profile-ashani",
    specimenType: "Curriculum Vitae (.doc)",
    fileSize: "24 KB",
    modifiedDate: "2024-11-01",
  },
  {
    id: "obj-hallway-map",
    title: "House Blueprint Map",
    subtitle: "Architectural Blueprint & Schematic",
    description: "Spatial schematic charting explored rooms and domestic grounds of Idea Kutir.",
    roomId: "entrance_hall",
    roomName: "Entrance Hall",
    categories: ["ALL WORK"],
    icon: "/icons/win95/file-project.svg",
    actionType: "open_map",
    actionLabel: "[ Open ]",
    interactiveObjectId: "obj-hallway-map",
    isUniqueProject: false,
    canonicalProjectId: "house-blueprint-map",
    specimenType: "CAD Blueprint (.dwg)",
    fileSize: "128 KB",
    modifiedDate: "2024-10-15",
  },

  // ─────────────────────────────────────────────────────────────
  // 2. THE LIVING ROOM (6 items)
  // ─────────────────────────────────────────────────────────────
  {
    id: "obj-living-dining-meals",
    title: "Learning from Place Project",
    subtitle: "Kundapura Field Notes Research Dossier",
    description: "Situated ethnographic inquiry and field research examining culinary cultures and coastal ecologies.",
    roomId: "living_room",
    roomName: "The Living Room",
    categories: ["ALL WORK", "ACADEMIC PROJECTS"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://app.notion.com/p/Notes-from-the-field-Kundapura-30962b381c968015bff4f0c11437c774",
    interactiveObjectId: "obj-living-dining-meals",
    isUniqueProject: true,
    canonicalProjectId: "learning-from-place",
    specimenType: "Field Dossier (.url)",
    fileSize: "1.2 MB",
    modifiedDate: "2024-08-20",
  },
  {
    id: "obj-coffee-table",
    title: "Cast Coffee Table & Workstation",
    subtitle: "Selected UI/UX Work Overview",
    description: "Central lounge surface hosting curated product architecture and design system portfolios.",
    roomId: "living_room",
    roomName: "The Living Room",
    categories: ["ALL WORK", "UI / UX"],
    icon: "/icons/win95/file-project.svg",
    actionType: "inspect_object",
    actionLabel: "[ Open ]",
    interactiveObjectId: "obj-coffee-table",
    isUniqueProject: true,
    canonicalProjectId: "selected-ui-ux",
    specimenType: "Portfolio Binder (.exe)",
    fileSize: "840 KB",
    modifiedDate: "2024-11-20",
  },
  {
    id: "obj-token-board",
    title: "Component Token Board",
    subtitle: "Design Token Systems Matrix",
    description: "Physicalized spatial token board demonstrating design system state hierarchies and typography tokens.",
    roomId: "living_room",
    roomName: "The Living Room",
    categories: ["ALL WORK", "UI / UX"],
    icon: "/icons/win95/file-project.svg",
    actionType: "inspect_object",
    actionLabel: "[ Open ]",
    interactiveObjectId: "obj-token-board",
    isUniqueProject: false,
    canonicalProjectId: "selected-ui-ux",
    specimenType: "Design Matrix (.xml)",
    fileSize: "320 KB",
    modifiedDate: "2024-09-12",
  },
  {
    id: "obj-aquarium",
    title: "Interactive Aquarium",
    subtitle: "Cetacean Communication Station",
    description: "Illuminated bioacoustic listening chamber modeling interspecies hydrophone arrays and marine signals.",
    roomId: "living_room",
    roomName: "The Living Room",
    categories: ["ALL WORK", "ACADEMIC PROJECTS"],
    icon: "/icons/win95/file-project.svg",
    actionType: "inspect_object",
    actionLabel: "[ Open ]",
    interactiveObjectId: "obj-aquarium",
    isUniqueProject: true,
    canonicalProjectId: "cetacean-communication-station",
    specimenType: "Speculative Rig (.exe)",
    fileSize: "512 KB",
    modifiedDate: "2024-07-04",
  },
  {
    id: "obj-sofa",
    title: "Low Architectural Sofa",
    subtitle: "Modernist Lounge Seating Artifact",
    description: "Scaled domestic seating unit oriented around the central living lounge arrangement.",
    roomId: "living_room",
    roomName: "The Living Room",
    categories: ["ALL WORK"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "inspect_object",
    actionLabel: "[ Open ]",
    interactiveObjectId: "obj-sofa",
    isUniqueProject: false,
    canonicalProjectId: "artifact-sofa",
    specimenType: "Spatial Artifact (.obj)",
    fileSize: "44 KB",
    modifiedDate: "2024-11-19",
  },
  {
    id: "obj-dog-bed",
    title: "Resident's Dog Bed",
    subtitle: "Domestic Bolster Bed Artifact",
    description: "Padded floor cushion marking domestic residency beside the courtyard passage.",
    roomId: "living_room",
    roomName: "The Living Room",
    categories: ["ALL WORK"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "inspect_object",
    actionLabel: "[ Open ]",
    interactiveObjectId: "obj-dog-bed",
    isUniqueProject: false,
    canonicalProjectId: "artifact-dog-bed",
    specimenType: "Spatial Artifact (.obj)",
    fileSize: "38 KB",
    modifiedDate: "2024-11-19",
  },

  // ─────────────────────────────────────────────────────────────
  // 3. THE STUDY (5 items: Terminal collection + 4 Behance case studies)
  // ─────────────────────────────────────────────────────────────
  {
    id: "obj-study-computer",
    title: "Terminal Workstation",
    subtitle: "Selected UI/UX Work & Behance Archives",
    description: "Desktop computer terminal in the Study providing direct access to the complete case study archive.",
    roomId: "study",
    roomName: "The Study",
    categories: ["ALL WORK", "UI / UX"],
    icon: "/icons/win95/file-project.svg",
    actionType: "open_directory",
    actionLabel: "[ View Collection ]",
    interactiveObjectId: "obj-study-computer",
    isUniqueProject: false,
    canonicalProjectId: "selected-ui-ux",
    specimenType: "Terminal Directory (.exe)",
    fileSize: "2.1 MB",
    modifiedDate: "2024-11-22",
  },
  {
    id: "astrotak",
    title: "Re-designing Astrotak",
    subtitle: "Astrology Platform UI/UX Redesign",
    description: "Comprehensive product design overhaul of India's leading astrology portal, featuring chat architecture and birth chart calculations.",
    roomId: "study",
    roomName: "The Study",
    categories: ["ALL WORK", "UI / UX"],
    icon: "/icons/win95/file-project.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.behance.net/gallery/214842555/Re-designing-Astrotak",
    isUniqueProject: true,
    canonicalProjectId: "astrotak",
    specimenType: "Behance Case Study (.url)",
    fileSize: "960 KB",
    modifiedDate: "2024-03-10",
  },
  {
    id: "nagad",
    title: "Nagad App",
    subtitle: "Digital Banking & Financial UI/UX",
    description: "Design token architecture and mobile financial flows servicing millions of active digital banking transactions.",
    roomId: "study",
    roomName: "The Study",
    categories: ["ALL WORK", "UI / UX"],
    icon: "/icons/win95/file-project.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.behance.net/gallery/177860919/Nagad-App",
    isUniqueProject: true,
    canonicalProjectId: "nagad",
    specimenType: "Behance Case Study (.url)",
    fileSize: "780 KB",
    modifiedDate: "2023-08-15",
  },
  {
    id: "ewallet",
    title: "E-wallet App Iconography",
    subtitle: "Fintech Micro-Iconography Suite",
    description: "Precision 24px and 16px pixel-aligned iconography system designed for financial security, quick remittances, and mobile utility.",
    roomId: "study",
    roomName: "The Study",
    categories: ["ALL WORK", "UI / UX"],
    icon: "/icons/win95/file-project.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.behance.net/gallery/169784915/E-wallet-App-Iconography",
    isUniqueProject: true,
    canonicalProjectId: "ewallet",
    specimenType: "Behance Case Study (.url)",
    fileSize: "410 KB",
    modifiedDate: "2023-05-02",
  },
  {
    id: "triplo",
    title: "Triplo UX Case study",
    subtitle: "Travel Planning UX Case Study",
    description: "Collaborative itinerary planner addressing group conflict, budgeting transparency, and trip discovery for modern travelers.",
    roomId: "study",
    roomName: "The Study",
    categories: ["ALL WORK", "UI / UX"],
    icon: "/icons/win95/file-project.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.behance.net/gallery/169008375/Triplo-UX-Case-study",
    isUniqueProject: true,
    canonicalProjectId: "triplo",
    specimenType: "Behance Case Study (.url)",
    fileSize: "650 KB",
    modifiedDate: "2023-04-20",
  },

  // ─────────────────────────────────────────────────────────────
  // 4. THE ART ROOM (8 items: Studio Easel + 7 Gallery Frames)
  // ─────────────────────────────────────────────────────────────
  {
    id: "obj-studio-easel",
    title: "Monster on the Hill",
    subtitle: "Featured Studio Easel Artwork",
    description: "Primary studio canvas exhibiting narrative character illustration and visual development work.",
    roomId: "art_room",
    roomName: "The Art Room",
    categories: ["ALL WORK", "ILLUSTRATION"],
    icon: "/icons/win95/file-project.svg",
    actionType: "inspect_object",
    actionLabel: "[ Open ]",
    interactiveObjectId: "obj-studio-easel",
    isUniqueProject: true,
    canonicalProjectId: "monster-on-the-hill",
    specimenType: "Original Artwork (.canvas)",
    fileSize: "1.4 MB",
    modifiedDate: "2024-06-18",
  },
  {
    id: "gallery-frame-1",
    title: "Circus & O P Sharma Neon Poster",
    subtitle: "Digital Illustration (2024)",
    description: "Tribute to vintage Indian circus typography, illusionists, and retro neon print aesthetics.",
    roomId: "art_room",
    roomName: "The Art Room",
    categories: ["ALL WORK", "ILLUSTRATION"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.instagram.com/ideaphoria/p/C-F-Fy1SnGn/",
    interactiveObjectId: "gallery-frame-1",
    isUniqueProject: true,
    canonicalProjectId: "art-circus-neon",
    specimenType: "Illustration (.jpg)",
    fileSize: "380 KB",
    modifiedDate: "2024-08-01",
  },
  {
    id: "gallery-frame-2",
    title: "Faqir Chand Bookstore Delhi",
    subtitle: "Digital Illustration (2021)",
    description: "Atmospheric architectural drawing capturing the historic Khan Market bookstore piled high with literary volumes.",
    roomId: "art_room",
    roomName: "The Art Room",
    categories: ["ALL WORK", "ILLUSTRATION"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.instagram.com/ideaphoria/p/CNT_MiKJKDG/",
    interactiveObjectId: "gallery-frame-2",
    isUniqueProject: true,
    canonicalProjectId: "art-faqir-chand",
    specimenType: "Illustration (.jpg)",
    fileSize: "420 KB",
    modifiedDate: "2021-03-15",
  },
  {
    id: "gallery-frame-3",
    title: "Chronically Online",
    subtitle: "Digital Illustration (2024)",
    description: "Satirical editorial illustration commenting on screen fatigue, social feeds, and digital overwhelm.",
    roomId: "art_room",
    roomName: "The Art Room",
    categories: ["ALL WORK", "ILLUSTRATION"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.instagram.com/ideaphoria/p/C84uviXSSuf/",
    interactiveObjectId: "gallery-frame-3",
    isUniqueProject: true,
    canonicalProjectId: "art-chronically-online",
    specimenType: "Illustration (.jpg)",
    fileSize: "390 KB",
    modifiedDate: "2024-07-02",
  },
  {
    id: "gallery-frame-4",
    title: "BHU Campus Banaras Foliage",
    subtitle: "Procreate Digital Painting (2021)",
    description: "Lush botanical study rendered during seasonal rains at Banaras Hindu University campus.",
    roomId: "art_room",
    roomName: "The Art Room",
    categories: ["ALL WORK", "ILLUSTRATION"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.instagram.com/p/CL-9qmjFKIK/?cplk=MW8xZjFqc2x2Nm1wag==",
    interactiveObjectId: "gallery-frame-4",
    isUniqueProject: true,
    canonicalProjectId: "art-bhu-foliage",
    specimenType: "Illustration (.jpg)",
    fileSize: "460 KB",
    modifiedDate: "2021-02-28",
  },
  {
    id: "gallery-frame-5",
    title: "AtHome Olive Green Kitchen",
    subtitle: "Digital Interior Illustration (2020)",
    description: "Intimate domestic interior drawing highlighting daylight reflections, kitchenware textures, and home tranquility.",
    roomId: "art_room",
    roomName: "The Art Room",
    categories: ["ALL WORK", "ILLUSTRATION"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.instagram.com/p/CA1kuA7pjhK/?xtok=Y3A5M2F3djZoc3Bm",
    interactiveObjectId: "gallery-frame-5",
    isUniqueProject: true,
    canonicalProjectId: "art-athome-kitchen",
    specimenType: "Illustration (.jpg)",
    fileSize: "340 KB",
    modifiedDate: "2020-05-31",
  },
  {
    id: "gallery-frame-6",
    title: "Banaras Ghats & Tilfi Inspiration",
    subtitle: "Digital Illustration (2022)",
    description: "Visual exploration of Varanasi riverbanks, architectural arches, and Banarasi textile craft heritage.",
    roomId: "art_room",
    roomName: "The Art Room",
    categories: ["ALL WORK", "ILLUSTRATION"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.instagram.com/p/CdpddEqoKTm/?exln=MXRweDcybTV4cTI1ZQ==",
    interactiveObjectId: "gallery-frame-6",
    isUniqueProject: true,
    canonicalProjectId: "art-banaras-ghats",
    specimenType: "Illustration (.jpg)",
    fileSize: "490 KB",
    modifiedDate: "2022-05-18",
  },
  {
    id: "gallery-frame-7",
    title: "Procrastination Studio Artwork",
    subtitle: "Digital Illustration (2024)",
    description: "Autobiographical illustration depicting a messy desk, tea cups, sketchbook doodles, and creative delay.",
    roomId: "art_room",
    roomName: "The Art Room",
    categories: ["ALL WORK", "ILLUSTRATION"],
    icon: "/icons/win95/file-doc.svg",
    actionType: "external_url",
    actionLabel: "[ Open Website ]",
    targetUrl: "https://www.instagram.com/p/C7WVp7syBkn/?dlrf=MXQwNjU1YmFsdjJybw==",
    interactiveObjectId: "gallery-frame-7",
    isUniqueProject: true,
    canonicalProjectId: "art-procrastination",
    specimenType: "Illustration (.jpg)",
    fileSize: "510 KB",
    modifiedDate: "2024-05-25",
  },
];

/**
 * Returns ground-floor rooms filtered by category.
 * If category is not "ALL WORK", rooms with 0 matching items are excluded.
 */
export function getDirectoryRooms(category: DirectoryCategory = "ALL WORK"): DirectoryRoom[] {
  const rooms: DirectoryRoom[] = [];

  for (const roomId of GROUND_FLOOR_ROOM_IDS) {
    const meta = DIRECTORY_ROOM_META[roomId];
    if (!meta) continue;

    const matchingItems = DIRECTORY_ITEMS.filter((item) => {
      if (item.roomId !== roomId) return false;
      if (category === "ALL WORK") return true;
      return item.categories.includes(category);
    });

    // In filtered categories, hide rooms that have no matching projects
    if (category !== "ALL WORK" && matchingItems.length === 0) {
      continue;
    }

    rooms.push({
      id: roomId,
      name: meta.name,
      folderPath: meta.folderPath,
      icon: meta.icon,
      openIcon: meta.openIcon,
      itemCount: matchingItems.length,
      items: matchingItems,
    });
  }

  return rooms;
}

/**
 * Returns distinct statistics for visible entries and unique projects.
 */
export function getDirectoryStats(category: DirectoryCategory = "ALL WORK"): {
  totalItems: number;
  uniqueProjectsCount: number;
  roomsCount: number;
} {
  const rooms = getDirectoryRooms(category);
  const items = rooms.flatMap((r) => r.items);
  const uniqueProjectIds = new Set(
    items.filter((i) => i.isUniqueProject).map((i) => i.canonicalProjectId)
  );

  return {
    totalItems: items.length,
    uniqueProjectsCount: uniqueProjectIds.size,
    roomsCount: rooms.length,
  };
}

/**
 * Find matching 3D interactive object if available.
 */
export function findInteractiveObject(objectId?: string): InteractiveObject3D | undefined {
  if (!objectId) return undefined;
  return HOUSE_OBJECTS_3D.find((obj) => obj.id === objectId);
}
