import autoBindReact from "auto-bind/react";
import EventEmitter from "events";
import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import md5 from "md5";
import { CATALOG_PREFIX } from "./config";
import promisify from "./promisify-xhr";

export default class Sequencer extends EventEmitter {
  constructor(players, history) {
    super();
    autoBindReact(this);

    this.player = null;
    this.players = players;

    this.currIdx = 0;
    this.context = null;
    this.currUrl = null;
    this.songRequest = null;
    this.history = history;

    this.players.forEach((player) => {
      player.on("playerStateUpdate", this.handlePlayerStateUpdate);
      player.on("playerError", this.handlePlayerError);
    });
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

  getPlayer() {
    return this.player;
  }

  getCurrIdx() {
    return this.currIdx;
  }

  playSong(url) {
    if (this.player !== null) {
      this.player.suspend();
    }

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
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].canPlay(ext)) {
        this.player = this.players[i];
        break;
      }
    }
    if (this.player === null) {
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
    if (this.player !== null) {
      this.player.suspend();
    }

    const ext = filepath.split(".").pop().toLowerCase();

    // Find a player that can play this filetype
    const player = this.players.find((player) => player.canPlay(ext));
    if (player == null) {
      this.emit("playerError", `The file format ".${ext}" was not recognized.`);
      return;
    } else {
      this.player = player;
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
    this.player.setTempo(1);
    let result;
    try {
      result = await this.player.loadData(uint8Array, filepath);
    } catch (e) {
      this.handlePlayerError(`Unable to play ${filepath} (${e.message}).`);
    }
    const numVoices = this.player.getNumVoices();
    this.player.setVoiceMask([...Array(numVoices)].fill(true));
    return result;
  }
}
