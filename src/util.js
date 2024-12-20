import path from "path";
import queryString from "querystring";

import { CATALOG_PREFIX } from "./config";

export function updateQueryString(newParams) {
  // Merge new params with current query string
  const params = {
    ...queryString.parse(window.location.search.substr(1)),
    ...newParams,
  };
  // Delete undefined properties
  Object.keys(params).forEach(
    (key) => params[key] === undefined && delete params[key],
  );
  // Object.keys(params).forEach(key => params[key] = decodeURIComponent(params[key]));
  const stateUrl = "?" + queryString.stringify(params).replace(/%20/g, "+");
  // Update address bar URL
  window.history.replaceState(null, "", stateUrl);
}

export function unlockAudioContext(context) {
  return new Promise((resolve) => {
    if (context.state === "suspended") {
      const events = ["touchstart", "touchend", "mousedown", "mouseup"];
      const unlock = () => {
        context.resume().then(() => {
          events.forEach((event) =>
            document.body.removeEventListener(event, unlock),
          );
          resolve();
        });
      };
      events.forEach((event) =>
        document.body.addEventListener(event, unlock, false),
      );
    } else {
      resolve();
    }
  });
}

export function titlesFromMetadata(metadata) {
  if (metadata.formatted) {
    return metadata.formatted;
  }

  const title = allOrNone(metadata.artist, " - ") + metadata.title;
  const subtitle =
    [metadata.game, metadata.system].filter((x) => x).join(" - ") +
    allOrNone(" (", metadata.copyright, ")");
  return { title, subtitle };
}

export function allOrNone(...args) {
  let str = "";
  for (let i = 0; i < args.length; i++) {
    if (!args[i]) return "";
    str += args[i];
  }
  return str;
}

export function getFilepathFromUrl(url) {
  return url.replace(CATALOG_PREFIX, "/");
}

export function ensureEmscFileWithUrl(emscRuntime, filename, url) {
  if (emscRuntime.FS.analyzePath(filename).exists) {
    console.debug(`${filename} exists in Emscripten file system.`);
    return Promise.resolve(filename);
  } else {
    console.log(`Downloading ${filename}...`);
    return fetch(url)
      .then((response) => {
        // Because fetch doesn't reject on 404
        if (!response.ok)
          throw Error(`HTTP ${response.status} while fetching ${filename}`);
        return response;
      })
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const arr = new Uint8Array(buffer);
        return ensureEmscFileWithData(emscRuntime, filename, arr, true);
      });
  }
}

export function ensureEmscFileWithData(
  emscRuntime,
  filename,
  uint8Array,
  forceWrite = false,
) {
  if (!forceWrite && emscRuntime.FS.analyzePath(filename).exists) {
    console.debug(`${filename} exists in Emscripten file system.`);
    return Promise.resolve(filename);
  } else {
    console.debug(`Writing ${filename} to Emscripten file system...`);
    const dir = path.dirname(filename);
    emscRuntime.FS.mkdirTree(dir);
    emscRuntime.FS.writeFile(filename, uint8Array);
    return new Promise((resolve, reject) => {
      emscRuntime.FS.syncfs(false, (err) => {
        if (err) {
          console.error("Error synchronizing to indexeddb.", err);
          reject(err);
        } else {
          console.debug(`Synchronized ${filename} to indexeddb.`);
          resolve(filename);
        }
      });
    });
  }
}

export function remap(number, fromLeft, fromRight, toLeft, toRight) {
  return (
    toLeft + ((number - fromLeft) / (fromRight - fromLeft)) * (toRight - toLeft)
  );
}

export function remap01(number, toLeft, toRight) {
  return remap(number, 0, 1, toLeft, toRight);
}
