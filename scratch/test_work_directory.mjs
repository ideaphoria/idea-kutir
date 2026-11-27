import fs from "fs";
import path from "path";

const rootDir = process.cwd();

// 1. Verify all icons exist on disk
const expectedIcons = [
  "room-lamp.svg",
  "room-computer.svg",
  "room-palette.svg",
  "room-bed.svg",
  "folder-closed.svg",
  "folder-open.svg",
  "file-doc.svg",
  "file-project.svg",
  "tree-expand.svg",
  "tree-collapse.svg",
  "nav-up.svg",
];

console.log("Checking SVG icons in public/icons/win95/...");
for (const icon of expectedIcons) {
  const p = path.join(rootDir, "public", "icons", "win95", icon);
  if (!fs.existsSync(p)) {
    console.error(`FAIL: Missing icon ${icon} at ${p}`);
    process.exit(1);
  }
}
console.log("PASS: All 11 retro Windows 95 icons exist.");

// 2. Read data/directoryData.ts and verify contents
const directoryDataSrc = fs.readFileSync(path.join(rootDir, "data", "directoryData.ts"), "utf-8");

// Assert strict exclusion of second-floor rooms from ground-floor array
const forbiddenKeywords = [
  "second_floor_landing",
  "second_floor_hallway",
  "bedroom_1",
  "balcony",
  "bedroom_2",
  "the-hands-that-forgot",
];

for (const kw of forbiddenKeywords) {
  if (directoryDataSrc.includes(`"${kw}"`) || directoryDataSrc.includes(`'${kw}'`)) {
    console.error(`FAIL: Forbidden second-floor reference '${kw}' found in data/directoryData.ts!`);
    process.exit(1);
  }
}
console.log("PASS: Strictly zero second-floor references in data/directoryData.ts.");

// 3. Inspect directory items and rooms
// Extract items array using simple regex/eval or structure check
const hasEntranceHall = directoryDataSrc.includes('"entrance_hall"');
const hasLivingRoom = directoryDataSrc.includes('"living_room"');
const hasStudy = directoryDataSrc.includes('"study"');
const hasArtRoom = directoryDataSrc.includes('"art_room"');

if (!hasEntranceHall || !hasLivingRoom || !hasStudy || !hasArtRoom) {
  console.error("FAIL: Missing expected ground-floor rooms in directoryData.ts");
  process.exit(1);
}
console.log("PASS: All 4 ground-floor rooms present in directoryData.ts.");

// 4. Verify custom icon assignments
if (!directoryDataSrc.includes("/icons/win95/room-lamp.svg") ||
    !directoryDataSrc.includes("/icons/win95/room-computer.svg") ||
    !directoryDataSrc.includes("/icons/win95/room-palette.svg") ||
    !directoryDataSrc.includes("/icons/win95/folder-closed.svg")) {
  console.error("FAIL: Custom room icons not properly assigned in directoryData.ts");
  process.exit(1);
}
console.log("PASS: Custom room icons (lamp, computer, palette, folder) properly assigned.");

// 5. Verify action labels
if (!directoryDataSrc.includes('actionLabel: "[ Open ]"') ||
    !directoryDataSrc.includes('actionLabel: "[ Open Website ]"') ||
    !directoryDataSrc.includes('actionLabel: "[ View Collection ]"')) {
  console.error("FAIL: Required action labels ([ Open ], [ Open Website ], [ View Collection ]) not found");
  process.exit(1);
}
console.log("PASS: Required action labels are properly configured.");

// 6. Verify Play House preservation in data/house3d.ts
const house3dSrc = fs.readFileSync(path.join(rootDir, "data", "house3d.ts"), "utf-8");
const secondFloorRooms = ["bedroom_2", "bedroom_1", "second_floor_landing", "second_floor_hallway", "balcony"];
for (const r of secondFloorRooms) {
  if (!house3dSrc.includes(r)) {
    console.error(`FAIL: Play House room '${r}' missing from data/house3d.ts!`);
    process.exit(1);
  }
}
console.log("PASS: Play House second-floor rooms fully intact in data/house3d.ts.");

// 7. Verify AsciiHouse.tsx modal close Host dialogue suppression
const asciiHouseSrc = fs.readFileSync(path.join(rootDir, "components/ascii/AsciiHouse.tsx"), "utf-8");
if (!asciiHouseSrc.includes('if (mode === "work") return;')) {
  console.error("FAIL: AsciiHouse.tsx does not suppress Host dialogue in Work Mode!");
  process.exit(1);
}
console.log("PASS: AsciiHouse.tsx suppresses Host dialogue in Work Mode on modal close.");

console.log("\nALL DIRECTORY INTEGRITY TESTS PASSED!");
