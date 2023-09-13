import * as React from 'react';
import { useMemo } from 'react';
import { NES_APU_NOTE_ESTIMATIONS, nesApuNoteEstimation } from './nesApuNoteEstimations';

export const RESOLUTION_DUMPS_PER_SECOND = 100;

function findNoteWithClosestPulsePeriod(period: number): nesApuNoteEstimation {
    let closestNote: nesApuNoteEstimation | null = null;
    let smallestDifference = Infinity;

    for (const note of NES_APU_NOTE_ESTIMATIONS) {
        const pulseDiff = Math.abs(period - Number(note.pulsePeriod));

        if (pulseDiff < smallestDifference) {
            smallestDifference = pulseDiff;
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

const calculateNotesFromPeriods = periods => {
    if (periods === undefined)
        return [];

    const pulse1Notes: Note[] = [];
    let timeMs = 0;
    const stepMs = 1 / RESOLUTION_DUMPS_PER_SECOND;

    for (const pulse1Period of periods) {
        const newNoteEstimation = findNoteWithClosestPulsePeriod(pulse1Period) // What if it's 0?
        const lastNote = pulse1Notes[pulse1Notes.length - 1]
        if (pulse1Notes.length === 0 || lastNote.note.midiNumber !== newNoteEstimation.midiNumber) {
            if (pulse1Notes.length > 0) {
                lastNote.span[1] = timeMs;
            }
            pulse1Notes.push({
                note: {
                    midiNumber: newNoteEstimation.midiNumber,
                    name: newNoteEstimation.name
                },
                span: [timeMs, 0],
                chipState: { period: pulse1Period }
            })
        }

        timeMs += stepMs;
    }
    if (pulse1Notes.length > 0) {
        pulse1Notes[pulse1Notes.length - 1].span[1] = timeMs;
    }

    return pulse1Notes;
}

const msToX = ms => ms * 100
const midiNumberToY = midiNumber => 800 - (midiNumber - 33) * 10

const getNoteRectangles = (notes, color) => {
    return notes.map(note => <div style={{
        position: 'absolute',
        height: '10px',
        width: msToX(note.span[1]) - msToX(note.span[0]),
        color: 'white',
        backgroundColor: color,
        top: midiNumberToY(note.note.midiNumber),
        left: msToX(note.span[0]),
        fontSize: '16px',
        lineHeight: '16px',
        fontFamily: 'Helvetica, sans-serif'
    }}>{note.note.name.slice(0, -1)}</div>)
}

const Chiptheory = ({ chipStateDump }) => {
    console.log('Chiptheory rerender');

    const notes = useMemo(() => {
        return { p1: calculateNotesFromPeriods(chipStateDump.p1), p2: calculateNotesFromPeriods(chipStateDump.p2) }
    }, [chipStateDump]);

    const noteRectangles = useMemo(() => {
        return [...getNoteRectangles(notes.p1, 'red'), ...getNoteRectangles(notes.p2, 'green')]
    }, [notes])


    return <div style={{ width: '96%', height: '100%', marginTop: '1em', padding: '1em', backgroundColor: 'black' }}>
        <h1>Chiptheory</h1>
        <div>Add a tag:{" "}
            <input type="text" />
        </div>
        <div>chipStateDump: {JSON.stringify(chipStateDump)}</div>
        <div style={{ position: 'relative', overflowX: 'scroll', width: '100%', height: '600px', backgroundColor: 'gray' }}>{noteRectangles}</div>
        <div>notes: {JSON.stringify(notes)}</div>

    </div>
}

export default Chiptheory;