interface FirestoreEditDocument {
  source?: string;
  versions?: string[];
  [key: string]: any;
}

/**
 * Converts source code to a standardized format and sets it as the first version
 * - Swaps letter/number note pitches in insert commands
 * - Sets explicit octaves for lh/rh commands
 * - Converts "anacrusis 4" to sections and phrases notation
 *
 * @param data Firestore document containing source code
 */
export function convertSourceToVersions(data: FirestoreEditDocument): void {
  // Return early if no source
  if (!data.source) return;

  // Create versions array if it doesn't exist
  if (!data.versions) {
    data.versions = [];
  }

  const lines = data.source.split("\n");
  const convertedLines = lines.map((line) => {
    // Skip empty lines
    if (line.trim() === "") {
      return line;
    }

    // Handle anacrusis 4 replacement
    if (line.trim() === "anacrusis 4") {
      return "sections 2 6\nphrases 1+1";
    }

    // Handle lh/rh replacement - including lines with comments
    // Match 'lh' at the beginning of the line or after whitespace,
    // followed by whitespace, comment or end of line
    if (/^lh(\s|%|$)/.test(line.trim())) {
      // Keep any comments that follow
      const commentPart = line.includes("%")
        ? line.substring(line.indexOf("%"))
        : "";
      const basePart = commentPart
        ? line.substring(0, line.indexOf("%")).trim()
        : line.trim();

      // If it already has a number after lh, don't modify
      if (/^lh\s+\d+/.test(basePart)) {
        return line;
      }

      return `lh 3${commentPart ? " " + commentPart : ""}`;
    }

    if (/^rh(\s|%|$)/.test(line.trim())) {
      // Keep any comments that follow
      const commentPart = line.includes("%")
        ? line.substring(line.indexOf("%"))
        : "";
      const basePart = commentPart
        ? line.substring(0, line.indexOf("%")).trim()
        : line.trim();

      // If it already has a number after rh, don't modify
      if (/^rh\s+\d+/.test(basePart)) {
        return line;
      }

      return `rh 5${commentPart ? " " + commentPart : ""}`;
    }

    // Skip processing comment-only lines
    if (line.trim().startsWith("%")) {
      return line;
    }

    // Handle insert commands
    if (/^\s*\d+(?:b\d+(?:\.\d+)?)?\s+i\s+/.test(line)) {
      // Find where the insert command starts
      const insertIndex = line.indexOf("i ") + 2;
      const beforeInsert = line.substring(0, insertIndex);
      const insertPart = line.substring(insertIndex);

      // Convert note pitches in the insert part
      const convertedInsert = convertNotePitches(insertPart);

      return beforeInsert + convertedInsert;
    }

    // No changes for other lines
    return line;
  });

  // Handle the result of the anacrusis replacement (it adds a line)
  const convertedSource = convertedLines
    .join("\n")
    .replace("sections 2 6\nphrases 1+1\n", "sections 2 6\nphrases 1+1\n");

  // Set as first version
  data.versions[0] = convertedSource;
}

/**
 * Converts note pitches according to the specified swap rules
 * a <-> 1, s <-> 2, etc.
 *
 * @param text The text containing note pitches to convert
 * @returns Converted text
 */
function convertNotePitches(text: string): string {
  let result = "";
  let inDurationMarker = false;

  // Split by comment if present to avoid converting note names in comments
  const parts = text.split("%");
  const notePart = parts[0];
  const commentPart = parts.length > 1 ? "%" + parts.slice(1).join("%") : "";

  // Process character by character for the note part
  for (let i = 0; i < notePart.length; i++) {
    const char = notePart[i];

    // Skip duration markers
    if (/[+_\-=,'"]/.test(char)) {
      inDurationMarker = true;
      result += char;
      continue;
    }

    // Check for dot or colon after duration marker
    if (inDurationMarker && /[.:]/.test(char)) {
      result += char;
      inDurationMarker = false;
      continue;
    }

    inDurationMarker = false;

    // Apply the note pitch swap rules
    switch (char) {
      // Letters to numbers
      case "a":
        result += "1";
        break;
      case "s":
        result += "2";
        break;
      case "d":
        result += "3";
        break;
      case "f":
        result += "4";
        break;
      case "g":
        result += "5";
        break;
      case "h":
        result += "6";
        break;
      case "j":
        result += "7";
        break;
      case "k":
        result += "8";
        break;
      case "l":
        result += "9";
        break;

      // Numbers to letters
      case "1":
        result += "a";
        break;
      case "2":
        result += "s";
        break;
      case "3":
        result += "d";
        break;
      case "4":
        result += "f";
        break;
      case "5":
        result += "g";
        break;
      case "6":
        result += "h";
        break;
      case "7":
        result += "j";
        break;
      case "8":
        result += "k";
        break;
      case "9":
        result += "l";
        break;
      case "0":
        result += "e";
        break;

      // Pass through all other characters unchanged
      default:
        result += char;
    }
  }

  // Add back the comment part unchanged
  return result + commentPart;
}
