import * as Tone from "tone";

// Add type definitions for our custom method
declare module "tone/build/esm/core/context/BaseContext" {
  interface BaseContext {
    addAudioWorklet: () => Promise<void>;
  }
}

export const ARPEGGIO_DELAY_MS = 70;
let samplerLoaded = false;
let loadingPromise: Promise<void> | null = null;

const BASE_URL = "https://tonejs.github.io/audio/salamander/";

export const sampler = new Tone.Sampler({
  urls: {
    A0: "A0.mp3",
    C1: "C1.mp3",
    "D#1": "Ds1.mp3",
    "F#1": "Fs1.mp3",
    A1: "A1.mp3",
    C2: "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
    A2: "A2.mp3",
    C3: "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    A3: "A3.mp3",
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
    C5: "C5.mp3",
    "D#5": "Ds5.mp3",
    "F#5": "Fs5.mp3",
    A5: "A5.mp3",
    C6: "C6.mp3",
    "D#6": "Ds6.mp3",
    "F#6": "Fs6.mp3",
    A6: "A6.mp3",
    C7: "C7.mp3",
    "D#7": "Ds7.mp3",
    "F#7": "Fs7.mp3",
    A7: "A7.mp3",
    C8: "C8.mp3",
  },
  baseUrl: BASE_URL,
  onload: () => {
    console.log("Sampler loaded");
    console.log("Audio Context State:", Tone.getContext().state);
    samplerLoaded = true;
  },
})
  .toDestination()
  .set({
    volume: -6,
  });

// Enable Audio Worklet processing
Tone.getContext().addAudioWorklet = async () => {
  const context = Tone.getContext().rawContext;
  if (context.audioWorklet) {
    try {
      await context.audioWorklet.addModule(
        `data:text/javascript;charset=utf-8,
        class ToneProcessor extends AudioWorkletProcessor {
          process(inputs, outputs) {
            // Pass audio through
            const output = outputs[0];
            const input = inputs[0];
            for (let channel = 0; channel < output.length; ++channel) {
              const inputChannel = input[channel];
              const outputChannel = output[channel];
              for (let i = 0; i < outputChannel.length; ++i) {
                outputChannel[i] = inputChannel ? inputChannel[i] : 0;
              }
            }
            return true;
          }
        }
        registerProcessor('tone-processor', ToneProcessor);`,
      );

      const workletNode = new AudioWorkletNode(context, "tone-processor");
      sampler.connect(workletNode);
      workletNode.connect(context.destination);
      console.log("Audio Worklet enabled successfully");
    } catch (error) {
      console.error("Failed to add Audio Worklet:", error);
    }
  }
};

const originalTriggerAttack = sampler.triggerAttack;
sampler.triggerAttack = function (...args) {
  console.log("Audio Context State:", Tone.getContext().state);
  return originalTriggerAttack.apply(this, args);
};

const originalTriggerRelease = sampler.triggerRelease;
sampler.triggerRelease = function (...args) {
  console.log("Audio Context State:", Tone.getContext().state);
  return originalTriggerRelease.apply(this, args);
};

export const getAudioContextState = () => {
  return Tone.getContext().state;
};

export const startAudioContext = async () => {
  try {
    await Tone.start();
    await Tone.getContext().addAudioWorklet();
    console.log("Audio context started successfully with Audio Worklet");
    return true;
  } catch (error) {
    console.error("Failed to start audio context:", error);
    throw error;
  }
};

export const ensureSamplerLoaded = async () => {
  if (samplerLoaded) {
    return;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve) => {
    if (sampler.loaded) {
      console.log("Sampler already loaded");
      samplerLoaded = true;
      resolve();
      return;
    }

    const checkLoaded = () => {
      if (sampler.loaded) {
        console.log("Sampler loaded successfully");
        samplerLoaded = true;
        resolve();
      } else {
        setTimeout(checkLoaded, 100);
      }
    };

    checkLoaded();
  });

  await loadingPromise;
  console.log("Sampler loaded, audio context state:", getAudioContextState());
};

export const resumeAudioContext = async () => {
  await Tone.start();
  console.log("resuming audio context");
};

const C3_MIDI_NUMBER = 48;

let activeEvents: number[] = [];
let activeNotes: string[] = [];

export const playArpeggiatedChord = async (chordNumbers: number[]) => {
  await ensureSamplerLoaded();

  // 1. Stop all currently playing sounds immediately
  sampler.releaseAll(0);

  // 2. Clear all scheduled events
  activeEvents.forEach((id) => Tone.Transport.clear(id));
  Tone.Transport.cancel();

  // 3. Reset our tracking arrays
  activeEvents = [];
  activeNotes = [];

  // 4. Convert to MIDI notes starting from C3
  const midiNotes = chordNumbers.map((note) => C3_MIDI_NUMBER + note);
  const noteNames = midiNotes.map((midi) =>
    Tone.Frequency(midi, "midi").toNote(),
  );

  // 5. Ensure Transport is started
  if (Tone.Transport.state !== "started") {
    Tone.Transport.start();
  }

  // 6. Schedule notes using Transport time
  const currentTransportTime = Tone.Transport.seconds;

  noteNames.forEach((note, index) => {
    const scheduleTime =
      currentTransportTime + (index * ARPEGGIO_DELAY_MS) / 1000;

    const eventId = Tone.Transport.schedule((time) => {
      activeNotes.push(note);
      sampler.triggerAttackRelease(note, 0.5, time);
    }, scheduleTime);

    activeEvents.push(eventId);
  });
};

// Add new function for playing raw MIDI notes
export const playRawMidiNote = async (midiNumber: number, duration: number) => {
  await ensureSamplerLoaded();

  sampler.releaseAll(0);
  activeEvents.forEach((id) => Tone.Transport.clear(id));
  Tone.Transport.cancel();

  activeEvents = [];
  activeNotes = [];

  const noteName = Tone.Frequency(midiNumber, "midi").toNote();

  if (Tone.Transport.state !== "started") {
    Tone.Transport.start();
  }

  const eventId = Tone.Transport.schedule((time) => {
    activeNotes.push(noteName);
    sampler.triggerAttackRelease(noteName, duration / 1000, time);
  }, Tone.Transport.seconds);

  activeEvents.push(eventId);
};

// Add a cleanup function that can be called when needed (e.g., component unmount)
export const cleanupArpeggiator = () => {
  sampler.releaseAll(0);
  activeEvents.forEach((id) => Tone.Transport.clear(id));
  Tone.Transport.cancel();
  activeEvents = [];
  activeNotes = [];
};

export const playArpeggiatedChordSequence = async (
  chordSequence: number[][],
  onChordStart?: (index: number) => void,
  onChordEnd?: (index: number) => void,
) => {
  await ensureSamplerLoaded();

  // Clear any existing events
  Tone.Transport.cancel();
  sampler.releaseAll(0);
  activeEvents = [];
  activeNotes = [];

  // Ensure transport is started
  if (Tone.Transport.state !== "started") {
    Tone.Transport.start();
  }

  const currentTime = Tone.Transport.seconds;
  const CHORD_SPACING = 0.7; // 700ms between chords

  chordSequence.forEach((chord, chordIndex) => {
    // Schedule each note in the chord
    chord.forEach((note, noteIndex) => {
      const noteTime =
        currentTime +
        chordIndex * CHORD_SPACING + // Delay for each chord
        (noteIndex * ARPEGGIO_DELAY_MS) / 1000; // Arpeggio delay within chord

      const eventId = Tone.Transport.schedule((time) => {
        sampler.triggerAttackRelease(
          Tone.Frequency(note + C3_MIDI_NUMBER, "midi").toNote(),
          0.7,
          time,
        );

        // Call onChordStart only for the first note of each chord
        if (noteIndex === 0 && onChordStart) {
          onChordStart(chordIndex);
        }

        // Schedule chord end callback after last note
        if (noteIndex === chord.length - 1 && onChordEnd) {
          Tone.Transport.schedule(() => {
            onChordEnd(chordIndex);
          }, time + 0.7); // 600ms animation duration
        }
      }, noteTime);

      activeEvents.push(eventId);
    });
  });
};
