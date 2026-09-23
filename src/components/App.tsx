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
import Modal from "react-modal";
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  useLocation,
  withRouter,
} from "react-router-dom";
import styled from "styled-components";
import { slugify } from "transliteration";
import { decomposeScores } from "./rawl/decomposition/decomposeScores";

import { ERROR_FLASH_DURATION_MS, MAX_VOICES } from "../config";
import firebaseConfig from "../config/firebaseConfig";
import defaultAnalyses from "../corpus/analyses.json";
import { handleSongClick as handleSongClickUtil } from "../handlers/handleSongClick";
import MIDIPlayer from "../players/ThreadedMIDIPlayer";
import { unlockAudioContext } from "../util";
import Alert from "./Alert";
import { AppContext } from "./AppContext";
import { PlaybackTimeProvider } from "./PlaybackTimeContext";
import AppFooter, { FOOTER_HEIGHT } from "./AppFooter";
import AppHeader, { HEADER_HEIGHT } from "./AppHeader";
import DropMessage from "./DropMessage";
import Pieces from "./Pieces";
import Lakh from "./lakh/Lakh";
import { lakhAnalysisKey } from "./lakh/catalog";
import Histograms from "./rawl/Histograms";
import OldLandingPage from "./rawl/OldLandingPage";
import Rawl, { RawlProps } from "./rawl/Rawl";
import { ShortcutHelp } from "./rawl/ShortcutHelp";
import {
  Analyses,
  MeasuresSpan,
  getExcludedVoices,
  getDrumVoices,
} from "./rawl/analysis";
import Blog from "./rawl/blog/Blog";
import Book from "./rawl/book/Book";
import BookOnStyles from "./rawl/book/BookOnStyles";
import Corpus from "./rawl/corpora/Corpus";
import Structures, { StructuresProps } from "./rawl/corpora/Structures";
import Decomposition from "./rawl/decomposition/Decomposition";
import Converter from "./rawl/editor/Converter";
import Editor from "./rawl/editor/Editor";
import EditorLandingPage, {
  StyledButton,
} from "./rawl/editor/EditorLandingPage";
import { DropSaveForm, saveMidiFromLink } from "./rawl/midiStorage";

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
  transpose: number;
  firstTonic: number | null;
  voiceMask: VoiceMask;
  voiceNames: string[];
  showPlayerError: boolean;
  user: User;
  songUrl: string;
  volume: number;
  directories: any;
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
    analysisKey?: string;
  } | null;
  audioContextLocked: boolean;
  audioContextState: string;
  currentMidiBuffer: ArrayBuffer | null;
  hoveredMeasuresSpan: MeasuresSpan | null;
};

type KeyboardHandler = (e: KeyboardEvent) => void;

Modal.setAppElement("#root");

function mergeAnalyses(existingAnalyses, newAnalyses) {
  return {
    ...existingAnalyses,
    ...newAnalyses,
  };
}

const AppMainContent = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT} - ${FOOTER_HEIGHT + 1}px);
  height: calc(100dvh - ${HEADER_HEIGHT} - ${FOOTER_HEIGHT + 1}px);
  overflow-y: auto;
  padding: 0;
`;

class App extends React.Component<RouteComponentProps, AppState> {
  private contentAreaRef: React.RefObject<HTMLDivElement>;
  private errorTimer: number;
  private midiPlayer: MIDIPlayer;
  private pendingMidiPlayer: MIDIPlayer | null = null;
  private currUrl: string;
  private db: Firestore;
  private mediaSessionAudio: HTMLAudioElement;
  private gainNode: GainNode;
  private path: string;
  private hash: string;
  private midi: ArrayBuffer;
  private droppedFilename: string;
  private keyboardHandlers: Map<string, KeyboardHandler> = new Map();
  private audioContext: AudioContext;

  constructor(props) {
    super(props);
    autoBindReact(this);

    this.attachMediaKeyHandlers();
    this.contentAreaRef = React.createRef();
    this.errorTimer = null;
    this.midiPlayer = null; // Need a reference to MIDIPlayer to handle SoundFont loading.
    this.currUrl = null;

    // Initialize Firebase
    const firebaseApp = firebaseInitializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    this.db = getFirestore(firebaseApp);

    // Load the admin analyses
    const adminDocRef = doc(this.db, "users", ADMIN_USER_ID);
    getDoc(adminDocRef).then((adminSnapshot) => {
      if (adminSnapshot.exists() && adminSnapshot.data().analyses) {
        this.setState((prevState) => ({
          analyses: {
            ...defaultAnalyses,
            ...adminSnapshot.data().analyses,
            // Personal annotations and edits may have loaded while this
            // request was pending. Only replace the bundled defaults.
            ...Object.fromEntries(
              Object.entries(prevState.analyses).filter(
                ([key, analysis]) => analysis !== defaultAnalyses[key],
              ),
            ),
          },
        }));
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
      latencyHint: "interactive",
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
      transpose: 0,
      firstTonic: null,
      voiceMask: Array(MAX_VOICES).fill(true),
      voiceNames: Array(MAX_VOICES).fill(""),
      showPlayerError: false,
      user: null,
      songUrl: null,
      volume: 150,
      directories: {},
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
      currentMidiBuffer: null,
      hoveredMeasuresSpan: null,
    };

    const gainNode = (this.gainNode = this.audioContext.createGain());
    gainNode.gain.value = 1;
    gainNode.connect(this.audioContext.destination);
    unlockAudioContext(this.audioContext);
    this.initAudioPlayer(gainNode);

    // Inline processMidiUrls here
    const location = this.props.location;
    const params = new URLSearchParams(location.search);

    const link = params.get("link");
    if (link) {
      saveMidiFromLink(link);
    }

    const [, urlSlug] = location.pathname.split("/f/");

    if (urlSlug) {
      this.handleSongClick(urlSlug);
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

  async initAudioPlayer(destination: AudioNode) {
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

    try {
      const debug = new URLSearchParams(window.location.search).get("debug");
      const player = new MIDIPlayer(this.audioContext, debug === "timing");
      this.pendingMidiPlayer = player;
      player.on("playerStateUpdate", this.handlePlayerStateUpdate);
      player.on("playerError", this.handlePlayerError);
      await player.initialize(destination);
      if (this.pendingMidiPlayer !== player) return;
      this.pendingMidiPlayer = null;
      this.midiPlayer = player;
      player.setForcedPanning(localStorage.getItem("forcedPanning") === "true");
      this.setState({ loading: false });
    } catch (error) {
      if (!this.pendingMidiPlayer) return;
      this.pendingMidiPlayer = null;
      this.setState({ loading: false, playerError: error.message });
      this.handlePlayerError(error.message);
    }
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
      songUrl: "url",
    };
    // The UI owns the manual voice selection, initialized when a song loads.
    // Player updates report the effective audio mask, which includes hover solo
    // and must never overwrite the selection restored when hovering ends.
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
        // Execute callback if provided, or refresh the page
        window.location.reload();
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

    const analysisKey = this.path;
    const user = this.state.user;
    if (user) {
      const userRef = doc(this.db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      let userData = userDoc.exists() ? userDoc.data() : {};
      userData.analyses = mergeAnalyses(userData.analyses ?? {}, {
        [analysisKey]: analysis,
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
            [this.state.currentMidi.analysisKey ||
            `f/${this.state.currentMidi.slug}`]: analysis,
          }),
        }));
      }
    }
  }

  async getFirebaseAnnotation(analysisKey: string) {
    const user = this.state.user;
    if (!user || user.uid !== ADMIN_USER_ID || !analysisKey) return null;

    const userRef = doc(this.db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    return userData.analyses?.[analysisKey] ?? null;
  }

  async saveFirebaseAnnotation(analysisKey: string, analysis) {
    const user = this.state.user;
    if (!user || user.uid !== ADMIN_USER_ID || !analysisKey) return;

    const userRef = doc(this.db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    userData.analyses = mergeAnalyses(userData.analyses ?? {}, {
      [analysisKey]: analysis,
    });

    await setDoc(userRef, userData);

    this.setState((prevState) => ({
      analyses: mergeAnalyses(prevState.analyses, {
        [analysisKey]: analysis,
      }),
      rawlProps: prevState.rawlProps
        ? { ...prevState.rawlProps, savedAnalysis: analysis }
        : prevState.rawlProps,
    }));
  }

  async deleteFirebaseAnnotation(analysisKey: string) {
    const user = this.state.user;
    if (!user || user.uid !== ADMIN_USER_ID || !analysisKey) return;

    const userRef = doc(this.db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    const analyses = { ...(userData.analyses ?? {}) };
    delete analyses[analysisKey];

    await setDoc(userRef, {
      ...userData,
      analyses,
    });

    this.setState((prevState) => {
      const nextAnalyses = { ...prevState.analyses };
      delete nextAnalyses[analysisKey];

      if (defaultAnalyses[analysisKey]) {
        nextAnalyses[analysisKey] = defaultAnalyses[analysisKey];
      }

      return {
        analyses: nextAnalyses,
        rawlProps: prevState.rawlProps
          ? {
              ...prevState.rawlProps,
              savedAnalysis: nextAnalyses[analysisKey] ?? null,
            }
          : prevState.rawlProps,
      };
    });
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
        (e.target.type === "text" || e.target.type === "search")
      )
        return; // text or search input has focus

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
        case "h":
          this.toggleShortcutHelp();
          e.preventDefault();
          break;
        case "r":
          this.handleToggleManualRemeasuring();
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

  hoveredVoiceIndex: number | null = null;

  handleVoiceHover = (voiceIndex: number | null) => {
    this.hoveredVoiceIndex = voiceIndex;
    this.midiPlayer?.setVoiceMask(
      voiceIndex === null
        ? this.state.voiceMask
        : this.state.voiceMask.map((_, index) => index === voiceIndex),
    );
  };

  handleSetVoiceMask(voiceMask: VoiceMask) {
    const nextVoiceMask = [...voiceMask];
    this.midiPlayer?.setVoiceMask(
      this.hoveredVoiceIndex === null
        ? nextVoiceMask
        : nextVoiceMask.map((_, index) => index === this.hoveredVoiceIndex),
    );
    // Lakh and embedded players consume rawlProps rather than the route props.
    // Keep their controls in sync so subsequent clicks use the current mask.
    this.setState((prevState) => ({
      voiceMask: nextVoiceMask,
      rawlProps: prevState.rawlProps
        ? { ...prevState.rawlProps, voiceMask: nextVoiceMask }
        : prevState.rawlProps,
    }));
  }

  handleForcedPanningChange = (enabled: boolean) => {
    this.midiPlayer?.setForcedPanning(enabled);
  };

  handleSetDrumVoices = (voices: number[]) => {
    this.midiPlayer?.setDrumVoices(voices);
  };

  handleTransposeChange = (semitones: number) => {
    if (!Number.isFinite(semitones)) return;
    const transpose = Math.max(-12, Math.min(12, Math.round(semitones)));
    this.midiPlayer?.setTranspose(transpose);
    this.setState({ transpose });
  };

  setFirstTonic = (firstTonic: number | null) => {
    this.setState((state) =>
      state.firstTonic === firstTonic ? null : { firstTonic },
    );
  };

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

  handleSongClick = async (slug: string) => {
    try {
      // Structures snippets retain Lakh annotation keys, not Firebase slugs.
      if (slug.startsWith("c/MIDI/")) {
        const [artist, ...trackParts] = slug.slice("c/MIDI/".length).split("/");
        const track = trackParts.join("/");
        if (!artist || !track) throw new Error(`Invalid Lakh key: ${slug}`);
        await this.loadLakhTrack(artist, track, new AbortController().signal);
        return;
      }

      await handleSongClickUtil(
        {
          setState: this.setState.bind(this),
          loadMidi: this.loadMidi,
          state: this.state,
        },
        slug,
      );

      // After successful load, start playback automatically
      if (this.midiPlayer && this.state.paused) {
        this.togglePause();
      }
    } catch (error) {
      console.log(error);
    }
  };

  loadLakhTrack = async (
    artist: string,
    track: string,
    signal: AbortSignal,
  ) => {
    const response = await fetch(
      `${process.env.PUBLIC_URL}/lakh-data/${encodeURIComponent(
        artist,
      )}/${encodeURIComponent(track)}`,
      { signal },
    );
    if (!response.ok)
      throw new Error(`Could not load ${track} (${response.status}).`);
    const buffer = await response.arrayBuffer();
    if (signal.aborted) return;
    if (new TextDecoder().decode(buffer.slice(0, 4)) !== "MThd") {
      throw new Error(
        `The static file for ${track} is missing or is not a MIDI file.`,
      );
    }
    const analysisKey = lakhAnalysisKey(artist, track);
    this.path = analysisKey;
    await new Promise<void>((resolve) =>
      this.setState(
        {
          parsing: null,
          rawlProps: null,
          currentMidi: {
            id: analysisKey,
            slug: "",
            title: `${artist} — ${track.replace(/\.mid$/i, "")}`,
            sourceUrl: "https://colinraffel.com/projects/lmd/",
            analysisKey,
          },
        },
        resolve,
      ),
    );
    if (signal.aborted) return;
    await this.playSongBuffer(track, buffer, true, signal);
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

  handleToggleManualRemeasuring = () => {
    this.setState((prevState) => {
      const enableManualRemeasuring = !prevState.enableManualRemeasuring;
      return {
        enableManualRemeasuring,
        // Lakh and embedded players read the stored props created on track load.
        rawlProps: prevState.rawlProps
          ? { ...prevState.rawlProps, enableManualRemeasuring }
          : prevState.rawlProps,
      };
    });
  };

  setupMidiPlayer = () => {
    this.setState(
      (prevState) => {
        const slug = prevState.currentMidi?.slug;
        const analysisKey = prevState.currentMidi?.analysisKey || `f/${slug}`;
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
          onVoiceHover: this.handleVoiceHover,
          onForcedPanningChange: this.handleForcedPanningChange,
          setDrumVoices: this.handleSetDrumVoices,
          enableManualRemeasuring: this.state.enableManualRemeasuring,
          seek: this.seekForRawl,
          latencyCorrectionMs: 0,
          registerKeyboardHandler: this.registerKeyboardHandler,
          unregisterKeyboardHandler: this.unregisterKeyboardHandler,
          sourceUrl: prevState.currentMidi?.sourceUrl || null,
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
        try {
          await this.midiPlayer.loadSoundfont(file.name, result);
        } catch (error) {
          this.handlePlayerError(error.message);
        }
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

  async playSongBuffer(
    filepath: string,
    buffer: ArrayBuffer | Uint8Array,
    shouldAutoPlay: boolean = true,
    signal?: AbortSignal,
  ) {
    this.midiPlayer.suspend();
    this.setState({ transpose: 0, firstTonic: null });

    const inputArray =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

    const uint8Array = transformMidi(inputArray);

    this.hash = md5(uint8Array);

    this.midiPlayer.setTempo(1);

    this.setState({
      // @ts-ignore
      currentMidiBuffer: buffer instanceof ArrayBuffer ? buffer : buffer.buffer,
      paused: !shouldAutoPlay,
    });

    // Apply saved Lakh exclusions before playback can emit any notes.
    const lakhAnalysisKey = this.state.currentMidi?.analysisKey;
    const isLakh = lakhAnalysisKey?.startsWith("c/MIDI/");
    try {
      const parsingResult = await this.midiPlayer.loadData(
        uint8Array,
        filepath,
        shouldAutoPlay,
        getExcludedVoices(
          isLakh ? this.state.analyses[lakhAnalysisKey] : undefined,
          MAX_VOICES,
        ),
        getDrumVoices(
          isLakh ? this.state.analyses[lakhAnalysisKey] : undefined,
          MAX_VOICES,
        ),
      );

      if (signal?.aborted) return;
      const numVoices = this.midiPlayer.getNumVoices();
      const excludedVoices = new Set(
        getExcludedVoices(
          isLakh ? this.state.analyses[lakhAnalysisKey] : undefined,
          numVoices,
        ),
      );
      const voiceMask = Array.from(
        { length: numVoices },
        (_, index) => !excludedVoices.has(index),
      );
      this.hoveredVoiceIndex = null;
      this.midiPlayer.setVoiceMask(voiceMask);
      // Render the new score and its manual selection together so hover effects
      // cannot send the previous song's mask (or the initial 64-voice mask).
      this.setState({ parsing: parsingResult, voiceMask }, () => {
        this.setupMidiPlayer();

        if (!shouldAutoPlay) {
          this.midiPlayer.pause();
        }
      });
    } catch (e) {
      this.handlePlayerError(`Unable to play ${filepath} (${e.message}).`);
      if (signal) throw e;
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

  getPlaybackTime = () =>
    this.midiPlayer?.isPlaying() ? this.midiPlayer.getPositionMs() / 1000 : null;

  componentWillUnmount() {
    this.pendingMidiPlayer?.dispose();
    this.pendingMidiPlayer = null;
    this.midiPlayer?.dispose();
  }

  eject = () => {
    if (this.midiPlayer) {
      this.midiPlayer.eject();
      this.handleSequencerStateUpdate({ isEjected: true });
      // Reset tempo to 1.0 when ejecting
      this.midiPlayer.setTempo(1.0);
      this.setState({ tempo: 1.0 });
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
    const rawlProps: RawlProps = {
      parsingResult: this.state.parsing,
      getCurrentPositionMs: this.midiPlayer?.getPositionMs,
      savedAnalysis: this.state.analyses[this.path] ?? null,
      saveAnalysis: this.saveAnalysis,
      voiceNames: this.state.voiceNames,
      voiceMask: this.state.voiceMask,
      setVoiceMask: this.handleSetVoiceMask,
      onVoiceHover: this.handleVoiceHover,
      onForcedPanningChange: this.handleForcedPanningChange,
      setDrumVoices: this.handleSetDrumVoices,
      enableManualRemeasuring: this.state.enableManualRemeasuring,
      seek: this.seekForRawl,
      latencyCorrectionMs: 0,
      sourceUrl: this.state.currentMidi?.sourceUrl || null,
    };

    const rawlRoute = (
      <Route
        path={["/f/:slug*", "/c/:chiptuneUrl*", "/drop"]}
        render={({ match }) => {
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
              latencyCorrectionMs={0}
            />
          );
        }}
      />
    );

    // Combined render for all routes
    return (
      <PlaybackTimeProvider getTime={this.getPlaybackTime}>
        <AppContext.Provider
          value={{
            handleSongClick: this.handleSongClick,
            rawlProps: this.state.rawlProps,
            setRawlProps: (rawlProps) => this.setState({ rawlProps }),
            analyses: this.state.analyses,
            saveAnalysis: this.saveAnalysis,
            getFirebaseAnnotation: this.getFirebaseAnnotation,
            saveFirebaseAnnotation: this.saveFirebaseAnnotation,
            deleteFirebaseAnnotation: this.deleteFirebaseAnnotation,
            resetMidiPlayerState: this.resetMidiPlayerState,
            registerKeyboardHandler: this.registerKeyboardHandler,
            unregisterKeyboardHandler: this.unregisterKeyboardHandler,
            currentMidi: this.state.currentMidi,
            setCurrentMidi: (currentMidi) => this.setState({ currentMidi }),
            user: this.state.user,
            seek: this.seekForRawl,
            eject: this.eject,
            currentMidiBuffer: this.state.currentMidiBuffer,
            hoveredMeasuresSpan: this.state.hoveredMeasuresSpan,
            setHoveredMeasuresSpan: (span) =>
              this.setState({ hoveredMeasuresSpan: span }),
            togglePause: this.togglePause,
            handleLogin: this.handleLogin,
            handleLogout: this.handleLogout,
            handleToggleManualRemeasuring: this.handleToggleManualRemeasuring,
            enableManualRemeasuring: this.state.enableManualRemeasuring,
            playSongBuffer: this.playSongBuffer,
            latencyCorrectionMs: 0,
            tempo: this.state.tempo,
            transpose: this.state.transpose,
            setFirstTonic: this.setFirstTonic,
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
                      <StyledButton onClick={this.handleUnlockAudioContext}>
                        Play
                      </StyledButton>
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
                          <Pieces />
                        )
                      }
                    />
                    <Route exact path="/e" component={EditorLandingPage} />
                    <Route path="/e/:slug?" component={Editor} />
                    <Route path="/ef/:id/:version?" component={Editor} />
                    <Route path="/book/:slug?" component={BookOnStyles} />
                    <Route path="/blog/:postId?/:slug?" component={Blog} />
                    <Route path="/convert" component={Converter} />
                    {/* Structures routes */}
                    <Route
                      path="/s/"
                      exact
                      render={() => <Structures analyses={this.state.analyses} />}
                    />
                    <Route
                      path="/s/:rest*"
                      render={() => (
                        <StructuresWithParams analyses={this.state.analyses} />
                      )}
                    />
                    <Route
                      path={["/lakh", "/c/MIDI"]}
                      render={() => (
                        <Lakh
                          ready={!this.state.loading}
                          loadTrack={this.loadLakhTrack}
                        />
                      )}
                    />
                    {rawlRoute}
                    <Redirect
                      exact
                      from="/d/"
                      to={`/d/${Object.keys(decomposeScores)[0]}/1`}
                    />
                    {decompositionRoute}
                    <Route path="/100/:slug?" component={Book} />
                    <Route path="/beyond/:slug?" component={Book} />
                    <Redirect from="/timeline" to="/corpus/" />
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
                  getCurrentPositionMs={this.midiPlayer?.getPositionMs}
                  tempo={this.state.tempo}
                  setTempo={this.handleTempoChange}
                  transpose={this.state.transpose}
                  setTranspose={this.handleTransposeChange}
                  firstTonic={this.state.firstTonic}
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
      </PlaybackTimeProvider>
    );
  }
}

// Update the StructuresWithParams component to parse the URL manually
const StructuresWithParams: React.FC<StructuresProps> = ({ analyses }) => {
  const location = useLocation();
  const path = location.pathname.slice(3); // Remove '/s/' prefix

  // Find the first slash after the chapter
  const firstSlashIndex = path.indexOf("/");

  // Extract chapter and topic
  const chapter = firstSlashIndex > -1 ? path.slice(0, firstSlashIndex) : path;
  const topic =
    firstSlashIndex > -1 ? path.slice(firstSlashIndex + 1) : undefined;

  return (
    <Structures
      analyses={analyses}
      initialChapter={decodeURIComponent(chapter)}
      initialTopic={topic ? decodeURIComponent(topic) : undefined}
    />
  );
};

export default withRouter(App);
