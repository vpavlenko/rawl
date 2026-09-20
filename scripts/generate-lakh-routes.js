"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { transliterate } = require("transliteration");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "public/lakh-index.json");
const registryPath = path.join(root, "assets/lakh/routes.json");
const catalog = JSON.parse(fs.readFileSync(indexPath, "utf8"));
// Retain removed entries too: an import must never recycle an existing URL.
const registry = fs.existsSync(registryPath)
  ? JSON.parse(fs.readFileSync(registryPath, "utf8"))
  : { version: 1, artists: [] };
if (registry.version !== 1) throw new Error("Unsupported Lakh route registry");

function allocate(names, previous, label) {
  const result = new Map(previous.map(({ name, slug }) => [name, slug]));
  const owners = new Map();
  const legacyOwners = new Map();
  for (const name of [...names, ...result.keys()]) {
    const key = label(name).toLowerCase();
    const group = legacyOwners.get(key) || new Set();
    group.add(name);
    legacyOwners.set(key, group);
  }
  for (const [name, slug] of result) {
    if (
      !/^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)*$/.test(slug) ||
      owners.has(slug.toLowerCase())
    ) {
      throw new Error(`Invalid or duplicate saved Lakh slug: ${slug}`);
    }
    owners.set(slug.toLowerCase(), name);
  }
  for (const name of [...names].sort()) {
    if (result.has(name)) continue;
    const base =
      transliterate(label(name))
        .replace(/[^A-Za-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "Untitled";
    const available = (candidate) => {
      const key = candidate.toLowerCase();
      return (
        !owners.has(key) &&
        ![...(legacyOwners.get(key) || [])].some((owner) => owner !== name)
      );
    };
    let slug = base;
    if (!available(slug)) {
      const hash = crypto.createHash("sha256").update(name).digest("hex");
      let length = 8;
      do {
        if (length > hash.length)
          throw new Error(`Cannot allocate Lakh slug: ${name}`);
        slug = `${base}_${hash.slice(0, length++)}`;
      } while (!available(slug));
    }
    result.set(name, slug);
    owners.set(slug.toLowerCase(), name);
  }
  return result;
}

const artists = new Map(
  registry.artists.map((artist) => [artist.name, artist]),
);
const artistSlugs = allocate(
  catalog.artists.map((artist) => artist.name),
  registry.artists,
  (name) => name,
);
for (const artist of catalog.artists) {
  const previous = artists.get(artist.name);
  const tracks = allocate(artist.tracks, previous?.tracks || [], (name) =>
    name.replace(/\.mid$/i, ""),
  );
  artist.slug = artistSlugs.get(artist.name);
  artist.trackSlugs = Object.fromEntries(
    artist.tracks.map((name) => [name, tracks.get(name)]),
  );
  artists.set(artist.name, {
    name: artist.name,
    slug: artist.slug,
    tracks: [...tracks]
      .map(([name, slug]) => ({ name, slug }))
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
  });
}
registry.artists = [...artists.values()].sort((a, b) =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
);
fs.writeFileSync(registryPath, JSON.stringify(registry) + "\n");
fs.writeFileSync(indexPath, JSON.stringify(catalog) + "\n");
console.log(
  `Generated persistent underscore URLs for ${catalog.trackCount} Lakh tracks.`,
);
