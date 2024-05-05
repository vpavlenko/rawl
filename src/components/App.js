import autoBindReact from "auto-bind/react";
import { initializeApp as firebaseInitializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore/lite";
import isMobile from "ismobilejs";
import clamp from "lodash/clamp";
import md5 from "md5";
import path from "path";
import queryString from "querystring";
import React from "react";
import Dropzone from "react-dropzone";
import { Route, Switch, withRouter } from "react-router-dom";

import ChipCore from "../chip-core";
import {
  API_BASE,
  CATALOG_PREFIX,
  ERROR_FLASH_DURATION_MS,
  MAX_VOICES,
  SOUNDFONT_MOUNTPOINT,
} from "../config";
import firebaseConfig from "../config/firebaseConfig";
import defaultAnalyses from "../corpus/analyses.json";
import MIDIPlayer from "../players/MIDIPlayer";
import promisify from "../promisify-xhr";
import { ensureEmscFileWithData, unlockAudioContext } from "../util";
import Alert from "./Alert";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";
import Browse from "./Browse";
import DropMessage from "./DropMessage";
import Visualizer from "./Visualizer";
import { processMidiUrlsInApp } from "./midiUrls";
import Axes from "./rawl/Axes";
import LandingPage from "./rawl/LandingPage";
import Rawl from "./rawl/Rawl";
import TagSearch from "./rawl/TagSearch";
import Course from "./rawl/course/Course";
import DAW from "./rawl/pages/DAW";
import STATIC_MIDI_FILES from "./staticMidiFilles";

export const DUMMY_CALLBACK = () => {};

const mergeAnalyses = (base, diff) => {
  const result = { ...base };

  for (const game in diff) {
    if (!result[game]) {
      result[game] = {};
    }

    for (const file in diff[game]) {
      if (!result[game][file]) {
        result[game][file] = {};
      }

      for (const subtune in diff[game][file]) {
        result[game][file][subtune] = diff[game][file][subtune];
      }
    }
  }

  return result;
};

class App extends React.Component {
  constructor(props) {
    super(props);
    autoBindReact(this);

    this.attachMediaKeyHandlers();
    this.contentAreaRef = React.createRef();
    this.playContexts = {};
    this.errorTimer = null;
    this.midiPlayer = null; // Need a reference to MIDIPlayer to handle SoundFont loading.
    window.ChipPlayer = this;
    this.currUrl = null;
    this.songRequest = null;

    // Initialize Firebase
    const firebaseApp = firebaseInitializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    this.db = getFirestore(firebaseApp);

    // Load the analyses by Vitaly Pavlenko
    const docRef = doc(this.db, "users", "RK31rsh4tDdUGlNYQvakXW4AYbB3");
    getDoc(docRef).then((userSnapshot) => {
      if (userSnapshot.exists() && userSnapshot.data().analyses) {
        // if (this.state.analyses == defaultAnalyses) {
        this.setState({
          analyses: mergeAnalyses(
            defaultAnalyses,
            userSnapshot.data().analyses,
          ),
        });
        // }
        // else: analyses of some other user have already been loaded, leave them intact
      }
    });

    onAuthStateChanged(auth, (user) => {
      this.setState({
        user,
        loadingUser: !!user,
        // analysisEnabled: !!user,
      });
      if (user) {
        const docRef = doc(this.db, "users", user.uid);
        getDoc(docRef)
          .then((userSnapshot) => {
            if (!userSnapshot.exists()) {
              // Create user
              console.debug("Creating user document", user.uid);
              setDoc(docRef, {
                faves: [],
                user: {
                  email: user.email,
                },
              });
            } else {
              // Restore user
              const data = userSnapshot.data();
              this.setState({
                faves: data.faves || [],
                // analyses: data.analyses,
              });
            }
          })
          .finally(() => {
            this.setState({ loadingUser: false });
          });
      }
    });

    // Initialize audio graph
    // ┌────────────┐      ┌────────────┐      ┌─────────────┐
    // │ playerNode ├─────>│  gainNode  ├─────>│ destination │
    // └────────────┘      └────────────┘      └─────────────┘
    const audioCtx =
      (this.audioCtx =
      window.audioCtx =
        new (window.AudioContext || window.webkitAudioContext)({
          latencyHint: "playback",
        }));
    const bufferSize = Math.max(
      // Make sure script node bufferSize is at least baseLatency
      Math.pow(
        2,
        Math.ceil(
          Math.log2((audioCtx.baseLatency || 0.001) * audioCtx.sampleRate),
        ),
      ),
      16384, // can set to 16384, but the cursor will lag. smooth is 2048
    );
    const gainNode = (this.gainNode = audioCtx.createGain());
    gainNode.gain.value = 1;
    gainNode.connect(audioCtx.destination);
    const playerNode = (this.playerNode = audioCtx.createScriptProcessor(
      bufferSize,
      0,
      2,
    ));
    playerNode.connect(gainNode);

    unlockAudioContext(audioCtx);
    console.log(
      "Sample rate: %d hz. Base latency: %d. Buffer size: %d.",
      audioCtx.sampleRate,
      audioCtx.baseLatency * audioCtx.sampleRate,
      bufferSize,
    );

    let latencyCorrectionMs = parseInt(
      localStorage.getItem("latencyCorrectionMs"),
      10,
    );
    latencyCorrectionMs =
      !isNaN(latencyCorrectionMs) && latencyCorrectionMs !== null
        ? latencyCorrectionMs
        : 400;

    this.state = {
      loading: true,
      loadingUser: true,
      paused: true,
      ejected: true,
      playerError: null,
      currentSongNumVoices: 0,
      currentSongDurationMs: 1,
      currentSongPositionMs: 0,
      tempo: 1,
      voiceMask: Array(MAX_VOICES).fill(true),
      voiceNames: Array(MAX_VOICES).fill(""),
      showPlayerError: false,
      user: null,
      faves: [],
      songUrl: null,
      volume: 100,
      directories: {},
      hasPlayer: false,
      paramDefs: [],
      parsing: null,
      analysisEnabled: false,
      analyses: defaultAnalyses,
      latencyCorrectionMs,
    };

    this.initChipCore(audioCtx, playerNode, bufferSize);

    processMidiUrlsInApp(this.props.location, this.handleSongClick);
  }

  async initChipCore(audioCtx, playerNode, bufferSize) {
    // Load the chip-core Emscripten runtime
    try {
      this.chipCore = await new ChipCore({
        // Look for .wasm file in web root, not the same location as the app bundle (static/js).
        locateFile: (path, prefix) => {
          if (path.endsWith(".wasm") || path.endsWith(".wast"))
            return `${process.env.PUBLIC_URL}/${path}`;
          return prefix + path;
        },
        print: (msg) => console.debug("[stdout] " + msg),
        printErr: (msg) => console.debug("[stderr] " + msg),
      });
    } catch (e) {
      // Browser doesn't support WASM (Safari in iOS Simulator)
      Object.assign(this.state, {
        playerError: "Error loading player engine. Old browser?",
        loading: false,
      });
      return;
    }

    // Get debug from location.search
    const debug = queryString.parse(window.location.search.substring(1)).debug;
    // Create all the players. Players will set up IDBFS mount points.
    const self = this;
    this.midiPlayer = new MIDIPlayer(
      this.chipCore,
      audioCtx.sampleRate,
      bufferSize,
      debug,
      (parsing) =>
        self.setState({
          parsing,
        }),
      this.togglePause,
    );
    this.midiPlayer.on("playerStateUpdate", this.handlePlayerStateUpdate);
    this.midiPlayer.on("playerError", this.handlePlayerError);

    // Set up the central audio processing callback. This is where the magic happens.
    playerNode.onaudioprocess = (e) => {
      const channels = [];
      for (let i = 0; i < e.outputBuffer.numberOfChannels; i++) {
        channels.push(e.outputBuffer.getChannelData(i));
      }
      if (!this.midiPlayer?.stopped) {
        this.midiPlayer?.processAudio(channels);
      }
    };

    // Populate all mounted IDBFS file systems from IndexedDB.
    this.chipCore.FS.syncfs(true, (err) => {
      if (err) {
        console.log("Error populating FS from indexeddb.", err);
      }
      this.midiPlayer?.handleFileSystemReady();
    });

    // TODO: Move to separate processUrlParams method.
    const urlParams = queryString.parse(window.location.search.substring(1));
    if (urlParams.play) {
      const play = urlParams.play;
      const dirname = path.dirname(urlParams.play);
      // Treat play param as a "transient command" and strip it away after starting playback.
      // See comment in Browse.js for more about why a sticky play param is not a good idea.
      delete urlParams.play;
      const qs = queryString.stringify(urlParams);
      const search = qs ? `?${qs}` : "";
      // Navigate to song's containing folder. History comes from withRouter().
      this.fetchDirectory(dirname).then(() => {
        this.props.history.replace(`/browse/${dirname}${search}`);
        const index = this.playContexts[dirname].indexOf(play);
        this.playSong(this.playContexts[dirname][index]);

        if (urlParams.t) {
          setTimeout(() => {
            this.midiPlayer?.seekMs(parseInt(urlParams.t, 10));
          }, 100);
        }
      });
    }

    this.setState({ loading: false });
  }

  static mapSequencerStateToAppState(sequencerState) {
    const map = {
      ejected: "isEjected",
      paused: "isPaused",
      currentSongNumVoices: "numVoices",
      currentSongPositionMs: "positionMs",
      currentSongDurationMs: "durationMs",
      tempo: "tempo",
      voiceNames: "voiceNames",
      voiceMask: "voiceMask",
      songUrl: "url",
      hasPlayer: "hasPlayer",
      // TODO: add param values? move to paramStateUpdate?
      paramDefs: "paramDefs",
    };
    const appState = {};
    for (let prop in map) {
      const seqProp = map[prop];
      if (seqProp in sequencerState) {
        appState[prop] = sequencerState[seqProp];
      }
    }
    return appState;
  }

  handleLogin() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Firebase auth result:", result);
      })
      .catch((error) => {
        console.log("Firebase auth error:", error);
      });
  }

  handleLogout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      this.setState({
        user: null,
        faves: [],
      });
    });
  }

  async saveAnalysis(analysis) {
    const user = this.state.user;
    if (user) {
      const currIdx = -42;
      console.log("SAVE ANALYSIS IS BROKEN");
      if (currIdx === undefined) return;

      const path =
        this.playContexts[this.browsePath] &&
        this.playContexts[this.browsePath][currIdx];
      if (!path) return;

      const lastSlashIndex = path.lastIndexOf("/");
      const beforeSlash = path.substring(0, lastSlashIndex);
      const song = path.substring(lastSlashIndex + 1);

      const userRef = doc(this.db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      let userData = userDoc.exists ? userDoc.data() : {};

      const diff = {
        [beforeSlash]: { [song]: { 0: analysis } },
      };
      userData.analyses = mergeAnalyses(userData.analyses ?? {}, diff);

      await setDoc(userRef, userData).catch((e) => {
        console.log("Couldn't save analysis.", e);
        alert("Could not save analysis");
      });

      this.setState((prevState) => ({
        analyses: mergeAnalyses(prevState.analyses, diff),
      }));
    } else {
      if (this.hash) {
        localStorage.setItem(this.hash, JSON.stringify(analysis));
      }
    }
  }

  attachMediaKeyHandlers() {
    if ("mediaSession" in navigator) {
      console.log("Attaching Media Key event handlers.");

      // Limitations of MediaSession: there must always be an active audio element.
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=944538
      //     https://github.com/GoogleChrome/samples/issues/637
      this.mediaSessionAudio = document.createElement("audio");
      this.mediaSessionAudio.src =
        process.env.PUBLIC_URL + "/5-seconds-of-silence.mp3";
      this.mediaSessionAudio.loop = true;
      this.mediaSessionAudio.volume = 0;

      navigator.mediaSession.setActionHandler("play", () => this.togglePause());
      navigator.mediaSession.setActionHandler("pause", () =>
        this.togglePause(),
      );
      navigator.mediaSession.setActionHandler("seekbackward", () =>
        this.seekRelative(-5000),
      );
      navigator.mediaSession.setActionHandler("seekforward", () =>
        this.seekRelative(5000),
      );
    }

    document.addEventListener("keydown", (e) => {
      // Keyboard shortcuts: tricky to get it just right and keep the browser behavior intact.
      // The order of switch-cases matters. More privileged keys appear at the top.
      // More restricted keys appear at the bottom, after various input focus states are filtered out.
      if (e.ctrlKey || e.metaKey) return; // avoid browser keyboard shortcuts

      switch (e.key) {
        case "Escape":
          e.target.blur();
          break;
        default:
      }

      if (e.target.tagName === "INPUT" && e.target.type === "text") return; // text input has focus

      switch (e.key) {
        case " ":
          this.togglePause();
          e.preventDefault();
          break;
        case "-":
          this.setSpeedRelative(-0.1);
          break;
        case "_":
          this.setSpeedRelative(-0.01);
          break;
        case "=":
          this.setSpeedRelative(0.1);
          break;
        case "+":
          this.setSpeedRelative(0.01);
          break;
        default:
      }

      if (e.target.tagName === "INPUT" && e.target.type === "range") return; // a range slider has focus

      switch (e.key) {
        case "ArrowLeft":
          this.seekRelative(-5000);
          e.preventDefault();
          break;
        case "ArrowRight":
          this.seekRelative(5000);
          e.preventDefault();
          break;
        default:
      }
    });
  }

  handleSequencerStateUpdate(sequencerState) {
    const { isEjected } = sequencerState;
    console.log("App.handleSequencerStateUpdate(isEjected=%s)", isEjected);

    if (isEjected) {
      this.setState({
        ejected: true,
        currentSongNumVoices: 0,
        currentSongPositionMs: 0,
        currentSongDurationMs: 1,
        songUrl: null,
      });
      // TODO: Disabled to support scroll restoration.
      // updateQueryString({ play: undefined });

      if ("mediaSession" in navigator) {
        this.mediaSessionAudio.pause();

        navigator.mediaSession.playbackState = "none";
      }
    } else {
      if ("mediaSession" in navigator) {
        this.mediaSessionAudio.play();
      }

      this.setState({
        ...App.mapSequencerStateToAppState(sequencerState),
      });
    }
  }

  handlePlayerError(message) {
    this.handleSequencerStateUpdate({ isEjected: true });
    if (message) this.setState({ playerError: message });
    this.setState({ showPlayerError: !!message });
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(
      () => this.setState({ showPlayerError: false }),
      ERROR_FLASH_DURATION_MS,
    );
  }

  togglePause() {
    if (this.state.ejected) return;

    const paused = this.midiPlayer?.togglePause();
    if ("mediaSession" in navigator) {
      if (paused) {
        this.mediaSessionAudio.pause();
      } else {
        this.mediaSessionAudio.play();
      }
    }
    this.setState({ paused: paused });
  }

  // I save it here as a memory on how to save anything on a user's account.
  //
  // const user = this.state.user;
  // if (user) {
  //   const userRef = doc(this.db, "users", user.uid);
  //   updateDoc(userRef, {
  //     settings: { showPlayerSettings: showPlayerSettings },
  //   }).catch((e) => {
  //     console.log("Couldn't update settings in Firebase.", e);
  //   });
  // }

  handleTimeSliderChange(event) {
    const pos = event.target ? event.target.value : event;
    const seekMs = Math.floor(pos * this.state.currentSongDurationMs);

    this.seekRelativeInner(seekMs);
  }

  seekRelative(ms) {
    const durationMs = this.state.currentSongDurationMs;
    const seekMs = clamp(this.midiPlayer?.getPositionMs() + ms, 0, durationMs);

    this.seekRelativeInner(seekMs);
  }

  seekRelativeInner(seekMs, firedByChiptheory = false) {
    if (!firedByChiptheory && this.state.seekCallback) {
      this.state.seekCallback(seekMs);
    }
    this.midiPlayer?.seekMs(seekMs);
    this.setState({
      currentSongPositionMs: seekMs, // Smooth
    });
    setTimeout(() => {
      if (this.midiPlayer?.isPlaying()) {
        this.setState({
          currentSongPositionMs: this.midiPlayer?.getPositionMs(), // Accurate
        });
      }
    }, 100);
  }

  seekForRawl = (seekMs) => this.seekRelativeInner(seekMs, true);

  handleSetVoiceMask(voiceMask) {
    this.midiPlayer?.setVoiceMask(voiceMask);
    this.setState({ voiceMask: [...voiceMask] });
  }

  handleTempoChange(event) {
    const tempo = parseFloat(event.target ? event.target.value : event) || 1.0;
    this.midiPlayer?.setTempo(tempo);
    this.setState({
      tempo: tempo,
    });
  }

  setSpeedRelative(delta) {
    const tempo = clamp(this.state.tempo + delta, 0.1, 2);
    this.midiPlayer?.setTempo(tempo);
    this.setState({
      tempo: tempo,
    });
  }

  handleSongClick(url, context, index) {
    const tryPlay = () => {
      try {
        this.playSong(context ? context[index] : url);
      } catch {
        setTimeout(tryPlay, 200);
      }
    };

    tryPlay();
  }

  handleVolumeChange(volume) {
    this.setState({ volume });
    this.gainNode.gain.value = Math.max(0, Math.min(2, volume * 0.01));
  }

  processFetchedDirectory(path, items) {
    this.playContexts[path] = items
      .filter((item) => item.type === "file")
      .map((item) =>
        item.path.replace("%", "%25").replace("#", "%23").replace(/^\//, ""),
      );
    const directories = {
      ...this.state.directories,
      [path]: items,
    };
    this.setState({ directories });
  }

  async fetchDirectory(path) {
    if (path.startsWith("static")) {
      return this.processFetchedDirectory(path, STATIC_MIDI_FILES);
    } else if (path.startsWith("f")) {
      const index = await getDoc(doc(this.db, "indexes", "midis"));
      const firestoreMidiDirectory = index
        .data()
        .midis.map(({ title, id, slug }, order) => ({
          idx: order,
          path: `/static/f/${title}`,
          id,
          slug,
          size: 1337,
          type: "file",
        }));
      return this.processFetchedDirectory(path, firestoreMidiDirectory);
    } else if (!path.startsWith("link")) {
      return fetch(`${API_BASE}/browse?path=%2F${encodeURIComponent(path)}`)
        .then((response) => response.json())
        .then((items) => {
          return this.processFetchedDirectory(path, items);
        });
    }
  }

  onDrop = (droppedFiles) => {
    const reader = new FileReader();
    const file = droppedFiles[0];
    const ext = path.extname(file.name).toLowerCase();
    if (ext === ".sf2" && !this.midiPlayer) {
      this.handlePlayerError(
        "MIDIPlayer has not been created - unable to load SoundFont.",
      );
      return;
    }
    reader.onload = async () => {
      if (ext === ".sf2" && this.midiPlayer) {
        const sf2Path = `user/${file.name}`;
        const forceWrite = true;
        const isTransient = false;
        await ensureEmscFileWithData(
          this.chipCore,
          `${SOUNDFONT_MOUNTPOINT}/${sf2Path}`,
          new Uint8Array(reader.result),
          forceWrite,
        );
        this.midiPlayer?.updateSoundfontParamDefs();
        this.midiPlayer?.setParameter("soundfont", sf2Path, isTransient);
        // TODO: emit "paramDefsChanged" from player.
        // See https://reactjs.org/docs/integrating-with-other-libraries.html#integrating-with-model-layers
        this.forceUpdate();
      } else {
        this.browsePath = "drop";
        this.props.history.push("/drop");
        const songData = reader.result;
        this.playSongFile(file.name, songData);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  setLatencyCorrectionMs = (latencyCorrectionMs) => {
    this.setState({ latencyCorrectionMs });
    localStorage.setItem("latencyCorrectionMs", latencyCorrectionMs);
  };

  registerSeekCallback = (seekCallback) => this.setState({ seekCallback });

  handlePlayerStateUpdate(playerState) {
    const { isStopped } = playerState;
    console.debug("Sequencer.handlePlayerStateUpdate(isStopped=%s)", isStopped);

    if (isStopped) {
      this.currUrl = null;
    } else {
      this.handleSequencerStateUpdate({
        url: this.currUrl,
        hasPlayer: true,
        // TODO: combine isEjected and hasPlayer
        isEjected: false,
        ...playerState,
      });
    }
  }

  playSong(url) {
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
      this.handlePlayerError(`The file format ".${ext}" was not recognized.`);
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
    this.currUrl = null;
    return this.playSongBuffer(filepath, songData);
  }

  async playSongBuffer(filepath, buffer) {
    this.midiPlayer.suspend();
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

  render() {
    const { location } = this.props;
    const rawlState = {
      voiceNames: this.state.voiceNames,
      voiceMask: this.state.voiceMask,
      setVoiceMask: this.handleSetVoiceMask,
      latencyCorrectionMs: this.state.latencyCorrectionMs,
    };
    const currIdx = -42;
    // const { hash } = this;
    // const localAnalysis = hash && localStorage.getItem(hash);
    // const parsedLocalAnalysis = localAnalysis && JSON.parse(localAnalysis);
    const browseRoute = (
      <Route
        path={["/browse/:browsePath*"]}
        render={({ history, match, location }) => {
          // Undo the react-router-dom double-encoded % workaround - see DirectoryLink.js
          const browsePath = match.params?.browsePath?.replace("%25", "%");
          const searchParams = new URLSearchParams(window.location.search);
          this.browsePath = browsePath;
          const path = this.playContexts[browsePath]?.[currIdx];
          const song = path?.substring(path.lastIndexOf("/") + 1);
          const savedAnalysis =
            this.state.analyses[browsePath]?.[song]?.[0] ?? parsedLocalAnalysis;
          return (
            <>
              <Browse
                browsePath={browsePath}
                listing={this.state.directories[browsePath]}
                playContext={this.playContexts[browsePath]}
                fetchDirectory={this.fetchDirectory}
                handleSongClick={this.handleSongClick}
                analyses={this.state.analyses}
              />
              {(searchParams.get("song") ||
                searchParams.get("link") ||
                browsePath.startsWith("f/")) &&
                this.state.parsings[browsePath] && (
                  <Rawl
                    parsingResult={this.state.parsings[browsePath]}
                    getCurrentPositionMs={this.midiPlayer?.getPositionMs}
                    savedAnalysis={savedAnalysis}
                    saveAnalysis={this.saveAnalysis}
                    showAnalysisBox={this.state.analysisEnabled}
                    seek={this.seekForRawl}
                    registerSeekCallback={this.registerSeekCallback}
                    artist={browsePath}
                    song={song}
                    {...rawlState}
                  />
                )}
            </>
          );
        }}
      />
    );
    const rawlRoute = (
      <Route
        path={["/f/:slug*", "/c/:chiptuneUrl*"]}
        render={({ match }) => {
          const { slug, chiptuneUrl } = match.params;
          const { parsing } = this.state;
          return (
            <>
              {parsing && (
                <Rawl
                  parsingResult={this.state.parsing}
                  getCurrentPositionMs={this.midiPlayer?.getPositionMs}
                  savedAnalysis={null} // TODO
                  saveAnalysis={this.saveAnalysis}
                  showAnalysisBox={this.state.analysisEnabled}
                  seek={this.seekForRawl}
                  registerSeekCallback={this.registerSeekCallback}
                  artist={""}
                  song={slug}
                  {...rawlState}
                />
              )}
            </>
          );
        }}
      />
    );

    return (
      <Dropzone disableClick style={{}} onDrop={this.onDrop}>
        {(dropzoneProps) => (
          <div className="App">
            <DropMessage dropzoneProps={dropzoneProps} />
            <Alert
              handlePlayerError={this.handlePlayerError}
              playerError={this.state.playerError}
              showPlayerError={this.state.showPlayerError}
            />
            {location.pathname !== "/" && (
              <AppHeader isPhone={isMobile.phone} />
            )}
            <div className="App-main">
              <div className="App-main-inner">
                <div className="App-main-content-and-settings">
                  <div
                    className="App-main-content-area"
                    ref={this.contentAreaRef}
                  >
                    <Switch>
                      <Route path="/" exact render={() => <LandingPage />} />
                      <Route path="/axes" render={() => <Axes />} />
                      <Route
                        path="/course/:chapter*"
                        render={({ match }) => (
                          <Course
                            chapter={match.params?.chapter}
                            analyses={this.state.analyses}
                          />
                        )}
                      />
                      <Route
                        path="/tags/:tag*"
                        render={({ match }) => (
                          <TagSearch
                            tag={match.params?.tag}
                            analyses={this.state.analyses}
                          />
                        )}
                      />
                      <Route path="/pages/daw" render={() => <DAW />} />
                      <Route
                        path={["/drop"]}
                        render={() =>
                          this.state.parsings["drop"] && (
                            <Rawl
                              parsingResult={this.state.parsings["drop"]}
                              getCurrentPositionMs={
                                this.midiPlayer?.getPositionMs
                              }
                              savedAnalysis={parsedLocalAnalysis}
                              saveAnalysis={this.saveAnalysis}
                              showAnalysisBox={this.state.analysisEnabled}
                              seek={this.seekForRawl}
                              registerSeekCallback={this.registerSeekCallback}
                              artist={"drop"}
                              song={""}
                              {...rawlState}
                            />
                          )
                        }
                      />
                      {browseRoute}
                      {rawlRoute}
                    </Switch>
                  </div>
                </div>
              </div>
              {location.pathname !== "/" &&
                !isMobile.phone &&
                !this.state.loading && (
                  <Visualizer
                    audioCtx={this.audioCtx}
                    sourceNode={this.playerNode}
                    chipCore={this.chipCore}
                    analysisEnabled={this.state.analysisEnabled}
                    handleToggleAnalysis={() =>
                      this.setState((state) => ({
                        analysisEnabled: !state.analysisEnabled,
                      }))
                    }
                    paused={this.state.ejected || this.state.paused}
                    user={this.state.user}
                    handleLogout={this.handleLogout}
                    handleLogin={this.handleLogin}
                  />
                )}
            </div>
            {location.pathname !== "/" && (
              <AppFooter
                currentSongDurationMs={this.state.currentSongDurationMs}
                currentSongNumVoices={this.state.currentSongNumVoices}
                ejected={this.state.ejected}
                paused={this.state.paused}
                songUrl={this.state.songUrl}
                tempo={this.state.tempo}
                voiceNames={this.state.voiceNames}
                voiceMask={this.state.voiceMask}
                volume={this.state.volume}
                handleSetVoiceMask={this.handleSetVoiceMask}
                handleTempoChange={this.handleTempoChange}
                handleTimeSliderChange={this.handleTimeSliderChange}
                handleVolumeChange={this.handleVolumeChange}
                togglePause={this.togglePause}
                latencyCorrectionMs={this.state.latencyCorrectionMs}
                setLatencyCorrectionMs={this.setLatencyCorrectionMs}
                getCurrentPositionMs={this.midiPlayer?.getPositionMs}
              />
            )}
          </div>
        )}
      </Dropzone>
    );
  }
}

export default withRouter(App);
