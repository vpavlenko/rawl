import * as React from 'react';
import { useMemo } from 'react';
import { NES_APU_NOTE_ESTIMATIONS, nesApuNoteEstimation } from './nesApuNoteEstimations';

export const RESOLUTION_DUMPS_PER_SECOND = 100;

type OscType = 'pulse' | 'triangle';

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

    const pulse1Notes: Note[] = [];
    let timeMs = 0;
    const stepMs = 1 / RESOLUTION_DUMPS_PER_SECOND;

    for (const period of periods) {
        const newNoteEstimation = findNoteWithClosestPeriod(period, oscType) // What if it's 0?
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
                chipState: { period: period }
            })
        }

        timeMs += stepMs;
    }
    if (pulse1Notes.length > 0) {
        pulse1Notes[pulse1Notes.length - 1].span[1] = timeMs;
    }

    return pulse1Notes;
}

const NOTE_HEIGHT = 7
const msToX = ms => ms * 70
const midiNumberToY = midiNumber => 600 - (midiNumber - 21) * NOTE_HEIGHT

const getNoteRectangles = (notes, color) => {
    return notes.map(note => <div style={{
        position: 'absolute',
        height: `${NOTE_HEIGHT}px`,
        width: msToX(note.span[1]) - msToX(note.span[0]),
        color: 'white',
        backgroundColor: color,
        top: midiNumberToY(note.note.midiNumber),
        left: msToX(note.span[0]),
    }}><div style={{
        position: 'relative',
        top: '-10px',
        fontSize: '12px',
        lineHeight: '12px',
        fontFamily: 'Helvetica, sans-serif'
        }}>{note.note.name.slice(0, -1)}</div></div>)
}

const Chiptheory = ({ chipStateDump }) => {
    console.log('Chiptheory rerender');

    const notes = useMemo(() => {
        return {
            p1: calculateNotesFromPeriods(chipStateDump.p1, 'pulse'),
            p2: calculateNotesFromPeriods(chipStateDump.p2, 'pulse'),
            t: calculateNotesFromPeriods(chipStateDump.t, 'triangle') // TODO should be one octave lower and use trianglePeriod
        }
    }, [chipStateDump]);

    const noteRectangles = useMemo(() => {
        return [...getNoteRectangles(notes.p1, 'red'), ...getNoteRectangles(notes.p2, 'green'), ...getNoteRectangles(notes.t, 'blue')]
    }, [notes])


    return <div style={{ width: '96%', height: '100%', marginTop: '1em', padding: '1em', backgroundColor: 'black' }}>
        <div style={{ position: 'relative', overflowX: 'scroll', width: '100%', height: '600px', backgroundColor: 'gray' }}>{noteRectangles}</div>
        <div>Add a tag:{" "}
            <input type="text" />
        </div>
        <div>notes: {JSON.stringify(notes)}</div>
    </div>
}

export default Chiptheory;