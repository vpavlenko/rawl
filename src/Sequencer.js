import autoBindReact from "auto-bind/react";
import EventEmitter from "events";
import md5 from "md5";
import { CATALOG_PREFIX } from "./config";
import promisify from "./promisify-xhr";

export const REPEAT_OFF = 0;
export const REPEAT_ALL = 1;
export const REPEAT_ONE = 2;
export const NUM_REPEAT_MODES = 3;
export const REPEAT_LABELS = ["Off", "All", "One"];

export default class Sequencer extends EventEmitter {
  constructor(players, history) {
    super();
    autoBindReact(this);

    this.player = null;
    this.players = players;
    // this.onSequencerStateUpdate = onSequencerStateUpdate;
    // this.onPlayerError = onError;

    this.currIdx = 0;
    this.context = null;
    this.currUrl = null;
    this.songRequest = null;
    this.repeat = REPEAT_OFF;
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

  playContext(context, index = 0, subtune = 0) {
    this.currIdx = index;
    this.context = context;
    this.playCurrentSong(subtune);
  }

  playCurrentSong(subtune = 0) {
    let idx = this.currIdx;
    this.playSong(this.context[idx], subtune);
  }

  playSonglist(urls) {
    this.playContext(urls, 0);
  }

  setRepeat(repeat) {
    this.repeat = repeat;
  }

  advanceSong() {
    if (this.context == null) return;

    this.playCurrentSong();
  }

  playSubtune(subtune) {
    const currentPathname = window.location.pathname.replace(
      "/chiptheory/",
      "/",
    );
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("subtune", subtune + 1);

    this.history.push({
      pathname: currentPathname,
      search: searchParams.toString(),
    });

    this.player.playSubtune(subtune);
  }

  prevSubtune() {
    const subtune = this.player.getSubtune() - 1;
    if (subtune < 0) return;
    this.playSubtune(subtune);
  }

  nextSubtune() {
    const subtune = this.player.getSubtune() + 1;
    if (subtune >= this.player.getNumSubtunes()) return;
    this.playSubtune(subtune);
  }

  getPlayer() {
    return this.player;
  }

  getCurrContext() {
    return this.context;
  }

  getCurrIdx() {
    return this.currIdx;
  }

  getCurrUrl() {
    return this.currUrl;
  }

  playSong(url, subtune = 0) {
    if (this.player !== null) {
      this.player.suspend();
    }

    // Normalize url - paths are assumed to live under CATALOG_PREFIX
    url = url.startsWith("http")
      ? url
      : CATALOG_PREFIX + encodeURIComponent(encodeURIComponent(url));
    // Find a player that can play this filetype
    const ext = url.split(".").pop().toLowerCase();
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
        const hash = md5(new Uint8Array(buffer));
        console.log("MD5:", hash);
        this.hash = hash;
        // This hash should be present in Lakh dataset mapping:
        // https://colinraffel.com/projects/lmd/
        this.currUrl = url;
        const filepath = url.replace(CATALOG_PREFIX, "");
        this.playSongBuffer(filepath, buffer, subtune);
      })
      .catch((e) => {
        this.handlePlayerError(
          e.message || `HTTP ${e.status} ${e.statusText} ${url}`,
        );
      });
  }

  async playSongFile(filepath, songData, subtune = 0) {
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
    return this.playSongBuffer(filepath, songData, subtune);
  }

  async playSongBuffer(filepath, buffer, subtune = 0) {
    let uint8Array;
    uint8Array = new Uint8Array(buffer);
    this.player.setTempo(1);
    let result;
    try {
      result = await this.player.loadData(uint8Array, filepath, subtune);
    } catch (e) {
      this.handlePlayerError(`Unable to play ${filepath} (${e.message}).`);
    }
    const numVoices = this.player.getNumVoices();
    this.player.setVoiceMask([...Array(numVoices)].fill(true));
    return result;
  }
}
