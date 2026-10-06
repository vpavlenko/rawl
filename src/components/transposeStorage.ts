const STORAGE_KEY = "rawl.transposeSettings";

export function readTransposeSettings() {
  const defaults = { persistTranspose: false, transpose: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.persistTranspose !== true) return defaults;
    return {
      persistTranspose: true,
      transpose: Number.isInteger(saved.transpose) && Math.abs(saved.transpose) <= 12
        ? saved.transpose
        : 0,
    };
  } catch {
    return defaults;
  }
}

export function saveTransposeSettings(persistTranspose: boolean, transpose: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      persistTranspose,
      transpose: persistTranspose ? transpose : 0,
    }));
  } catch (error) {
    console.warn("Unable to save transposition settings:", error);
  }
}
