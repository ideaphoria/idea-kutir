export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  roomName: string;
  roomId: string;
  summary: string;
  overview: string;
  disciplines: string[];
  role?: string;
  context?: string;
  processPoints: { title: string; description: string }[];
  outcomesPlaceholder: string;
  thumbnailPlaceholder: {
    label: string;
    caption: string;
    aspectRatio: string;
  };
}

export interface CollectibleObject {
  id: string;
  name: string;
  roomId: string;
  roomName: string;
  type: string;
  description: string;
  connectedProjectTitle?: string;
  connectedProjectId?: string;
  svgIcon: string;
  unlockedNote?: string;
}

export interface Room {
  id: string;
  number: string;
  name: string;
  wing: string;
  level: "attic" | "upper" | "middle" | "ground";
  disciplines: string[];
  description: string;
  calloutPosition: {
    desktop: { x: number; y: number }; // percentage coordinates on cutaway
    labelSide: "left" | "right";
  };
  primaryProjectId: string;
  objectIds: string[];
  atmosphericNote: string;
}

export const PROJECTS: Record<string, Project> = {
  "selected-ui-ux": {
    id: "selected-ui-ux",
    title: "Selected UI/UX Work",
    subtitle: "Product Design · UX · Systems",
    category: "Product Design · UX · Digital Experiences",
    roomName: "The Studio",
    roomId: "studio",
    summary:
      "A collection of digital product interfaces, interaction architectures, and design systems crafted with clarity, typographic rigor, and human workflows.",
    overview:
      "This body of work focuses on translating complex relational data models and user workflows into quiet, intuitive, and frictionless interface architectures. Spanning design systems, multi-state prototypes, and information hierarchies, each system is engineered to reduce cognitive fatigue while maintaining structural precision.",
    disciplines: ["Product Design", "UX/UI Architecture", "Design Systems", "Interactive Prototyping"],
    role: "Lead Product Designer & System Architect",
    context:
      "Digital applications and software tools requiring multi-platform design tokens, cohesive design systems, and accessible end-user interaction models.",
    processPoints: [
      {
        title: "Information Architecture & Mental Models",
        description:
          "Mapping complex user goals into logical navigation schemas, tree hierarchies, and structured task paths.",
      },
      {
        title: "Design System Architecture",
        description:
          "Formulating foundational design tokens (spacing, typography, states, color logic) and reusable component libraries.",
      },
      {
        title: "Interactive Prototyping & Edge States",
        description:
          "Simulating real interactions, micro-behaviors, responsive breakpoints, and edge-case error states.",
      },
    ],
    outcomesPlaceholder:
      "Systemized component libraries, reduced workflow steps, verified usability improvements, and scalable design token architecture.",
    thumbnailPlaceholder: {
      label: "Selected UI/UX Work",
      caption: "Interface Wireframes · Component Schematics · Design Tokens",
      aspectRatio: "aspect-[16/10]",
    },
  },

  "learning-from-place": {
    id: "learning-from-place",
    title: "Learning From Place",
    subtitle: "Research · Ethnography · Service Design",
    category: "Service Design · Ethnography · Situated Research",
    roomName: "The Workroom",
    roomId: "workroom",
    summary:
      "Situated research grounded in ethnographic observation, community inquiry, and service design methodologies that learn directly from physical geography and social fabrics.",
    overview:
      "Stepping outside the computer screen, Learning From Place investigates how community infrastructure, public services, and communal memories are shaped by their physical geography. Through participatory fieldwork, qualitative interviews, and spatial service mapping, this inquiry asks how services can better honor the lived realities of people in place.",
    disciplines: ["Service Design", "Ethnography", "Situated Research", "Participatory Mapping"],
    role: "Design Researcher & Ethnographer",
    context:
      "Community contexts and localized public services requiring immersive qualitative fieldwork and human-centered systems inquiry.",
    processPoints: [
      {
        title: "Situated Ethnographic Observation",
        description:
          "Conducting non-intrusive participant observations and maintaining field journals to document everyday spatial interactions.",
      },
      {
        title: "Participatory Mapping & Interviews",
        description:
          "Engaging local community members in qualitative semi-structured interviews and participatory spatial journey mapping.",
      },
      {
        title: "Service Ecology Synthesis",
        description:
          "Translating qualitative fieldwork into visual service ecologies that highlight informal networks and systemic barriers.",
      },
    ],
    outcomesPlaceholder:
      "Ethnographic research synthesis, localized service blueprints, spatial opportunity maps, and participatory community recommendations.",
    thumbnailPlaceholder: {
      label: "Learning From Place",
      caption: "Field Observation Record · Geographic Service Map · Community Diary",
      aspectRatio: "aspect-[16/10]",
    },
  },

  "the-hands-that-forgot": {
    id: "the-hands-that-forgot",
    title: "The Hands That Forgot",
    subtitle: "Illustration · Narrative · Print",
    category: "Illustrated Narrative · Digital Culture · Touch",
    roomName: "The Library",
    roomId: "library",
    summary:
      "An illustrated visual narrative addressing tactile memory, screen saturation, and the changing role of manual dexterity and the human hand in digital life.",
    overview:
      "In an era where daily interactions are mediated almost exclusively by frictionless glass screens, The Hands That Forgot examines what is lost when manual habits, tactile resistance, and material crafts atrophy. Expressed through sequential ink drawings, bound book plates, and narrative prose, the project investigates touch as an epistemological sense.",
    disciplines: ["Illustrated Narrative", "Book Arts", "Visual Storytelling", "Cultural Critique"],
    role: "Author, Illustrator & Bookmaker",
    context:
      "Independent visual publication and artistic research examining the psychological and somatic effects of screen saturation.",
    processPoints: [
      {
        title: "Tactile Research & Material Studies",
        description:
          "Exploring physical paper stocks, ink resistances, and printmaking techniques to create somatic contrast against glass surfaces.",
      },
      {
        title: "Sequential Drawing & Narrative Pacing",
        description:
          "Developing sequential visual plates capturing gestures of the hand—pinching, scrolling, carving, grasping, and letting go.",
      },
      {
        title: "Binding & Folio Production",
        description:
          "Structuring the narrative as a physical tactile book where the weight, texture, and page-turns reinforce the story's inquiry.",
      },
    ],
    outcomesPlaceholder:
      "Printed illustrated publication, visual narrative sequence, exhibitions of tactile prints, and cultural inquiry essay.",
    thumbnailPlaceholder: {
      label: "The Hands That Forgot",
      caption: "Sequential Ink Folio · Illustrated Book Spread · Tactile Studies",
      aspectRatio: "aspect-[16/10]",
    },
  },

  "cetacean-communication-station": {
    id: "cetacean-communication-station",
    title: "Cetacean Communication Station",
    subtitle: "Speculative Design · Film · AI",
    category: "Speculative Design · AI · More-than-human Communication",
    roomName: "The Cinema",
    roomId: "cinema",
    summary:
      "A speculative investigation into interspecies interaction, machine listening, and bioacoustic apparatus situated beyond human-centric language frameworks.",
    overview:
      "What happens when artificial intelligence and sensory design are freed from anthropocentric linguistic structures? Cetacean Communication Station is a speculative design and moving image project that envisions an acoustic research station translating marine mammal bioacoustics through tactile hydrophone transducers and spatialized sound projections.",
    disciplines: ["Speculative Design", "Artificial Intelligence", "Moving Image", "Bioacoustics"],
    role: "Speculative Designer & Filmmaker",
    context:
      "Speculative technology inquiry exploring post-human communication, machine learning in non-human linguistics, and experimental video.",
    processPoints: [
      {
        title: "Marine Bioacoustics Research",
        description:
          "Investigating echolocation patterns, click cadences, and whistles to understand non-linear animal communication.",
      },
      {
        title: "Speculative Transducer Prototyping",
        description:
          "Designing speculative hardware concepts that transform ultrasonic ocean frequencies into physical haptic resonance for humans.",
      },
      {
        title: "Cinematic Moving Image Simulation",
        description:
          "Directing and editing atmospheric projection pieces that simulate the perceptual sensory world of non-human marine life.",
      },
    ],
    outcomesPlaceholder:
      "Speculative apparatus schematics, cinematic moving image piece, acoustic interactive simulation, and speculative design research dossier.",
    thumbnailPlaceholder: {
      label: "Cetacean Communication Station",
      caption: "Speculative Acoustic Dossier · Hydrophone Rig · Projection Still",
      aspectRatio: "aspect-[16/10]",
    },
  },
};

export const ROOMS: Record<string, Room> = {
  studio: {
    id: "studio",
    number: "01",
    name: "The Studio",
    wing: "Upper Floor · Right Wing",
    level: "upper",
    disciplines: ["UX/UI Design", "Product Design", "Design Systems"],
    description:
      "A high-ceiling workstation with drafting desks, screen mockups, component matrices, and interaction flows.",
    calloutPosition: {
      desktop: { x: 70, y: 35 },
      labelSide: "right",
    },
    primaryProjectId: "selected-ui-ux",
    objectIds: ["obj-laptop", "obj-token-board"],
    atmosphericNote: "Cool screen glow and structured drafting desk with wireframe layouts.",
  },

  workroom: {
    id: "workroom",
    number: "02",
    name: "The Workroom",
    wing: "Middle Floor · Left Wing",
    level: "middle",
    disciplines: ["Research", "Ethnography", "Service Design"],
    description:
      "An observational space with regional wall maps, participant transcripts, audio cassette recordings, and field notebooks.",
    calloutPosition: {
      desktop: { x: 26, y: 34 },
      labelSide: "left",
    },
    primaryProjectId: "learning-from-place",
    objectIds: ["obj-field-notebook", "obj-topographic-map"],
    atmosphericNote: "Warm incandescent work-lamp illuminating field notes and taped interviews.",
  },

  library: {
    id: "library",
    number: "03",
    name: "The Library",
    wing: "Upper Floor · Left Wing",
    level: "upper",
    disciplines: ["Illustration", "Visual Narratives", "Writing"],
    description:
      "Floor-to-ceiling shelves of bound folios, tactile paper samples, proof sheets, printmaking tools, and sequential ink drawings.",
    calloutPosition: {
      desktop: { x: 26, y: 15 },
      labelSide: "left",
    },
    primaryProjectId: "the-hands-that-forgot",
    objectIds: ["obj-illustrated-folio", "obj-ink-bottles"],
    atmosphericNote: "Paper-scented room lined with wooden shelves, soft lamplight, and ink drawings.",
  },

  cinema: {
    id: "cinema",
    number: "04",
    name: "The Cinema",
    wing: "Ground Floor · Right Wing",
    level: "ground",
    disciplines: ["Film", "Speculative Design", "Moving Image"],
    description:
      "A darkened projection chamber equipped with acoustic monitoring, sound transducers, and moving images exploring non-human communication.",
    calloutPosition: {
      desktop: { x: 74, y: 64 },
      labelSide: "right",
    },
    primaryProjectId: "cetacean-communication-station",
    objectIds: ["obj-film-reel", "obj-hydrophone"],
    atmosphericNote: "Deep shadows illuminated only by the glowing blue light of a whale projection.",
  },

  courtyard: {
    id: "courtyard",
    number: "05",
    name: "The Courtyard",
    wing: "Ground Floor · Open Lightwell",
    level: "ground",
    disciplines: ["Observations", "Photography", "Fragments"],
    description:
      "An open-air garden where sunlight and evening lamplight fall across stones, potted greenery, and uncataloged materials from daily creative practice.",
    calloutPosition: {
      desktop: { x: 24, y: 65 },
      labelSide: "left",
    },
    primaryProjectId: "learning-from-place",
    objectIds: ["obj-camera", "obj-paving-stone"],
    atmosphericNote: "Breeze through leaves, stone walls with pinned photographs, and quiet atmosphere.",
  },

  attic: {
    id: "attic",
    number: "06",
    name: "The Attic",
    wing: "Rooftop Gables",
    level: "attic",
    disciplines: ["Experiments", "Unfinished Ideas", "Process"],
    description:
      "The quiet top loft of the house filled with experimental prototypes, sketches, acoustic tapes, and work in progress.",
    calloutPosition: {
      desktop: { x: 68, y: 12 },
      labelSide: "right",
    },
    primaryProjectId: "cetacean-communication-station",
    objectIds: ["obj-origami-crane", "obj-brass-key"],
    atmosphericNote: "Dust motes in slanted roof light, curious objects tucked on beams.",
  },
};

export const COLLECTIBLE_OBJECTS: Record<string, CollectibleObject> = {
  "obj-laptop": {
    id: "obj-laptop",
    name: "Designer's Laptop",
    roomId: "studio",
    roomName: "The Studio",
    type: "Workstation",
    description: "Open workstation displaying digital product design tokens and component matrices.",
    connectedProjectTitle: "Selected UI/UX Work",
    connectedProjectId: "selected-ui-ux",
    svgIcon: "laptop",
    unlockedNote: "A window into interaction architecture and multi-platform design systems.",
  },
  "obj-token-board": {
    id: "obj-token-board",
    name: "Component Token Board",
    roomId: "studio",
    roomName: "The Studio",
    type: "Specimen",
    description: "A pinned corkboard mapping typography tokens, layout scales, and interface states.",
    connectedProjectTitle: "Selected UI/UX Work",
    connectedProjectId: "selected-ui-ux",
    svgIcon: "grid",
    unlockedNote: "Found on the studio wall: the anatomical rules governing user interfaces.",
  },
  "obj-dog-bed": {
    id: "obj-dog-bed",
    name: "Resident's Dog Bed & Chew Toys",
    roomId: "living_room",
    roomName: "The Living Room",
    type: "Domestic Artifact",
    description: "A woven bolster bed with soft chew toys in #769EFD, marking the domestic presence and companionship that grounds the spatial practice.",
    svgIcon: "home",
    unlockedNote: "A reminder of quiet routines and the domestic grounding behind digital systems.",
  },
  "obj-sofa": {
    id: "obj-sofa",
    name: "Low Architectural Sofa",
    roomId: "living_room",
    roomName: "The Living Room",
    type: "Architectural Furniture",
    description: "A low-slung modernist sofa upholstered in tactile charcoal cloth with periwinkle accent textiles, serving as a site for contemplation and reading.",
    svgIcon: "layout",
    unlockedNote: "A place to sit, observe spatial proportions, and disconnect from screen friction.",
  },
  "obj-coffee-table": {
    id: "obj-coffee-table",
    name: "Cast Coffee Table & Workstation",
    roomId: "living_room",
    roomName: "The Living Room",
    type: "Work Surface",
    description: "A monolithic low table supporting design specimens, physical notebooks, and an active digital design terminal.",
    connectedProjectTitle: "Selected UI/UX Work",
    connectedProjectId: "selected-ui-ux",
    svgIcon: "laptop",
    unlockedNote: "Where material artifacts meet digital product interfaces.",
  },
  "obj-field-notebook": {
    id: "obj-field-notebook",
    name: "Fieldwork Diary",
    roomId: "workroom",
    roomName: "The Workroom",
    type: "Research Log",
    description: "A cloth-bound notebook filled with handwritten observations, interview snippets, and community quotes.",
    connectedProjectTitle: "Learning From Place",
    connectedProjectId: "learning-from-place",
    svgIcon: "notebook",
    unlockedNote: "Careful ethnographic notes collected while listening to people in place.",
  },
  "obj-topographic-map": {
    id: "obj-topographic-map",
    name: "Topographic Study Map",
    roomId: "workroom",
    roomName: "The Workroom",
    type: "Cartography",
    description: "A detailed regional map charting public services, coastal geography, and community pathways.",
    connectedProjectTitle: "Learning From Place",
    connectedProjectId: "learning-from-place",
    svgIcon: "map",
    unlockedNote: "Connecting social infrastructure directly to the physical lay of the land.",
  },
  "obj-illustrated-folio": {
    id: "obj-illustrated-folio",
    name: "Printed Folio",
    roomId: "library",
    roomName: "The Library",
    type: "Publication",
    description: "An open book spread featuring sequential ink drawings of hands interacting with tools and screens.",
    connectedProjectTitle: "The Hands That Forgot",
    connectedProjectId: "the-hands-that-forgot",
    svgIcon: "book",
    unlockedNote: "A physical inquiry examining tactile memory in an era of slick glass.",
  },
  "obj-ink-bottles": {
    id: "obj-ink-bottles",
    name: "Drawing Inks & Nibs",
    roomId: "library",
    roomName: "The Library",
    type: "Studio Tool",
    description: "Soot-black drawing inks and steel nibs used for tactile narrative illustrations.",
    connectedProjectTitle: "The Hands That Forgot",
    connectedProjectId: "the-hands-that-forgot",
    svgIcon: "pen",
    unlockedNote: "The tools of the illustrator: physical resistance and indelible lines on cotton paper.",
  },
  "obj-film-reel": {
    id: "obj-film-reel",
    name: "Brass Film Canister",
    roomId: "cinema",
    roomName: "The Cinema",
    type: "Moving Image",
    description: "A heavy metallic film canister containing moving image studies of whale acoustics.",
    connectedProjectTitle: "Cetacean Communication Station",
    connectedProjectId: "cetacean-communication-station",
    svgIcon: "reel",
    unlockedNote: "A fragment from an ongoing exploration of moving image and speculative worlds.",
  },
  "obj-aquarium": {
    id: "obj-aquarium",
    name: "Interactive Aquarium",
    roomId: "living_room",
    roomName: "The Living Room",
    type: "Exhibit",
    description: "A dark‑wood framed aquarium with #769EFD water, aquatic plants, and a whale silhouette.",
    connectedProjectTitle: "Cetacean Communication Station",
    connectedProjectId: "cetacean-communication-station",
    svgIcon: "aquarium",
    unlockedNote: "An interactive exhibit linking to marine acoustic research."
  },
  "obj-hydrophone": {
    id: "obj-hydrophone",
    name: "Acoustic Hydrophone",
    roomId: "cinema",
    roomName: "The Cinema",
    type: "Sensor Apparatus",
    description: "An underwater acoustic sensor configured for non-human bioacoustic recording.",
    connectedProjectTitle: "Cetacean Communication Station",
    connectedProjectId: "cetacean-communication-station",
    svgIcon: "waveform",
    unlockedNote: "Listening past human frequencies to the vast communication networks of the sea.",
  },
  "obj-camera": {
    id: "obj-camera",
    name: "Observational Camera",
    roomId: "courtyard",
    roomName: "The Courtyard",
    type: "Optical Tool",
    description: "A mechanical 35mm rangefinder camera used for gathering observational light and texture.",
    connectedProjectTitle: "Learning From Place",
    connectedProjectId: "learning-from-place",
    svgIcon: "camera",
    unlockedNote: "A tool for noticing small gestures, shadows, and ordinary daily rhythms.",
  },
  "obj-origami-crane": {
    id: "obj-origami-crane",
    name: "Folded Paper Crane",
    roomId: "attic",
    roomName: "The Attic",
    type: "Experiment",
    description: "A delicate paper crane folded from architectural draft paper, tucked into roof rafters.",
    connectedProjectTitle: "Selected UI/UX Work",
    connectedProjectId: "selected-ui-ux",
    svgIcon: "paper",
    unlockedNote: "A reminder of tactile patience and the geometry of paper.",
  },
  "obj-brass-key": {
    id: "obj-brass-key",
    name: "Studio Skeleton Key",
    roomId: "attic",
    roomName: "The Attic",
    type: "Threshold",
    description: "An antique brass key that unlocks the back door leading into the courtyard.",
    svgIcon: "key",
    unlockedNote: "You found the key to the back door.",
  },
};
