import { writeFileSync } from "fs";
import { join } from "path";

interface Spaceship {
  id: string;
  name: string;
}

const prefixes = ["USS", "ISS", "HWSS", "DSV", "GSV", "USCSS", "BG"] as const;
const elements = [
  "Nova",
  "Stellar",
  "Nebula",
  "Cosmos",
  "Galaxy",
  "Phoenix",
  "Voyager",
  "Explorer",
  "Discovery",
  "Odyssey",
  "Nostromo",
  "Sulaco",
  "Auriga",
  "Covenant",
  "Prometheus",
  "Narcissus",
  "Sevastopol",
] as const;
const suffixes = [
  "Prime",
  "Alpha",
  "Beta",
  "One",
  "Two",
  "X",
  "Mark-II",
  "Elite",
  "Supreme",
  "Station",
  "Commercial",
] as const;

function generateShipName(): string {
  const usePrefix = Math.random() < 0.7; // 70% chance to use prefix
  const useSuffix = Math.random() < 0.7; // Increased to 70% chance to use suffix

  const prefix = usePrefix
    ? (prefixes[Math.floor(Math.random() * prefixes.length)] ?? "USS")
    : "";
  const element =
    elements[Math.floor(Math.random() * elements.length)] ?? "Nova";

  let suffix = "";
  if (useSuffix) {
    const baseSuffix =
      suffixes[Math.floor(Math.random() * suffixes.length)] ?? "One";
    // 50% chance to add a number from 1-999 to the suffix
    const addNumber = Math.random() < 0.5;
    if (addNumber) {
      const number = Math.floor(Math.random() * 999) + 1;
      suffix = `${baseSuffix}-${number}`;
    } else {
      suffix = baseSuffix;
    }
  }

  return [prefix, element, suffix].filter(Boolean).join(" ");
}

function generateTestDocs(count: number): Spaceship[] {
  console.log("Generating test data...");
  const docs: Spaceship[] = [];

  // Calculate target unique names (50% of total count)
  const targetUniqueNames = Math.floor(count / 2);

  // Generate unique names more efficiently with a timeout
  const possibleNames = new Set<string>();
  const maxAttempts = targetUniqueNames * 2; // Prevent infinite loops
  let attempts = 0;

  while (possibleNames.size < targetUniqueNames && attempts < maxAttempts) {
    possibleNames.add(generateShipName());
    attempts++;
  }

  const nameArray = Array.from(possibleNames);
  console.log(`Generated ${nameArray.length} unique ship names`);

  // Generate documents
  for (let i = 0; i < count; i++) {
    const nameIndex = Math.floor(Math.random() * nameArray.length);
    const name =
      nameArray[nameIndex] ?? `Backup Ship ${i.toString().padStart(5, "0")}`;

    docs.push({
      id: `ship${i.toString().padStart(6, "0")}`,
      name,
    });
  }

  return docs;
}

// Generate and save test data
const docCount = parseInt(process.argv[2] ?? "100");
const testDocs = generateTestDocs(docCount);
const outputPath = join(__dirname, `benchmark-data-${docCount}.json`);
writeFileSync(outputPath, JSON.stringify(testDocs, null, 2));
