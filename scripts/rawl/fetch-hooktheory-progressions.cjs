// Optional official API adapter. A token is required; no credentials are stored.
// HOOKTHEORY_TOKEN=... node scripts/rawl/fetch-hooktheory-progressions.cjs
//   --cp 4,b7,1 [--scale major] [--pages 5] [--output file.json]
const fs = require("fs"),
  path = require("path");
const args = process.argv.slice(2),
  value = (name, fallback) => {
    const i = args.indexOf(name);
    return i < 0 ? fallback : args[i + 1];
  };
async function main() {
  const token = process.env.HOOKTHEORY_TOKEN,
    cp = value("--cp"),
    pages = Number(value("--pages", 5));
  if (!token || !cp || !Number.isInteger(pages) || pages < 1 || pages > 100)
    throw new Error(
      "Set HOOKTHEORY_TOKEN, --cp and optional --pages (1–100). See Hooktheory's official API documentation.",
    );
  const songs = [];
  for (let page = 1; page <= pages; page++) {
    const query = new URLSearchParams({ cp, page: String(page) }),
      scale = value("--scale");
    if (scale) query.set("scale", scale);
    const response = await fetch(
      `https://api.hooktheory.com/v1/trends/songs?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );
    if (!response.ok)
      throw new Error(
        `Hooktheory returned HTTP ${response.status}. Refresh the token for 401; respect Retry-After for 429.`,
      );
    const batch = await response.json();
    if (!Array.isArray(batch))
      throw new Error("Unexpected Hooktheory response.");
    songs.push(
      ...batch.map((song) => ({
        artist: song.artist,
        title: song.song,
        section: song.section,
        source: song.url,
        kind: "progression-presence",
        childPath: cp,
      })),
    );
    if (batch.length < 20) break;
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
  const output = path.resolve(
    value("--output", "reports/lakh-harmony/hooktheory-presence.json"),
  );
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(
    output,
    JSON.stringify(
      {
        query: cp,
        scale: value("--scale") || null,
        retrievedAt: new Date().toISOString(),
        songs,
      },
      null,
      2,
    ),
  );
  console.log(
    `Saved ${songs.length} weak progression-presence labels. These contain no chord timings.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
