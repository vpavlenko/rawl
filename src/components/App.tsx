import autoBindReact from "auto-bind/react";
import { initializeApp as firebaseInitializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  Firestore,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore/lite";
import clamp from "lodash/clamp";
import md5 from "md5";
import path from "path";
import queryString from "querystring";
import React from "react";
import Dropzone from "react-dropzone";
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from "react-router-dom";

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
import LandingPage from "./rawl/LandingPage";
import Pirate from "./rawl/Pirate";
import Rawl from "./rawl/Rawl";
import TagSearch from "./rawl/TagSearch";
import { Analyses } from "./rawl/analysis";
import Corpus from "./rawl/corpora/Corpus";
import Course from "./rawl/course/Course";
import { DropSaveForm, processMidiUrls } from "./rawl/midiStorage";
import DAW from "./rawl/pages/DAW";
import { ParsingResult } from "./rawl/parseMidi";
import transformMidi from "./rawl/transformMidi";
import STATIC_MIDI_FILES from "./staticMidiFilles";

export const DUMMY_CALLBACK = () => {};

export type VoiceMask = boolean[];

type AppState = {
  loading: boolean;
  loadingUser: boolean;
  paused: boolean;
  ejected: boolean;
  playerError: null;
  currentSongNumVoices: number;
  currentSongDurationMs: number;
  currentSongPositionMs: number;
  tempo: number;
  voiceMask: VoiceMask;
  voiceNames: string[];
  showPlayerError: boolean;
  user: User;
  songUrl: string;
  volume: number;
  directories: any;
  paramDefs: any;
  parsing: ParsingResult;
  analysisEnabled: boolean;
  analyses: Analyses;
  latencyCorrectionMs: number;
  fileToDownload: Uint8Array;
};

interface FirestoreMidiIndex {
  midis: { id: string; slug: string; title: string }[];
}

// is it defined in a Firestore SDK? it's probably Bytes, and
// we should probably avoid using private fields of it
type FirestoreBlob = {
  _byteString?: {
    binaryString: string;
  };
};

interface FirestoreMidiDocument {
  blob: FirestoreBlob;
  slug: string;
  title: string;
  url: string | null;
}

class App extends React.Component<RouteComponentProps, AppState> {
  private contentAreaRef: React.RefObject<HTMLDivElement>;
  private errorTimer: number;
  private midiPlayer: MIDIPlayer;
  private currUrl: string;
  private songRequest: (method: string, url: string) => Promise<any>;
  private db: Firestore;
  private audioCtx: AudioContext;
  private mediaSessionAudio: HTMLAudioElement;
  private gainNode: GainNode;
  private playerNode: ScriptProcessorNode;
  private chipCore: any;
  private path: string;
  private hash: string;
  private browsePath: string;
  private midi: ArrayBuffer;

  constructor(props) {
    super(props);
    autoBindReact(this);

    this.attachMediaKeyHandlers();
    this.contentAreaRef = React.createRef();
    this.errorTimer = null;
    this.midiPlayer = null; // Need a reference to MIDIPlayer to handle SoundFont loading.
    // window.ChipPlayer = this;
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
          analyses: { ...defaultAnalyses, ...userSnapshot.data().analyses },
        });
        // }
        // else: analyses of some other user have already been loaded, leave them intact
      }
    });

    onAuthStateChanged(auth, (user) => {
      this.setState({
        user,
        loadingUser: !!user,
      });
      if (user) {
        const docRef = doc(this.db, "users", user.uid);
        getDoc(docRef)
          .then((userSnapshot) => {
            if (!userSnapshot.exists()) {
              // Create user
              console.debug("Creating user document", user.uid);
              setDoc(docRef, {
                user: {
                  email: user.email,
                },
              });
            } else {
              // Restore user
              const data = userSnapshot.data();
              this.setState({
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
      // @ts-ignore
      window.audioCtx =
        // @ts-ignore
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
        : 0;

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
      songUrl: null,
      volume: 100,
      directories: {},
      paramDefs: [],
      parsing: null,
      analysisEnabled: false,
      analyses: defaultAnalyses as Analyses,
      latencyCorrectionMs,
      fileToDownload: null,
    };

    this.initChipCore(audioCtx, playerNode, bufferSize);

    processMidiUrls(this.props.location, this.handleSongClick);
  }

  async initChipCore(audioCtx, playerNode, bufferSize) {
    // Load the chip-core Emscripten runtime
    try {
      // @ts-ignore
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
      });
    });
  }

  async saveAnalysis(analysis) {
    const user = this.state.user;
    if (user) {
      const userRef = doc(this.db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      let userData = userDoc.exists ? userDoc.data() : {};
      userData.analyses = {
        ...(userData.analyses ?? {}),
        [this.path]: analysis,
      };

      await setDoc(userRef, userData).catch((e) => {
        console.log("Couldn't save analysis.", e);
        alert("Could not save analysis");
      });

      this.setState({
        analyses: userData.analyses,
      });
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
          if (e.target instanceof HTMLElement) {
            e.target.blur();
          }
          break;
        default:
      }

      if (
        e.target instanceof HTMLInputElement &&
        e.target.tagName === "INPUT" &&
        e.target.type === "text"
      )
        return; // text input has focus

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

      if (
        e.target instanceof HTMLInputElement &&
        e.target.tagName === "INPUT" &&
        e.target.type === "range"
      )
        return; // a range slider has focus

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
    // see https://chatgpt.com/share/14effd20-b14e-4fb1-b644-6b76a6151c1d
    // @ts-ignore
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

  seekRelative(ms: number) {
    const durationMs = this.state.currentSongDurationMs;
    const seekMs = clamp(this.midiPlayer?.getPositionMs() + ms, 0, durationMs);

    this.seekRelativeInner(seekMs);
  }

  seekRelativeInner(seekMs: number) {
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

  seekForRawl = (seekMs: number) => this.seekRelativeInner(seekMs);

  handleSetVoiceMask(voiceMask: VoiceMask) {
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

  handleSongClick(url: string) {
    const tryPlay = () => {
      try {
        this.playSong(url);
      } catch {
        setTimeout(tryPlay, 200);
      }
    };

    tryPlay();
  }

  handleVolumeChange(volume: number) {
    this.setState({ volume });
    this.gainNode.gain.value = Math.max(0, Math.min(2, volume * 0.01));
  }

  processFetchedDirectory(path, items) {
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
      const firestoreMidiDirectory = (
        index.data() as FirestoreMidiIndex
      ).midis.map(({ title, id, slug }, order) => ({
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
      const result = reader.result as ArrayBuffer;
      if (ext === ".sf2" && this.midiPlayer) {
        const sf2Path = `user/${file.name}`;
        const forceWrite = true;
        const isTransient = false;
        await ensureEmscFileWithData(
          this.chipCore,
          `${SOUNDFONT_MOUNTPOINT}/${sf2Path}`,
          new Uint8Array(result),
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
        this.currUrl = null;
        this.midi = result;
        this.playSongBuffer(file.name, result);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  setLatencyCorrectionMs = (latencyCorrectionMs: number) => {
    this.setState({ latencyCorrectionMs });
    localStorage.setItem("latencyCorrectionMs", latencyCorrectionMs.toString());
  };

  handlePlayerStateUpdate(playerState) {
    const { isStopped } = playerState;
    console.debug("Sequencer.handlePlayerStateUpdate(isStopped=%s)", isStopped);

    if (isStopped) {
      this.currUrl = null;
    } else {
      this.handleSequencerStateUpdate({
        url: this.currUrl,
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
        const { blob, url: webUrl } = (
          await getDoc(doc(firestore, "midis", url.slice(2)))
        ).data() as FirestoreMidiDocument;
        // @ts-ignore
        window.webUrl = webUrl;

        const transformedMidi = transformMidi(
          Uint8Array.from(blob._byteString.binaryString, (e) =>
            e.charCodeAt(0),
          ),
        );

        this.playSongBuffer(url, transformedMidi);
      };
      playFromFirestore();
    } else {
      // Fetch the song file (cancelable request)
      // Cancel any outstanding request so that playback doesn't happen out of order
      if (this.songRequest) {
        // @ts-ignore
        this.songRequest.abort();
      }
      // TODO: rewrite on fetch()
      this.songRequest = promisify(new XMLHttpRequest());
      // @ts-ignore
      this.songRequest.responseType = "arraybuffer";
      // @ts-ignore
      this.songRequest.open("GET", url);
      this.songRequest
        // @ts-ignore
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

  async playSongBuffer(filepath: string, buffer: ArrayBuffer | Uint8Array) {
    this.midiPlayer.suspend();
    const uint8Array = new Uint8Array(buffer);
    this.hash = md5(uint8Array);
    console.log("MD5", this.hash);
    this.midiPlayer.setTempo(1);
    this.setState({
      fileToDownload: uint8Array,
    });
    try {
      await this.midiPlayer.loadData(uint8Array, filepath);
    } catch (e) {
      this.handlePlayerError(`Unable to play ${filepath} (${e.message}).`);
    }
    const numVoices = this.midiPlayer.getNumVoices();
    this.midiPlayer.setVoiceMask([...Array(numVoices)].fill(true));
  }

  render() {
    const { location } = this.props;
    const rawlState = {
      voiceNames: this.state.voiceNames,
      voiceMask: this.state.voiceMask,
      setVoiceMask: this.handleSetVoiceMask,
      latencyCorrectionMs: this.state.latencyCorrectionMs,
    };
    // const { hash } = this;
    // const localAnalysis = hash && localStorage.getItem(hash);
    // const parsedLocalAnalysis = localAnalysis && JSON.parse(localAnalysis);
    const browseRoute = (
      <Route
        path={["/browse/:browsePath*"]}
        render={({ match }) => {
          const browsePath = match.params?.browsePath?.replace("%25", "%");
          this.browsePath = browsePath;
          return (
            <Browse
              browsePath={browsePath}
              listing={this.state.directories[browsePath]}
              fetchDirectory={this.fetchDirectory}
              analyses={this.state.analyses}
            />
          );
        }}
      />
    );
    const rawlRoute = (
      <Route
        path={["/f/:slug*", "/c/:chiptuneUrl*", "/drop"]}
        render={({ match }) => {
          const { slug, chiptuneUrl } = match.params as {
            slug?: string;
            chiptuneUrl?: string;
          };
          const { parsing } = this.state;
          this.path = match.url.slice(1);
          return (
            <>
              {parsing && (
                <>
                  <Rawl
                    parsingResult={parsing}
                    getCurrentPositionMs={this.midiPlayer?.getPositionMs}
                    savedAnalysis={this.state.analyses[this.path] ?? null}
                    saveAnalysis={this.saveAnalysis}
                    showAnalysisBox={this.state.analysisEnabled}
                    seek={this.seekForRawl}
                    artist={""}
                    song={slug ?? chiptuneUrl}
                    {...rawlState}
                  />
                  {match.path === "/drop" && <DropSaveForm midi={this.midi} />}
                </>
              )}
            </>
          );
        }}
      />
    );

    return (
      <Dropzone disableClick style={{}} onDrop={this.onDrop}>
        {/* @ts-ignore */}
        {(dropzoneProps) => (
          <div className="App">
            <DropMessage dropzoneProps={dropzoneProps} />
            <Alert
              handlePlayerError={this.handlePlayerError}
              playerError={this.state.playerError}
              showPlayerError={this.state.showPlayerError}
            />
            {location.pathname !== "/" && <AppHeader />}
            <div className="App-main">
              <div className="App-main-inner">
                <div className="App-main-content-and-settings">
                  <div
                    className="App-main-content-area"
                    ref={this.contentAreaRef}
                  >
                    <Switch>
                      <Route path="/" exact render={() => <LandingPage />} />
                      {/* <Route path="/axes" render={() => <Axes />} /> */}
                      <Route
                        path="/course/:chapter*"
                        render={({ match }) => (
                          <Course
                            chapter={parseInt(match.params?.chapter, 10)}
                            analyses={this.state.analyses}
                          />
                        )}
                      />
                      <Route
                        path="/corpus/:corpus*"
                        render={({ match }) => (
                          <Corpus slug={match.params?.corpus} />
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
                      <Route path="/pirate" render={() => <Pirate />} />
                      {browseRoute}
                      {rawlRoute}
                    </Switch>
                  </div>
                </div>
              </div>
              {location.pathname !== "/" && !this.state.loading && (
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
                ejected={this.state.ejected}
                paused={this.state.paused}
                fileToDownload={this.state.fileToDownload}
                volume={this.state.volume}
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
