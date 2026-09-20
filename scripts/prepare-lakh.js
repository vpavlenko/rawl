"use strict";

const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");
const StreamZip = require("node-stream-zip");

// Bundled archives are expanded to ordinary static files. No network or server
// endpoint is required at build time or during playback.
async function prepareLakh(publicDirectory) {
  const source = path.resolve(__dirname, "../assets/lakh");
  const manifest = JSON.parse(
    fs.readFileSync(path.join(source, "manifest.json"), "utf8"),
  );
  const target = path.join(publicDirectory, "lakh-data");
  const fingerprint = crypto
    .createHash("sha256")
    .update(JSON.stringify(manifest))
    .digest("hex");
  const stamp = path.join(target, ".version");
  if (fs.existsSync(stamp) && fs.readFileSync(stamp, "utf8") === fingerprint)
    return;
  const staging = `${target}.tmp`;
  fs.emptyDirSync(staging);
  try {
    for (const archive of manifest.archives) {
      const file = path.join(source, archive.file);
      const hash = crypto
        .createHash("sha256")
        .update(fs.readFileSync(file))
        .digest("hex");
      if (hash !== archive.sha256)
        throw new Error(`Lakh archive checksum mismatch: ${archive.file}`);
      await new Promise((resolve, reject) => {
        // The artist D:Ream is a legitimate relative directory on our hosts.
        // Validate containment ourselves instead of treating "D:" as a drive.
        const zip = new StreamZip({
          file,
          storeEntries: true,
          skipEntryNameValidation: true,
        });
        zip.on("error", (error) => {
          zip.close();
          reject(error);
        });
        zip.on("ready", () => {
          for (const entry of Object.values(zip.entries())) {
            const destination = path.resolve(staging, entry.name);
            if (
              !destination.startsWith(path.resolve(staging) + path.sep) ||
              entry.name.includes("\\")
            ) {
              zip.close();
              reject(new Error(`Unsafe Lakh archive path: ${entry.name}`));
              return;
            }
          }
          zip.extract(null, staging, (error) => {
            zip.close();
            if (error) reject(error);
            else resolve();
          });
        });
      });
    }
    fs.writeFileSync(path.join(staging, ".version"), fingerprint);
    fs.removeSync(target);
    fs.renameSync(staging, target);
    console.log(
      `Prepared ${manifest.trackCount} Lakh tracks for static serving.`,
    );
  } catch (error) {
    fs.removeSync(staging);
    throw error;
  }
}

module.exports = prepareLakh;
if (require.main === module) {
  prepareLakh(path.resolve(__dirname, "../public")).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
