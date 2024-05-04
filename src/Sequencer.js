import autoBindReact from "auto-bind/react";
import EventEmitter from "events";
import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import md5 from "md5";
import { CATALOG_PREFIX } from "./config";
import promisify from "./promisify-xhr";

export default class Sequencer extends EventEmitter {
  constructor(midiPlayer, history) {
    super();
    autoBindReact(this);

    this.midiPlayer = midiPlayer;

    this.currIdx = 0;
    this.context = null;
    this.currUrl = null;
    this.songRequest = null;
    this.history = history;

    midiPlayer.on("playerStateUpdate", this.handlePlayerStateUpdate);
    midiPlayer.on("playerError", this.handlePlayerError);
  }

  handlePlayerError(e) {
    this.emit("playerError", e);
    this.emit("sequencerStateUpdate", { isEjected: true });
  }

  handlePlayerStateUpdate(playerState) {
    const { isStopped } = playerState;
    console.debug("Sequencer.handlePlayerStateUpdate(isStopped=%s)", isStopped);

    if (isStopped) {
      this.currUrl = null;
    } else {
      this.emit("sequencerStateUpdate", {
        url: this.currUrl,
        hasPlayer: true,
        // TODO: combine isEjected and hasPlayer
        isEjected: false,
        ...playerState,
      });
    }
  }

  playContext(context, index = 0) {
    this.currIdx = index;
    this.context = context;
    this.playSong(this.context[this.currIdx], 0);
  }

  getCurrIdx() {
    return this.currIdx;
  }

  playSong(url) {
    this.midiPlayer.suspend();

    if (url.startsWith("static/f")) return;

    if (url.startsWith("static")) {
      url = url.replace("static", "https://rawl.rocks/midi");
    } else {
      // Normalize url - paths are assumed to live under CATALOG_PREFIX
      url =
        url.startsWith("http") || url.startsWith("f:")
          ? url
          : CATALOG_PREFIX + encodeURIComponent(encodeURIComponent(url));
    }

    // Find a player that can play this filetype
    const ext =
      url.includes("score.mid") || url.startsWith("f:")
        ? "mid"
        : url.split(".").pop().toLowerCase();

    if (!this.midiPlayer.canPlay(ext)) {
      this.emit("playerError", `The file format ".${ext}" was not recognized.`);
      return;
    }

    if (url.startsWith("f:")) {
      const playFromFirestore = async () => {
        const firestore = getFirestore();
        const { blob } = (
          await getDoc(doc(firestore, "midis", url.slice(2)))
        ).data();
        this.playSongBuffer(url, blob);
      };
      playFromFirestore();
    } else {
      // Fetch the song file (cancelable request)
      // Cancel any outstanding request so that playback doesn't happen out of order
      if (this.songRequest) this.songRequest.abort();
      this.songRequest = promisify(new XMLHttpRequest());
      this.songRequest.responseType = "arraybuffer";
      this.songRequest.open("GET", url);
      this.songRequest
        .send()
        .then((xhr) => xhr.response)
        .then((buffer) => {
          this.currUrl = url;
          const filepath = url.replace(CATALOG_PREFIX, "");
          this.playSongBuffer(filepath, buffer);
        })
        .catch((e) => {
          this.handlePlayerError(
            e.message || `HTTP ${e.status} ${e.statusText} ${url}`,
          );
        });
    }
  }

  async playSongFile(filepath, songData) {
    this.midiPlayer.suspend();

    const ext = filepath.split(".").pop().toLowerCase();

    // Find a player that can play this filetype

    if (!this.midiPlayer.canPlay(ext)) {
      this.emit("playerError", `The file format ".${ext}" was not recognized.`);
      return;
    }

    this.context = [];
    this.currUrl = null;
    return this.playSongBuffer(filepath, songData);
  }

  async playSongBuffer(filepath, buffer) {
    const uint8Array = buffer._byteString
      ? Uint8Array.from(buffer._byteString.binaryString, (e) => e.charCodeAt(0))
      : new Uint8Array(buffer);
    this.hash = md5(uint8Array);
    console.log("MD5", this.hash);
    this.midiPlayer.setTempo(1);
    let result;
    try {
      result = await this.midiPlayer.loadData(uint8Array, filepath);
    } catch (e) {
      this.handlePlayerError(`Unable to play ${filepath} (${e.message}).`);
    }
    const numVoices = this.midiPlayer.getNumVoices();
    this.midiPlayer.setVoiceMask([...Array(numVoices)].fill(true));
    return result;
  }
}
