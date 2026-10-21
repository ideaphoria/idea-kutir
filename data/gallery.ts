export interface GalleryFrameConfig {
  id: string;
  title: string;
  artist?: string;
  medium?: string;
  year?: string;
  imagePath?: string;
  destinationUrl?: string;
  position: [number, number, number]; // [x, y, z] in world coordinates
  width: number;
  height: number;
  depth: number;
}

/**
 * Gallery Wall Configuration
 * Every frame is initially empty (title empty, imagePath unset, destinationUrl unset).
 * Rendered in signature blue #769EFD.
 */
export const GALLERY_FRAMES: GalleryFrameConfig[] = [
  // Upper Tier
  {
    id: "gallery-frame-1",
    title: "Circus & O P Sharma Neon Poster",
    artist: "Ashani Nath",
    medium: "Digital Illustration",
    year: "2024",
    imagePath: "/artworks/artwork_1.jpg",
    destinationUrl: "https://www.instagram.com/ideaphoria/p/C-F-Fy1SnGn/",
    position: [4.9, 2.65, -22.80],
    width: 1.3,
    height: 1.3,
    depth: 0.10,
  },
  {
    id: "gallery-frame-2",
    title: "Faqir Chand Bookstore Delhi",
    artist: "Ashani Nath",
    medium: "Digital Illustration",
    year: "2021",
    imagePath: "/artworks/artwork_2.jpg",
    destinationUrl: "https://www.instagram.com/ideaphoria/p/CNT_MiKJKDG/",
    position: [7.1, 2.65, -22.80],
    width: 1.3,
    height: 1.3,
    depth: 0.10,
  },
  {
    id: "gallery-frame-3",
    title: "Chronically Online",
    artist: "Ashani Nath",
    medium: "Digital Illustration",
    year: "2024",
    imagePath: "/artworks/artwork_3.jpg",
    destinationUrl: "https://www.instagram.com/ideaphoria/p/C84uviXSSuf/",
    position: [9.3, 2.65, -22.80],
    width: 1.16,
    height: 1.41, // Exact 0.80 aspect ratio matching 512x640 image
    depth: 0.10,
  },

  // Lower / Eye-Level Tier
  {
    id: "gallery-frame-4",
    title: "BHU Campus Banaras Foliage",
    artist: "Ashani Nath",
    medium: "Procreate Digital Painting",
    year: "2021",
    imagePath: "/artworks/artwork_4.jpg",
    destinationUrl: "https://www.instagram.com/p/CL-9qmjFKIK/?cplk=MW8xZjFqc2x2Nm1wag==",
    position: [4.3, 1.25, -22.80],
    width: 1.16,
    height: 1.16,
    depth: 0.10,
  },
  {
    id: "gallery-frame-5",
    title: "AtHome Olive Green Kitchen",
    artist: "Ashani Nath",
    medium: "Digital Interior Illustration",
    year: "2020",
    imagePath: "/artworks/artwork_5.jpg",
    destinationUrl: "https://www.instagram.com/p/CA1kuA7pjhK/?xtok=Y3A5M2F3djZoc3Bm",
    position: [6.1, 1.25, -22.80],
    width: 1.16,
    height: 1.16,
    depth: 0.10,
  },
  {
    id: "gallery-frame-6",
    title: "Banaras Ghats & Tilfi Inspiration",
    artist: "Ashani Nath",
    medium: "Digital Illustration",
    year: "2022",
    imagePath: "/artworks/artwork_6.jpg",
    destinationUrl: "https://www.instagram.com/p/CdpddEqoKTm/?exln=MXRweDcybTV4cTI1ZQ==",
    position: [7.9, 1.25, -22.80],
    width: 1.16,
    height: 1.16,
    depth: 0.10,
  },
  {
    id: "gallery-frame-7",
    title: "Procrastination Studio Artwork",
    artist: "Ashani Nath",
    medium: "Digital Illustration",
    year: "2024",
    imagePath: "/artworks/artwork_7.jpg",
    destinationUrl: "https://www.instagram.com/p/C7WVp7syBkn/?dlrf=MXQwNjU1YmFsdjJybw==",
    position: [9.7, 1.25, -22.80],
    width: 1.16,
    height: 1.16,
    depth: 0.10,
  },
];

export function getGalleryFrame(id: string): GalleryFrameConfig | undefined {
  return GALLERY_FRAMES.find((f) => f.id === id);
}
