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
import { Bytes } from "firebase/firestore";
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
import Modal from "react-modal";
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from "react-router-dom";
import { slugify } from "transliteration";

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
import { AppContext, RawlProps } from "./AppContext";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";
import Browse from "./Browse";
import DropMessage from "./DropMessage";
import Visualizer from "./Visualizer";
import LandingPage from "./rawl/LandingPage";
import OldLandingPage from "./rawl/OldLandingPage";
import Pirate from "./rawl/Pirate";
import Rawl from "./rawl/Rawl";
import { ShortcutHelp } from "./rawl/ShortcutHelp";
import Slicer from "./rawl/Slicer";
import { Analyses } from "./rawl/analysis";
import Corpus from "./rawl/corpora/Corpus";
import NewPathView from "./rawl/corpora/NewPathView";
import PathView from "./rawl/corpora/PathView";
import { DropSaveForm, processMidiUrls } from "./rawl/midiStorage";
import DAW from "./rawl/pages/DAW";
import { ParsingResult } from "./rawl/parseMidi";
import transformMidi from "./rawl/transformMidi";

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
  showShortcutHelp: boolean;
  rawlProps: RawlProps | null;
  currentMidi: {
    id: string;
    title: string;
    slug: string;
    sourceUrl: string | null;
  } | null;
};

export interface FirestoreMidiIndex {
  midis: { id: string; slug: string; title: string }[];
}

export interface FirestoreMidiDocument {
  blob: Bytes;
  slug: string;
  title: string;
  url: string | null; // This is named 'url' in Firestore but we use it as 'sourceUrl' internally
}

type KeyboardHandler = (e: KeyboardEvent) => void;

Modal.setAppElement("#root");

function mergeAnalyses(existingAnalyses, newAnalyses) {
  return {
    ...existingAnalyses,
    ...newAnalyses,
  };
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
  private droppedFilename: string;
  private keyboardHandlers: Map<string, KeyboardHandler> = new Map();

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

    // Load the admin analyses
    const adminDocRef = doc(this.db, "users", "RK31rsh4tDdUGlNYQvakXW4AYbB3");
    getDoc(adminDocRef).then((adminSnapshot) => {
      if (adminSnapshot.exists() && adminSnapshot.data().analyses) {
        this.setState({
          analyses: { ...defaultAnalyses, ...adminSnapshot.data().analyses },
        });
      }
    });

    onAuthStateChanged(auth, (user) => {
      this.setState({
        user,
        loadingUser: !!user,
      });
      if (user) {
        this.loadUserAnalyses(user.uid);
      } else {
        this.setState({ loadingUser: false });
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
      analyses: defaultAnalyses as unknown as Analyses,
      latencyCorrectionMs,
      fileToDownload: null,
      showShortcutHelp: false,
      rawlProps: null,
      currentMidi: null,
    };

    this.initChipCore(audioCtx, playerNode, bufferSize);

    processMidiUrls(this.props.location, this.handleSongClick);
  }

  loadUserAnalyses(userId: string) {
    const userDocRef = doc(this.db, "users", userId);
    getDoc(userDocRef)
      .then((userSnapshot) => {
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.analyses) {
            this.setState((prevState) => ({
              analyses: mergeAnalyses(prevState.analyses, userData.analyses),
            }));
          }
        } else {
          // Create user document if it doesn't exist
          console.debug("Creating user document", userId);
          setDoc(userDocRef, {
            user: {
              email: this.state.user.email,
            },
          });
        }
      })
      .finally(() => {
        this.setState({ loadingUser: false });
      });
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

      let userData = userDoc.exists() ? userDoc.data() : {};
      userData.analyses = mergeAnalyses(userData.analyses ?? {}, {
        [this.path]: analysis,
      });

      await setDoc(userRef, userData).catch((e) => {
        console.log("Couldn't save analysis.", e);
        alert("Could not save analysis");
      });

      this.setState((prevState) => ({
        analyses: mergeAnalyses(prevState.analyses, userData.analyses),
      }));
    } else {
      if (this.state.currentMidi) {
        this.setState((prevState) => ({
          analyses: mergeAnalyses(prevState.analyses, {
            [`f/${this.state.currentMidi.slug}`]: analysis,
          }),
        }));
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
        case "u":
          const { location } = this.props;
          navigator.clipboard.writeText(
            `"${location.pathname.substring(
              location.pathname.lastIndexOf("/") + 1,
            )}", `,
          );
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
        case "p":
          this.setLatencyCorrectionMs(0);
          e.preventDefault();
          break;
        case "[":
          this.setLatencyCorrectionMs(200);
          e.preventDefault();
          break;
        case "]":
          this.setLatencyCorrectionMs(800);
          e.preventDefault();
          break;
        case "h":
          this.toggleShortcutHelp();
          e.preventDefault();
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

      // Run all registered handlers
      this.keyboardHandlers.forEach((handler) => handler(e));
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
    const tempo = clamp(this.state.tempo + delta, 0.1, 4);
    this.midiPlayer?.setTempo(tempo);
    this.setState({
      tempo: tempo,
    });
  }

  handleSongClick = async (url: string) => {
    console.log("handleSongClick called with url:", url);
    if (url.startsWith("f:")) {
      const slugOrId = url.slice(2);
      console.log("Extracted slugOrId:", slugOrId);
      await this.loadMidiFromSlug(slugOrId);
    } else {
      console.log("Unhandled URL type:", url);
    }
  };

  loadMidiFromSlug = async (slugOrId: string) => {
    console.log("loadMidiFromSlug called with slugOrId:", slugOrId);
    const firestore = getFirestore();
    try {
      console.log("Fetching index document");
      const indexDoc = await getDoc(doc(firestore, "indexes", "midis"));
      const indexData = indexDoc.data() as FirestoreMidiIndex;
      console.log("Index document data:", indexData);

      if (!indexData) {
        console.error("Index document not found");
        return;
      }

      console.log("Searching for MIDI info with slugOrId:", slugOrId);
      let midiInfo = indexData.midis.find(
        (midi) => midi.slug === slugOrId || midi.id === slugOrId,
      );
      console.log("Found MIDI info:", midiInfo);

      if (!midiInfo) {
        console.error(`No MIDI found for slugOrId: ${slugOrId}`);
        return;
      }

      console.log("Fetching MIDI document with ID:", midiInfo.id);
      const midiDoc = await getDoc(doc(firestore, "midis", midiInfo.id));
      if (midiDoc.exists()) {
        const midiData = midiDoc.data() as FirestoreMidiDocument;
        console.log("MIDI document data:", midiData);

        // Convert Firestore Bytes to Blob
        const midiBlob = new Blob([midiData.blob.toUint8Array()], {
          type: "audio/midi",
        });
        console.log("Created MIDI Blob:", midiBlob);

        this.setState(
          {
            currentMidi: {
              id: midiInfo.id,
              title: midiData.title,
              slug: midiData.slug,
              sourceUrl: midiData.url,
            },
          },
          () => {
            console.log(
              "State updated with currentMidi:",
              this.state.currentMidi,
            );
            console.log("Calling loadMidi with blob");
            this.loadMidi(midiBlob);
          },
        );
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error loading MIDI:", error);
    }
  };

  loadMidi = (midiBlob: Blob) => {
    console.log("loadMidi called with blob:", midiBlob);

    if (this.midiPlayer) {
      console.log("MIDIPlayer exists, loading data");

      midiBlob
        .arrayBuffer()
        .then((arrayBuffer) => {
          const transformedBuffer = transformMidi(new Uint8Array(arrayBuffer));

          this.midiPlayer
            .loadData(transformedBuffer, this.state.currentMidi?.slug || "")
            .then((parsingResult) => {
              console.log("MIDI data loaded, parsing result:", parsingResult);
              this.setState({ parsing: parsingResult }, () => {
                console.log("State updated with parsing result");
                this.setupMidiPlayer();
              });
            })
            .catch((error) => {
              console.error("Error loading MIDI data:", error);
            });
        })
        .catch((error) => {
          console.error("Error converting Blob to ArrayBuffer:", error);
        });
    } else {
      console.error("MIDIPlayer not initialized");
    }
  };

  setupMidiPlayer = () => {
    console.log("Setting up MIDI player");

    console.log("Setting up rawlProps");
    this.setState(
      (prevState) => {
        const slug = prevState.currentMidi?.slug;
        const analysisKey = `f/${slug}`;
        const savedAnalysis = prevState.analyses[analysisKey];
        console.log(
          `Retrieving analysis for key: ${analysisKey}`,
          savedAnalysis,
        );

        const newRawlProps = {
          parsingResult: this.state.parsing,
          getCurrentPositionMs: this.midiPlayer?.getPositionMs || (() => 0),
          savedAnalysis: savedAnalysis,
          saveAnalysis: this.saveAnalysis,
          voiceNames: this.state.voiceNames,
          voiceMask: this.state.voiceMask,
          setVoiceMask: this.handleSetVoiceMask,
          showAnalysisBox: this.state.analysisEnabled,
          seek: this.seekForRawl,
          artist: "",
          song: prevState.currentMidi?.title || "",
          latencyCorrectionMs:
            this.state.latencyCorrectionMs * this.state.tempo,
          registerKeyboardHandler: this.registerKeyboardHandler,
          unregisterKeyboardHandler: this.unregisterKeyboardHandler,
          sourceUrl: prevState.currentMidi?.sourceUrl || null,
        };
        console.log("New rawlProps:", newRawlProps);
        return { rawlProps: newRawlProps };
      },
      () => {
        console.log("State updated with rawlProps");
        this.startPlayback();
      },
    );
  };

  startPlayback = () => {
    console.log("Starting playback");
    if (this.midiPlayer) {
      console.log("MIDIPlayer exists, starting playback");
    } else {
      console.error("MIDIPlayer not initialized");
    }
  };

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
    if (path.startsWith("f")) {
      // commenting out since this path is probably not needed anymore
      //
      // const index = await getDoc(doc(this.db, "indexes", "midis"));
      // const firestoreMidiDirectory = (
      //   index.data() as FirestoreMidiIndex
      // ).midis.map(({ title, id, slug }, order) => ({
      //   idx: order,
      //   path: `/static/f/${title}`,
      //   id,
      //   slug,
      //   size: 1337,
      //   type: "file",
      // }));
      // return this.processFetchedDirectory(path, firestoreMidiDirectory);
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
    this.droppedFilename = slugify(file.name.replace(/\.mid$/i, ""));
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

  toggleShortcutHelp = () => {
    this.setState((prevState) => ({
      showShortcutHelp: !prevState.showShortcutHelp,
    }));
  };

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
        const { blob, url: sourceUrl } = (
          await getDoc(doc(firestore, "midis", url.slice(2)))
        ).data() as FirestoreMidiDocument;

        // Update the state with sourceUrl
        this.setState((prevState) => ({
          currentMidi: {
            ...prevState.currentMidi,
            sourceUrl: sourceUrl || null, // Use null if sourceUrl is undefined or empty
          },
        }));

        const transformedMidi = transformMidi(
          Uint8Array.from(blob.toUint8Array()),
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
    const uint8Array = transformMidi(new Uint8Array(buffer));

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

  registerKeyboardHandler = (id: string, handler: KeyboardHandler) => {
    this.keyboardHandlers.set(id, handler);
  };

  unregisterKeyboardHandler = (id: string) => {
    this.keyboardHandlers.delete(id);
  };

  render() {
    const { location } = this.props;
    const rawlProps: RawlProps = {
      parsingResult: this.state.parsing,
      getCurrentPositionMs: this.midiPlayer?.getPositionMs || (() => 0),
      savedAnalysis: this.state.analyses[this.path] ?? null,
      saveAnalysis: this.saveAnalysis,
      voiceNames: this.state.voiceNames,
      voiceMask: this.state.voiceMask,
      setVoiceMask: this.handleSetVoiceMask,
      showAnalysisBox: this.state.analysisEnabled,
      seek: this.seekForRawl,
      artist: "",
      song: this.path,
      latencyCorrectionMs: this.state.latencyCorrectionMs * this.state.tempo,
      registerKeyboardHandler: this.registerKeyboardHandler,
      unregisterKeyboardHandler: this.unregisterKeyboardHandler,
      sourceUrl: this.state.currentMidi?.sourceUrl || null,
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
        path={["/f/:slug*", "/c/:chiptuneUrl*", "/drop", "/slicer/:slug*"]}
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
                    registerKeyboardHandler={this.registerKeyboardHandler}
                    unregisterKeyboardHandler={this.unregisterKeyboardHandler}
                    sourceUrl={this.state.currentMidi?.sourceUrl || null}
                    {...rawlProps}
                  />
                  {match.path === "/drop" && (
                    <DropSaveForm
                      midi={this.midi}
                      filename={this.droppedFilename}
                    />
                  )}
                </>
              )}
              {match.path.startsWith("/slicer") && (
                <Slicer
                  playSongBuffer={this.playSongBuffer}
                  analyses={this.state.analyses}
                  slug={slug}
                />
              )}
            </>
          );
        }}
      />
    );

    return (
      <AppContext.Provider
        value={{
          handleSongClick: this.handleSongClick,
          rawlProps: this.state.rawlProps,
          analyses: this.state.analyses,
          saveAnalysis: this.saveAnalysis,
        }}
      >
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
                        <Route path="/old" render={() => <OldLandingPage />} />
                        <Route
                          path="/corpus/:corpus*"
                          render={({ match }) => (
                            <Corpus slug={match.params?.corpus} />
                          )}
                        />
                        <Route path="/pages/daw" render={() => <DAW />} />
                        <Route path="/pirate" render={() => <Pirate />} />
                        {browseRoute}
                        {rawlRoute}
                        <Route path="/path" render={() => <PathView />} />
                        <Route
                          path="/path2"
                          render={() => (
                            <NewPathView analyses={this.state.analyses} />
                          )}
                        />
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
                  tempo={this.state.tempo}
                  setTempo={this.handleTempoChange}
                />
              )}
              <Modal
                isOpen={this.state.showShortcutHelp}
                onRequestClose={this.toggleShortcutHelp}
                contentLabel="Keyboard Shortcuts"
                style={{
                  content: {
                    background: "black",
                    border: "none",
                  },
                  overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                  },
                }}
              >
                <ShortcutHelp />
              </Modal>
            </div>
          )}
        </Dropzone>
      </AppContext.Provider>
    );
  }
}

export default withRouter(App);
