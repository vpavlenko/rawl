import * as React from 'react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { NES_APU_NOTE_ESTIMATIONS, PAUSE, nesApuNoteEstimation } from './nesApuNoteEstimations';
import { AnalysisGrid, Cursor, STEP_CALL_TO_ACTION, Step, advanceAnalysis, getSavedAnalysis } from './Analysis';

export const RESOLUTION_DUMPS_PER_SECOND = 100;
export const RESOLUTION_MS = 1 / RESOLUTION_DUMPS_PER_SECOND;

type OscType = 'pulse' | 'triangle' | 'noise';


function findNoteWithClosestPeriod(period: number, oscType: OscType): nesApuNoteEstimation {
    if (period === -1) {
        return PAUSE
    }
    if (oscType === 'noise') {
        const noise = period % 10;
        return {
            "name": `${noise}_`,  // pause
            "midiNumber": noise + 90,
            "frequency": 0,
            "pianoNumber": null,
            "apuIndex": null,
            "pulsePeriod": null,
            "pulseFrequency": null,
            "pulseTuningError": null,
            "trianglePeriod": null,
            "triangleFrequency": null,
            "triangleTuningError": null
        }
    }
    let closestNote: nesApuNoteEstimation | null = null;
    let smallestDifference = Infinity;

    for (const note of NES_APU_NOTE_ESTIMATIONS) {
        const currentPeriod = (oscType === 'pulse' ? Number(note.pulsePeriod) : Number(note.trianglePeriod));
        if (currentPeriod == null) continue;

        const diff = Math.abs(period - currentPeriod);

        if (diff < smallestDifference) {
            smallestDifference = diff;
            closestNote = note;
        }
    }

    return closestNote!;
}

export type Note = {
    note: {
        midiNumber: number,
        name: string,
    },
    span: [number, number],
    chipState: any,
}

const calculateNotesFromPeriods = (periods, oscType) => {
    if (periods === undefined)
        return [];

    const notes: Note[] = [];
    let timeInSeconds = 0;
    const stepInSeconds = RESOLUTION_MS;

    for (const period of periods) {
        const newNoteEstimation =
            findNoteWithClosestPeriod(period, oscType)
        const lastNote = notes[notes.length - 1]
        if (notes.length === 0 || lastNote.note.midiNumber !== newNoteEstimation.midiNumber) {
            if (notes.length > 0) {
                lastNote.span[1] = timeInSeconds;
            }
            notes.push({
                note: {
                    midiNumber: period === -1 ? -1 : newNoteEstimation.midiNumber,
                    name: newNoteEstimation.name,
                },
                span: [timeInSeconds, 0],
                chipState: { period: period }
            })
        }

        timeInSeconds += stepInSeconds;
    }
    if (notes.length > 0) {
        notes[notes.length - 1].span[1] = timeInSeconds;
    }

    return notes.filter(note => note.note.midiNumber !== -1);
}

const NOTE_HEIGHT = 7
export const secondsToX = seconds => seconds * 70
const midiNumberToY = midiNumber => 600 - (midiNumber - 20) * NOTE_HEIGHT
const isNoteCurrentlyPlayed = (note, positionMs) => {
    const positionSeconds = positionMs / 1000;
    return (note.span[0] <= positionSeconds) && (positionSeconds <= note.span[1])
}

const getNoteRectangles = (notes, color, handleNoteClick = note => { }) => {
    return notes.map(note => {
        const top = midiNumberToY(note.note.midiNumber) + { 'red': 1, 'green': -1, 'blue': 0, 'white': 0, 'black': 0 }[color];
        const left = secondsToX(note.span[0]);
        return <div
            style={{
                position: 'absolute',
                height: `${NOTE_HEIGHT}px`,
                width: secondsToX(note.span[1]) - secondsToX(note.span[0]),
                color: color === 'white' ? 'black' : 'white',
                backgroundColor: color,
                top,
                left,
                cursor: 'pointer',
            }}
            onClick={() => handleNoteClick(note)}
        ><div style={{
            position: 'relative',
            top: color === 'black' ? '-8px' : '0px',
            left: '1px',
            fontSize: '8px',
            lineHeight: '8px',
            fontFamily: 'Helvetica, sans-serif'
        }}>{note.note.name.slice(0, -1)}</div></div>
    })
}

const findCurrentlyPlayedNotes = (notes, positionMs) => {
    const result = [];
    for (const note of notes) {
        if (isNoteCurrentlyPlayed(note, positionMs)) {
            result.push(note)
        }
    }
    return result
}

const Chiptheory = ({ chipStateDump, getCurrentPositionMs }) => {
    const [analysis, setAnalysis] = useState(getSavedAnalysis());

    useEffect(() => {
        // If chipStateDump changed, that means we're playing a new subtune, and a previous analysis isn't valid.
        setAnalysis(getSavedAnalysis())
    }, [chipStateDump]);

    const analysisRef = useRef(analysis);
    useEffect(() => {
        analysisRef.current = analysis;
    }, [analysis]);

    // Without the ref magic, this will only capture the initial analysis.
    const handleNoteClick = (note) => advanceAnalysis(note, analysisRef.current, setAnalysis)

    const notes = useMemo(() => {
        return {
            p1: calculateNotesFromPeriods(chipStateDump.p1, 'pulse',),
            p2: calculateNotesFromPeriods(chipStateDump.p2, 'pulse',),
            t: calculateNotesFromPeriods(chipStateDump.t, 'triangle',),
            n: calculateNotesFromPeriods(chipStateDump.n, 'noise',)
        }
    }, [chipStateDump]);
    const allNotes = useMemo(() => [...notes.t, ...notes.n, ...notes.p1, ...notes.p2,], [chipStateDump]);

    const noteRectangles = useMemo(() => {
        return [...getNoteRectangles(notes.p1, 'red', handleNoteClick),
        ...getNoteRectangles(notes.p2, 'green', handleNoteClick),
        ...getNoteRectangles(notes.t, 'blue', handleNoteClick),
        ...getNoteRectangles(notes.n, 'black', handleNoteClick)]
    }, [notes])

    const [positionMs, setPositionMs] = useState(0);
    const currentlyPlayedRectangles = getNoteRectangles(findCurrentlyPlayedNotes(allNotes, positionMs), 'white')

    useEffect(() => {
        let running = true;

        const animate = () => {
            if (!running) {
                return;
            }

            setPositionMs(getCurrentPositionMs() - 70)  // A dirty hack, I don't know why it gets ahead of playback.
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            running = false;
        };
    }, []);

    return <div style={{ width: '96%', height: '100%', marginTop: '1em', padding: '1em', backgroundColor: 'black' }}>
        <div style={{
            position: 'relative', overflowX: 'scroll', overflowY: 'hidden', height: '100%', backgroundColor: 'gray',
        }}>
            {noteRectangles}
            {currentlyPlayedRectangles}
            <Cursor style={{ left: secondsToX(positionMs / 1000) }} />
            <AnalysisGrid analysis={analysis} allNotes={allNotes} />
        </div>
        <div>Analyze track in several clicks. {STEP_CALL_TO_ACTION[analysis.step]}</div>
    </div>
}

export default Chiptheory;