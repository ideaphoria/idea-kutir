export interface DialogueLine {
  speaker: string;
  text: string;
}

/**
 * Curated list of ridiculous, non-offensive names assigned by the Host
 * when a player refuses to provide their own name.
 * ONLY these 12 exact names are permitted.
 */
export const RANDOM_HOST_NAMES: string[] = [
  "Elongated Muskrat",
  "Moon Moon",
  "Pizza with left beef",
  "Bumpershoot Cumbernickle",
  "Anil from HR",
  "It's Becky",
  "Johnny Again",
  "Jor Jor Well",
  "Batmo Biel",
  "Wait For It",
  "Regina Phalenge",
  "Boaty McBoatface",
];

export function getRandomHostName(): string {
  const index = Math.floor(Math.random() * RANDOM_HOST_NAMES.length);
  return RANDOM_HOST_NAMES[index];
}

/**
 * The Host's initial lines upon the player's first object inspection,
 * leading directly up to the name request.
 */
export const HOST_FIRST_MEETING_LINES: DialogueLine[] = [
  {
    speaker: "Master of the House",
    text: "Oh, splendid. An audience member who touches the exhibits.\nWe're making progress already.",
  },
  {
    speaker: "Master of the House",
    text: "Now, I can't keep calling you you. It's dreadfully impersonal, and I do so hate being impersonal.",
  },
  {
    speaker: "Master of the House",
    text: "Your name, please. And do try to make it legible. The walls are terrible gossips.",
  },
];

/**
 * Intermediate refusal response dialogue line:
 * Exact required text: "Wow ok mr busy prime minister...I'll do it myself."
 */
export const HOST_REFUSAL_RESPONSE_LINE: DialogueLine = {
  speaker: "Master of the House",
  text: "Wow ok mr busy prime minister...I'll do it myself.",
};

/**
 * The Host's response when the player submits a name.
 */
export function getHostNameConfirmedDialogue(name: string): DialogueLine[] {
  return [
    {
      speaker: "Master of the House",
      text: `${name}. Delightful. Terribly mortal, of course, but it will do nicely for the ledger.`,
    },
    {
      speaker: "Master of the House",
      text: `Consider yourself officially enrolled, ${name}.\nTry not to lean against the corners. Some of them haven't decided if they're exits yet.`,
    },
  ];
}

/**
 * The Host's response when the player refuses to give a name.
 * Reveals the assigned name as an official administrative decision.
 */
export function getHostNameRefusedDialogue(assignedName: string): DialogueLine[] {
  return [
    {
      speaker: "Master of the House",
      text: `Fine. Your official designation is ${assignedName}.`,
    },
    {
      speaker: "Master of the House",
      text: "There. Settled. You really should have let me handle this.",
    },
    {
      speaker: "Master of the House",
      text: `Mind your manners, ${assignedName}.\nThe house has an exquisite memory and extraordinarily little patience for unregistered loiterers.`,
    },
  ];
}

/**
 * Contextual Host commentary for inspecting and revisiting objects in the house.
 */
export function getHostObjectCommentary(
  objectId: string,
  objectName: string,
  inspectionCount: number,
  playerName: string
): DialogueLine[] {
  const displayName = playerName || "curious wanderer";

  if (inspectionCount === 1) {
    switch (objectId) {
      case "obj-hallway-portrait":
        return [
          {
            speaker: "Master of the House",
            text: `Inspecting the resident portrait, ${displayName}?\nA handsome likeness. Notice how the whiskers follow you across the parquet?`,
          },
        ];
      case "obj-hallway-map":
        return [
          {
            speaker: "Master of the House",
            text: `Studying the blueprints, ${displayName}?\nA charming habit. Just bear in mind: the house occasionally drafts revisions while we sleep.`,
          },
        ];
      case "obj-aquarium":
        return [
          {
            speaker: "Master of the House",
            text: `Admiring the fish, ${displayName}?\nThey've been swimming in circles since Tuesday last century. Excellent stamina, poor conversationalists.`,
          },
        ];
      case "obj-token-board":
        return [
          {
            speaker: "Master of the House",
            text: `The design tokens, ${displayName}.\nOrderly rows of tidy intentions. The architecture finds them quaint.`,
          },
        ];
      case "obj-dog-bed":
        return [
          {
            speaker: "Master of the House",
            text: `A velvet cushion on the floorboards, ${displayName}.\nDo not attempt to sleep on it. The resident claims dibs with absolute authority.`,
          },
        ];
      case "obj-coffee-table":
        return [
          {
            speaker: "Master of the House",
            text: `The table of curiosities, ${displayName}.\nEverything in its proper place, until the foundations decide to shiver.`,
          },
        ];
      default:
        return [
          {
            speaker: "Master of the House",
            text: `Examining ${objectName}, are we?\nDo be careful. Everything here was placed with deliberate purpose. Mostly.`,
          },
        ];
    }
  }

  // Revisited commentary (count > 1)
  switch (objectId) {
    case "obj-hallway-portrait":
      return [
        {
          speaker: "Master of the House",
          text: `Back at the portrait again, ${displayName}?\nStill a cat. Still watching you. It hasn't forgotten whatever you did out in the foyer.`,
        },
      ];
    case "obj-hallway-map":
      return [
        {
          speaker: "Master of the House",
          text: `Checking the map a second time, ${displayName}?\nLost already? I told you: standard geometry is merely a courtesy here.`,
        },
      ];
    case "obj-aquarium":
      return [
        {
          speaker: "Master of the House",
          text: `Tapping on the glass again, ${displayName}?\nThe fish don't speak English. Or rather, they do, but they find you uninteresting.`,
        },
      ];
    default:
      return [
        {
          speaker: "Master of the House",
          text: `Back for another look at ${objectName}, ${displayName}?\nConsistency is a virtue. Or a symptom. One of the two.`,
        },
      ];
  }
}

/**
 * Profile-click Easter egg dialogue lines.
 * Triggered exclusively on the 4th activation of the profile portrait.
 */
export const PROFILE_EASTER_EGG_LINE_1: DialogueLine = {
  speaker: "Master of the House",
  text: "Slow day is it?",
};

export const PROFILE_EASTER_EGG_LINE_2: DialogueLine = {
  speaker: "Master of the House",
  text: "keep marching home",
};

/**
 * Study Computer first encounter dialogue (triggered once on first interaction).
 * Exact wording:
 * “Ah. Where all those very important things happen that people insist on calling work.”
 * “She hasn't been here for a long time...”
 */
export const STUDY_COMPUTER_FIRST_ENCOUNTER_LINES: DialogueLine[] = [
  {
    speaker: "Master of the House",
    text: "Ah. Where all those very important things happen that people insist on calling work.",
  },
  {
    speaker: "Master of the House",
    text: "She hasn't been here for a long time...",
  },
];

/**
 * Study Computer post-close dialogue (triggered once after closing the project viewer).
 * Exact wording:
 * “Well? Did you find something useful, or are we merely admiring the furniture?”
 * CTA: "Moving on"
 */
export const STUDY_COMPUTER_AFTER_CLOSE_LINES: DialogueLine[] = [
  {
    speaker: "Master of the House",
    text: "Well? Did you find something useful, or are we merely admiring the furniture?",
  },
];

/**
 * Empty Gallery Frame dialogue (triggered when interacting with an empty frame).
 * Title: "GALLERY SLOT"
 * Message: "This frame is waiting for its artwork."
 * CTA: "OK"
 */
export const GALLERY_SLOT_EMPTY_LINES: DialogueLine[] = [
  {
    speaker: "GALLERY SLOT",
    text: "This frame is waiting for its artwork.",
  },
];

