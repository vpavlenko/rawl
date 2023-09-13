import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { NES_APU_NOTE_ESTIMATIONS, nesApuNoteEstimation } from './nesApuNoteEstimations';

export const RESOLUTION_DUMPS_PER_SECOND = 100;

type OscType = 'pulse' | 'triangle' | 'noise';

function findNoteWithClosestPeriod(period: number, oscType: OscType): nesApuNoteEstimation {
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

type Note = {
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
    const stepInSeconds = 1 / RESOLUTION_DUMPS_PER_SECOND;

    for (const period of periods) {
        const newNoteEstimation = oscType === 'noise' ? { midiNumber: 90 + (period === -1 ? -100 : period % 15), name: `${period}_` } : findNoteWithClosestPeriod(period, oscType)
        const lastNote = notes[notes.length - 1]
        if (notes.length === 0 || lastNote.note.midiNumber !== newNoteEstimation.midiNumber) {
            if (notes.length > 0) {
                lastNote.span[1] = timeInSeconds;
            }
            notes.push({
                note: {
                    midiNumber: newNoteEstimation.midiNumber,
                    name: newNoteEstimation.name
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

    return notes;
}

const NOTE_HEIGHT = 7
const secondsToX = seconds => seconds * 70
const midiNumberToY = midiNumber => 600 - (midiNumber - 20) * NOTE_HEIGHT
const isNoteCurrentlyPlayed = (note, positionMs) => {
    const positionSeconds = positionMs / 1000;
    return (note.span[0] <= positionSeconds) && (positionSeconds <= note.span[1])
}

const getNoteRectangles = (notes, color) => {
    return notes.map(note => <div
        style={{
            position: 'absolute',
            height: `${NOTE_HEIGHT}px`,
            width: secondsToX(note.span[1]) - secondsToX(note.span[0]),
            color: color === 'white' ? 'black' : 'white',
            backgroundColor: color,
            top: midiNumberToY(note.note.midiNumber),
            left: secondsToX(note.span[0]),
        }}><div style={{
            position: 'relative',
            top: color === 'black' ? '-8px' : '0px',
            left: '1px',
            fontSize: '8px',
            lineHeight: '8px',
            fontFamily: 'Helvetica, sans-serif'
        }}>{note.note.name.slice(0, -1)}</div></div>)
}

const findCurrentlyPlayedNotes = (notes, positionMs) => {
    const result = [];
    for (const note of notes) {
        if (isNoteCurrentlyPlayed(note, positionMs)) {
            console.log(note, positionMs)
            result.push(note)
        }
    }
    return result
}

const Chiptheory = ({ chipStateDump, getCurrentPositionMs }) => {
    console.log('Chiptheory rerender');

    const [positionMs, setPositionMs] = useState(0);

    const notes = useMemo(() => {
        return {
            p1: calculateNotesFromPeriods(chipStateDump.p1, 'pulse',),
            p2: calculateNotesFromPeriods(chipStateDump.p2, 'pulse',),
            t: calculateNotesFromPeriods(chipStateDump.t, 'triangle',),
            n: calculateNotesFromPeriods(chipStateDump.n, 'noise',)
        }
    }, [chipStateDump]);

    const noteRectangles = useMemo(() => {
        return [...getNoteRectangles(notes.p1, 'red',),
        ...getNoteRectangles(notes.p2, 'green',),
        ...getNoteRectangles(notes.t, 'blue',),
        ...getNoteRectangles(notes.n, 'black',)]
    }, [notes])

    const currentlyPlayedRectangles = getNoteRectangles(findCurrentlyPlayedNotes([...notes.p1, ...notes.p2, ...notes.t, ...notes.n], positionMs), 'white')

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


    let positionBar = <div style={{ width: '1px', height: '100%', position: 'absolute', top: 0, left: secondsToX(positionMs / 1000), color: 'pink', backgroundColor: 'pink', zIndex: 10000 }} />


    return <div style={{ width: '96%', height: '100%', marginTop: '1em', padding: '1em', backgroundColor: 'black' }}>
        <div style={{
            position: 'relative', overflowX: 'scroll', overflowY: 'hidden', height: '100%', backgroundColor: 'gray'
        }}>{noteRectangles}
            {currentlyPlayedRectangles}
            {positionBar}</div>
        {/* <div>Add a tag:{" "}
            <input type="text" />
        </div> */}
        {/* <div>notes: {JSON.stringify(notes.n)}</div */}
    </div>
}

export default Chiptheory;