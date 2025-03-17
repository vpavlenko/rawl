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
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  useParams,
  withRouter,
} from "react-router-dom";
import styled from "styled-components";
import { slugify } from "transliteration";
import { decomposeScores } from "./rawl/decomposition/decomposeScores";

import ChipCore from "../chip-core";
import {
  CATALOG_PREFIX,
  ERROR_FLASH_DURATION_MS,
  MAX_VOICES,
  SOUNDFONT_MOUNTPOINT,
} from "../config";
import firebaseConfig from "../config/firebaseConfig";
import defaultAnalyses from "../corpus/analyses.json";
import { handleSongClick as handleSongClickUtil } from "../handlers/handleSongClick";
import keySlugMapping from "../keySlugMapping";
import MIDIPlayer from "../players/MIDIPlayer";
import promisify from "../promisify-xhr";
import { ensureEmscFileWithData, unlockAudioContext } from "../util";
import Alert from "./Alert";
import { AppContext } from "./AppContext";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";
import DropMessage from "./DropMessage";
import Timeline from "./Timeline";
import CorpusSearch from "./rawl/CorpusSearch";
import Histograms from "./rawl/Histograms";
import OldLandingPage from "./rawl/OldLandingPage";
import Rawl, { RawlProps } from "./rawl/Rawl";
import { ShortcutHelp } from "./rawl/ShortcutHelp";
import { Analyses, MeasuresSpan } from "./rawl/analysis";
import Blog from "./rawl/blog/Blog";
import Book from "./rawl/book/Book";
import BookOnStyles from "./rawl/book/BookOnStyles";
import Corpus from "./rawl/corpora/Corpus";
import Structures, { StructuresProps } from "./rawl/corpora/Structures";
import Decomposition from "./rawl/decomposition/Decomposition";
import Editor from "./rawl/editor/Editor";
import EditorLandingPage from "./rawl/editor/EditorLandingPage";
import ForgeUI from "./rawl/forge/ForgeUI";
import { DropSaveForm, saveMidiFromLink } from "./rawl/midiStorage";
import DAW from "./rawl/pages/DAW";
import { ParsingResult } from "./rawl/parseMidi";
import transformMidi from "./rawl/transformMidi";

// Constants
export const DUMMY_CALLBACK = () => {};
export const ADMIN_USER_ID = "RK31rsh4tDdUGlNYQvakXW4AYbB3"; // Admin user ID

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
  enableManualRemeasuring: boolean;
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
    isHiddenRoute: boolean;
  } | null;
  audioContextLocked: boolean;
  audioContextState: string;
  currentPlaybackTime: number | null;
  currentMidiBuffer: ArrayBuffer | null;
  hoveredMeasuresSpan: MeasuresSpan | null;
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

const AppMainContent = styled.div`
  margin-bottom: 25px; // Add space for fixed footer
  height: 100vh; // Subtract header height and footer margin
  overflow-y: auto; // Enable vertical scrolling
  padding: 0; // Add some horizontal padding
`;

class App extends React.Component<RouteComponentProps, AppState> {
  private contentAreaRef: React.RefObject<HTMLDivElement>;
  private errorTimer: number;
  private midiPlayer: MIDIPlayer;
  private currUrl: string;
  private songRequest: (method: string, url: string) => Promise<any>;
  private db: Firestore;
  private mediaSessionAudio: HTMLAudioElement;
  private gainNode: GainNode;
  private chipCore: any;
  private path: string;
  private hash: string;
  private midi: ArrayBuffer;
  private droppedFilename: string;
  private keyboardHandlers: Map<string, KeyboardHandler> = new Map();
  private audioContext: AudioContext;
  private playbackTimer: NodeJS.Timeout;

  constructor(props) {
    super(props);
    autoBindReact(this);

    this.attachMediaKeyHandlers();
    this.contentAreaRef = React.createRef();
    this.errorTimer = null;
    this.midiPlayer = null; // Need a reference to MIDIPlayer to handle SoundFont loading.
    this.currUrl = null;
    this.songRequest = null;

    // Initialize Firebase
    const firebaseApp = firebaseInitializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    this.db = getFirestore(firebaseApp);

    // Load the admin analyses
    const adminDocRef = doc(this.db, "users", ADMIN_USER_ID);
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

    // Initialize audio context
    // @ts-ignore webkitAudioContext needed for Safari <=13
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      latencyHint: "playback",
    });

    this.audioContext.suspend();

    // Get latency correction from localStorage
    const savedLatencyCorrection = localStorage.getItem("latencyCorrectionMs");
    const initialLatencyCorrection = savedLatencyCorrection
      ? parseInt(savedLatencyCorrection, 10)
      : 500;

    // Initialize state with actual audio context state
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
      volume: 150,
      directories: {},
      paramDefs: [],
      parsing: null,
      enableManualRemeasuring: false,
      analyses: defaultAnalyses as unknown as Analyses,
      latencyCorrectionMs: initialLatencyCorrection,
      fileToDownload: null,
      showShortcutHelp: false,
      rawlProps: null,
      currentMidi: null,
      audioContextLocked: this.audioContext.state === "suspended",
      audioContextState: this.audioContext.state,
      currentPlaybackTime: null,
      currentMidiBuffer: null,
      hoveredMeasuresSpan: null,
    };

    const bufferSize = Math.max(
      Math.pow(
        2,
        Math.ceil(
          Math.log2(
            (this.audioContext.baseLatency || 0.001) *
              this.audioContext.sampleRate,
          ),
        ),
      ),
      16384,
    );
    const gainNode = (this.gainNode = this.audioContext.createGain());
    gainNode.gain.value = 1;
    gainNode.connect(this.audioContext.destination);
    const playerNode = this.audioContext.createScriptProcessor(
      bufferSize,
      0,
      2,
    );
    playerNode.connect(gainNode);

    unlockAudioContext(this.audioContext);
    console.log(
      "Sample rate: %d hz. Base latency: %d. Buffer size: %d.",
      this.audioContext.sampleRate,
      this.audioContext.baseLatency * this.audioContext.sampleRate,
      bufferSize,
    );

    this.initChipCore(playerNode, bufferSize);

    // Inline processMidiUrls here
    const location = this.props.location;
    const params = new URLSearchParams(location.search);

    const link = params.get("link");
    if (link) {
      saveMidiFromLink(link);
    }

    const [, urlSlug] = location.pathname.split("/f/");
    const [, keySlug] = location.pathname.split("/h/");

    if (urlSlug) {
      this.handleSongClick(urlSlug);
    } else if (keySlug) {
      const valueSlug = keySlugMapping[keySlug];
      if (valueSlug) {
        this.handleSongClick(valueSlug, true);
      } else {
        console.error(`No mapping found for key slug: ${keySlug}`);
      }
    }
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

  async initChipCore(playerNode, bufferSize) {
    const audioState = this.audioContext.state;
    this.setState({
      audioContextLocked: audioState === "suspended",
      audioContextState: audioState,
    });

    // Add event listener to track audio context state changes
    this.audioContext.addEventListener("statechange", () => {
      const newState = this.audioContext.state;
      this.setState({
        audioContextLocked: newState === "suspended",
        audioContextState: newState,
      });
    });

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
      this.audioContext.sampleRate,
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
    if (this.path === "drop") return;

    const user = this.state.user;
    if (user) {
      const userRef = doc(this.db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      let userData = userDoc.exists() ? userDoc.data() : {};
      userData.analyses = mergeAnalyses(userData.analyses ?? {}, {
        [this.path]: analysis,
      });

      await setDoc(userRef, userData).catch(() => {
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
      // Skip all keyboard shortcuts if globally disabled
      if (window.__disableGlobalShortcuts) return;

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
        case "r":
          this.setState((prevState) => ({
            enableManualRemeasuring: !prevState.enableManualRemeasuring,
          }));
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

    if (isEjected) {
      this.setState({
        ejected: true,
        currentSongNumVoices: 0,
        currentSongPositionMs: 0,
        currentSongDurationMs: 1,
        songUrl: null,
      });

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

  handleSongClick = async (slug: string, isHiddenRoute: boolean = false) => {
    try {
      await handleSongClickUtil(
        {
          setState: this.setState.bind(this),
          loadMidi: this.loadMidi,
          state: this.state,
        },
        slug,
        isHiddenRoute,
      );

      // After successful load, start playback automatically
      if (this.midiPlayer && this.state.paused) {
        this.togglePause();
      }
    } catch (error) {
      console.log(error);
    }
  };

  loadMidi = (midiBlob: Blob, playbackStartedCallback?: () => void) => {
    if (this.midiPlayer) {
      midiBlob
        .arrayBuffer()
        .then((arrayBuffer) => {
          const transformedBuffer = transformMidi(new Uint8Array(arrayBuffer));

          this.setState({ currentMidiBuffer: arrayBuffer });

          this.midiPlayer.setPlaybackStartedCallback(playbackStartedCallback);

          this.midiPlayer
            .loadData(transformedBuffer, this.state.currentMidi?.slug || "")
            .then((parsingResult) => {
              this.setState({ parsing: parsingResult }, () => {
                this.setupMidiPlayer();
              });
            })
            .catch((error) => {
              // Handle error silently
            });
        })
        .catch((error) => {
          // Handle error silently
        });
    }
  };

  setupMidiPlayer = () => {
    this.setState(
      (prevState) => {
        const slug = prevState.currentMidi?.slug;
        const analysisKey = `f/${slug}`;
        const savedAnalysis = prevState.analyses[analysisKey];

        if (!this.state.parsing) {
          return null;
        }

        const newRawlProps = {
          parsingResult: this.state.parsing,
          getCurrentPositionMs: this.midiPlayer?.getPositionMs || (() => 0),
          savedAnalysis: savedAnalysis,
          saveAnalysis: this.saveAnalysis,
          voiceNames: this.state.voiceNames,
          voiceMask: this.state.voiceMask,
          setVoiceMask: this.handleSetVoiceMask,
          enableManualRemeasuring: this.state.enableManualRemeasuring,
          seek: this.seekForRawl,
          latencyCorrectionMs:
            this.state.latencyCorrectionMs * this.state.tempo,
          registerKeyboardHandler: this.registerKeyboardHandler,
          unregisterKeyboardHandler: this.unregisterKeyboardHandler,
          sourceUrl: prevState.currentMidi?.sourceUrl || null,
          isHiddenRoute: prevState.currentMidi?.isHiddenRoute || false,
        };
        return { rawlProps: newRawlProps };
      },
      () => {
        // Remove automatic playback start - let user control it
        // this.startPlayback();
      },
    );
  };

  startPlayback = () => {
    if (!this.midiPlayer) {
      // Handle error silently
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
    const { isStopped, isPlaying } = playerState;
    console.debug("Sequencer.handlePlayerStateUpdate(isStopped=%s)", isStopped);

    if (isStopped) {
      this.currUrl = null;
      // Set paused to true when playback has stopped/finished
      this.setState({ paused: true });
    } else {
      // Also update paused state when isPlaying flag is explicitly provided
      if (isPlaying !== undefined) {
        this.setState({ paused: !isPlaying });
      }

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

  async playSongBuffer(
    filepath: string,
    buffer: ArrayBuffer | Uint8Array,
    shouldAutoPlay: boolean = true,
  ) {
    this.midiPlayer.suspend();

    const inputArray =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

    const uint8Array = transformMidi(inputArray);

    this.hash = md5(uint8Array);

    this.midiPlayer.setTempo(1);

    this.setState({
      currentMidiBuffer: buffer instanceof ArrayBuffer ? buffer : buffer.buffer,
      paused: !shouldAutoPlay,
    });

    try {
      const parsingResult = await this.midiPlayer.loadData(
        uint8Array,
        filepath,
        shouldAutoPlay,
      );

      this.setState({ parsing: parsingResult }, () => {
        const numVoices = this.midiPlayer.getNumVoices();
        const voiceMask = [...Array(numVoices)].fill(true);
        this.midiPlayer.setVoiceMask(voiceMask);
        this.setState({ voiceMask }, () => {
          this.setupMidiPlayer();

          if (!shouldAutoPlay) {
            this.midiPlayer.pause();
          }
        });
      });
    } catch (e) {
      this.handlePlayerError(`Unable to play ${filepath} (${e.message}).`);
    }
  }

  registerKeyboardHandler = (id: string, handler: KeyboardHandler) => {
    this.keyboardHandlers.set(id, handler);
  };

  unregisterKeyboardHandler = (id: string) => {
    this.keyboardHandlers.delete(id);
  };

  resetMidiPlayerState = () => {
    if (this.midiPlayer) {
      this.midiPlayer.eject();
    }
    this.setState({
      ejected: true,
      currentSongNumVoices: 0,
      currentSongPositionMs: 0,
      currentSongDurationMs: 1,
      songUrl: null,
      rawlProps: null,
      currentMidi: null,
      parsing: null,
    });
  };

  handleUnlockAudioContext = async () => {
    if (this.audioContext) {
      await this.audioContext.resume();
      this.setState({
        audioContextLocked: this.audioContext.state === "suspended",
        audioContextState: this.audioContext.state,
      });
    }
  };

  // Add this method to update playback time
  updatePlaybackTime = () => {
    if (this.midiPlayer && this.midiPlayer.isPlaying()) {
      const positionMs = this.midiPlayer.getPositionMs();
      this.setState({ currentPlaybackTime: positionMs / 1000 });
    }
  };

  componentDidMount() {
    // Start the playback time update timer with a longer interval
    this.playbackTimer = setInterval(this.updatePlaybackTime, 100); // Update every 100ms instead of 50ms
  }

  componentWillUnmount() {
    // Clear the playback timer
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
    }
  }

  eject = () => {
    if (this.midiPlayer) {
      this.midiPlayer.eject();
      this.handleSequencerStateUpdate({ isEjected: true });
    }
  };

  componentDidUpdate(prevProps: RouteComponentProps) {
    const prevPath = prevProps.location.pathname;
    const currentPath = this.props.location.pathname;
    const isStructuresRoute = currentPath.startsWith("/s/");
    const wasStructuresRoute = prevPath.startsWith("/s/");

    // Only eject if navigating into Structures from a non-Structures route
    if (isStructuresRoute && !wasStructuresRoute) {
      this.eject();
      // Reset rawlProps to hide InlineRawl
      this.setState({
        rawlProps: null,
        currentMidi: null,
      });
    }
  }

  render() {
    const { location } = this.props;
    const rawlProps: RawlProps = {
      parsingResult: this.state.parsing,
      getCurrentPositionMs: this.midiPlayer?.getPositionMs,
      savedAnalysis: this.state.analyses[this.path] ?? null,
      saveAnalysis: this.saveAnalysis,
      voiceNames: this.state.voiceNames,
      voiceMask: this.state.voiceMask,
      setVoiceMask: this.handleSetVoiceMask,
      enableManualRemeasuring: this.state.enableManualRemeasuring,
      seek: this.seekForRawl,
      latencyCorrectionMs: this.state.latencyCorrectionMs * this.state.tempo,
      sourceUrl: this.state.currentMidi?.sourceUrl || null,
    };

    const rawlRoute = (
      <Route
        path={["/f/:slug*", "/h/:keySlug*", "/c/:chiptuneUrl*", "/drop"]}
        render={({ match }) => {
          const { keySlug } = match.params as {
            slug?: string;
            keySlug?: string;
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
                    enableManualRemeasuring={this.state.enableManualRemeasuring}
                    seek={this.seekForRawl}
                    sourceUrl={this.state.currentMidi?.sourceUrl || null}
                    isHiddenRoute={!!keySlug}
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
            </>
          );
        }}
      />
    );

    const decompositionRoute = (
      <Route
        path="/d/:slug/:step?"
        render={({ match }) => {
          const { slug, step } = match.params as {
            slug: string;
            step?: string;
          };
          const currentStep = step ? parseInt(step, 10) : 1;

          // Set the path for analysis storage
          this.path = match.url.slice(1);

          return (
            <Decomposition
              slug={slug}
              step={currentStep}
              setVoiceMask={this.handleSetVoiceMask}
              voiceMask={this.state.voiceMask}
              voiceNames={this.state.voiceNames}
              registerKeyboardHandler={this.registerKeyboardHandler}
              unregisterKeyboardHandler={this.unregisterKeyboardHandler}
              savedAnalysis={this.state.analyses[this.path] ?? null}
              saveAnalysis={this.saveAnalysis}
              getCurrentPositionMs={this.midiPlayer?.getPositionMs}
              seek={this.seekForRawl}
              latencyCorrectionMs={
                this.state.latencyCorrectionMs * this.state.tempo
              }
            />
          );
        }}
      />
    );

    const isStructuresRoute = location.pathname.startsWith("/s/");

    if (isStructuresRoute) {
      return (
        <AppContext.Provider
          value={{
            handleSongClick: this.handleSongClick,
            rawlProps: this.state.rawlProps,
            setRawlProps: (rawlProps) => this.setState({ rawlProps }),
            analyses: this.state.analyses,
            saveAnalysis: this.saveAnalysis,
            resetMidiPlayerState: this.resetMidiPlayerState,
            registerKeyboardHandler: this.registerKeyboardHandler,
            unregisterKeyboardHandler: this.unregisterKeyboardHandler,
            currentMidi: this.state.currentMidi,
            setCurrentMidi: (currentMidi) => this.setState({ currentMidi }),
            user: this.state.user,
            seek: this.seekForRawl,
            currentPlaybackTime: this.state.currentPlaybackTime || null,
            eject: this.eject,
            currentMidiBuffer: this.state.currentMidiBuffer,
            hoveredMeasuresSpan: this.state.hoveredMeasuresSpan,
            setHoveredMeasuresSpan: (span) =>
              this.setState({ hoveredMeasuresSpan: span }),
            togglePause: this.togglePause,
            handleLogin: this.handleLogin,
            handleLogout: this.handleLogout,
            handleToggleManualRemeasuring: () => {
              this.setState((prevState) => ({
                enableManualRemeasuring: !prevState.enableManualRemeasuring,
              }));
            },
            enableManualRemeasuring: this.state.enableManualRemeasuring,
            playSongBuffer: this.playSongBuffer,
            latencyCorrectionMs: this.state.latencyCorrectionMs,
            tempo: this.state.tempo,
          }}
        >
          <AppHeader />
          <Switch>
            <Route
              path="/s/"
              exact
              render={() => <Structures analyses={this.state.analyses} />}
            />
            <Route
              path="/s/:chapter/:topic"
              render={() => (
                <StructuresWithParams analyses={this.state.analyses} />
              )}
            />
            <Route
              path="/s/:chapter"
              render={() => (
                <StructuresWithParams analyses={this.state.analyses} />
              )}
            />
          </Switch>
        </AppContext.Provider>
      );
    }

    // The rest of your existing render method for other routes
    return (
      <AppContext.Provider
        value={{
          handleSongClick: this.handleSongClick,
          rawlProps: this.state.rawlProps,
          setRawlProps: (rawlProps) => this.setState({ rawlProps }),
          analyses: this.state.analyses,
          saveAnalysis: this.saveAnalysis,
          resetMidiPlayerState: this.resetMidiPlayerState,
          registerKeyboardHandler: this.registerKeyboardHandler,
          unregisterKeyboardHandler: this.unregisterKeyboardHandler,
          currentMidi: this.state.currentMidi,
          setCurrentMidi: (currentMidi) => this.setState({ currentMidi }),
          user: this.state.user,
          seek: this.seekForRawl,
          currentPlaybackTime: this.state.currentPlaybackTime || null,
          eject: this.eject,
          currentMidiBuffer: this.state.currentMidiBuffer,
          hoveredMeasuresSpan: this.state.hoveredMeasuresSpan,
          setHoveredMeasuresSpan: (span) =>
            this.setState({ hoveredMeasuresSpan: span }),
          togglePause: this.togglePause,
          handleLogin: this.handleLogin,
          handleLogout: this.handleLogout,
          handleToggleManualRemeasuring: () => {
            this.setState((prevState) => ({
              enableManualRemeasuring: !prevState.enableManualRemeasuring,
            }));
          },
          enableManualRemeasuring: this.state.enableManualRemeasuring,
          playSongBuffer: this.playSongBuffer,
          latencyCorrectionMs: this.state.latencyCorrectionMs,
          tempo: this.state.tempo,
        }}
      >
        <Dropzone disableClick style={{}} onDrop={this.onDrop}>
          {/* @ts-ignore */}
          {(dropzoneProps) => (
            <>
              {this.state.audioContextLocked &&
                this.state.parsing &&
                !(this.props.location.pathname === "/e/new") && (
                  <div className="audio-context-overlay">
                    <button
                      className="unlock-audio-button"
                      onClick={this.handleUnlockAudioContext}
                    >
                      Play
                    </button>
                  </div>
                )}
              <DropMessage dropzoneProps={dropzoneProps} />
              <Alert
                handlePlayerError={this.handlePlayerError}
                playerError={this.state.playerError}
                showPlayerError={this.state.showPlayerError}
              />

              <AppHeader />
              <AppMainContent ref={this.contentAreaRef}>
                <Switch>
                  <Route path="/old" render={() => <OldLandingPage />} />
                  <Route
                    path="/corpus/:corpus?"
                    render={({ match }) =>
                      match.params.corpus ? (
                        <Corpus slug={match.params.corpus} />
                      ) : (
                        <CorpusSearch />
                      )
                    }
                  />
                  <Route path="/daw" render={() => <DAW />} />
                  <Route exact path="/e" component={EditorLandingPage} />
                  <Route path="/e/:slug?" component={Editor} />
                  <Route path="/ef/:id?" component={Editor} />
                  <Route path="/book/:slug?" component={BookOnStyles} />
                  <Route path="/blog/:postId?" component={Blog} />
                  {rawlRoute}
                  <Redirect
                    exact
                    from="/d/"
                    to={`/d/${Object.keys(decomposeScores)[0]}/1`}
                  />
                  {decompositionRoute}
                  <Route path="/100/:slug?" component={Book} />
                  <Route path="/beyond/:slug?" component={Book} />
                  <Route path="/timeline" component={Timeline} />
                  <Route path="/forge" component={ForgeUI} />
                  <Route path="/histograms" component={Histograms} />
                  <Redirect exact from="/" to="/100" />
                </Switch>
              </AppMainContent>
              <AppFooter
                currentSongDurationMs={this.state.currentSongDurationMs}
                ejected={this.state.ejected}
                paused={this.state.paused}
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
            </>
          )}
        </Dropzone>
      </AppContext.Provider>
    );
  }
}

// New component to handle route params
const StructuresWithParams: React.FC<StructuresProps> = ({ analyses }) => {
  const { chapter, topic } = useParams<{ chapter: string; topic?: string }>();

  return (
    <Structures
      analyses={analyses}
      initialChapter={decodeURIComponent(chapter)}
      initialTopic={topic ? decodeURIComponent(topic) : undefined}
    />
  );
};

export default withRouter(App);
