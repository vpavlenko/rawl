import * as React from 'react';
import { NOTE_HEIGHT, Note, RESOLUTION_MS, midiNumberToY, secondsToX } from './Chiptheory';
import styled, { CSSProperties } from 'styled-components';

// Analysis is done in steps.
// The meaning of a click/hover at each step is different.

export const STEPS = ['first measure', 'second measure', 'tonic', 'mode', 'end'] as const
export type Step = typeof STEPS[number]

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7
type PitchClassToScaleDegree = [ScaleDegree | null, ScaleDegree | null, ScaleDegree | null, ScaleDegree | null, ScaleDegree | null, ScaleDegree | null, ScaleDegree | null, ScaleDegree | null, ScaleDegree | null, ScaleDegree | null, ScaleDegree | null, ScaleDegree | null];


// const MODES = [null, 'phrygian', null, 'minor', 'major', 'minor pentatonic', 'blues', null, null, 'dorian', 'mixolydian', null] as const
const MODES = [null, 'phrygian', null, 'minor', 'major', null, null, null, null, 'dorian', 'mixolydian', null] as const
export type Mode = typeof MODES[number]

const RAINBOW_COLORS = ['red', '#cc7700', '#C1C100', 'green', 'blue', '#9400D3', '#FF1493']

// if we have a note, it's color is mapped into degree, then mapped into colors

export type PitchClassToScaleDegreeViaMode = {
    [K in Mode]: K extends string ? PitchClassToScaleDegree : never;
}

const MIDI_NOTE_TO_SCALE_DEGREE: PitchClassToScaleDegreeViaMode = {
    'phrygian': [1, 2, null, 3, null, 4, null, 5, 6, null, 7, null],
    'minor': [1, null, 2, 3, null, 4, null, 5, 6, null, 7, null],
    'dorian': [1, null, 2, 3, null, 4, null, 5, null, 6, 7, null],
    'mixolydian': [1, null, 2, null, 3, 4, null, 5, null, 6, 7, null],
    'major': [1, null, 2, null, 3, 4, null, 5, null, 6, null, 7],
}

export type Analysis = {
    clickResolutionMs: number,
    step: Step,
    firstMeasure: number,
    secondMeasure: number,
    tonic: PitchClass | null,
    mode: Mode
}

// const getGradient = (firstColor, secondColor) => ({
//     background: `repeating-linear-gradient( -45deg, ${firstColor}, ${firstColor} 4px,  ${secondColor} 4px, ${secondColor} 8px)`
// })

export const getTransparencyGradient = (color) => ({
    background: `linear-gradient(to right, ${color} 0px, ${color} 10px, transparent 100%)`
})

export const getNoteColor = (defaultColor: string, midiNumber, analysis): CSSProperties => {
    if (defaultColor === 'white') {
        return {
            // border: '1px solid white',
            boxShadow: 'white 0px 1px 1px 0px',
            boxSizing: 'border-box',
            backgroundColor: 'transparent'
        }
    }
    if (defaultColor === 'black' || analysis.tonic === null || analysis.mode === null) {
        // return { backgroundColor: defaultColor }
        return getTransparencyGradient(defaultColor)
    }

    const mapping = MIDI_NOTE_TO_SCALE_DEGREE[analysis.mode]
    let pointer = (midiNumber - analysis.tonic) % 12
    if (mapping[pointer] === null) {
        // We're in between of two colors. Let's get them
        // while (mapping[pointer] === null) {
        //     pointer--;
        // }
        // let lowerScaleDegree = mapping[pointer] - 1;
        // let upperScaleDegree = (lowerScaleDegree + 1) % 7;
        // return getGradient(RAINBOW_COLORS[lowerScaleDegree], RAINBOW_COLORS[upperScaleDegree])
        return getTransparencyGradient('black')
    }
    // return {
    //     backgroundColor: RAINBOW_COLORS[mapping[pointer] - 1]
    // }
    return getTransparencyGradient(RAINBOW_COLORS[mapping[pointer] - 1])
}

export const getSavedAnalysis: () => Analysis = () => {
    return {
        clickResolutionMs: RESOLUTION_MS,
        step: STEPS[0],
        firstMeasure: null,
        secondMeasure: null,
        tonic: null, // 0..11 in midi notes
        mode: null,
    }
}

export const STEP_CALL_TO_ACTION: Record<Step, string> = {
    'first measure': 'Step 1. Click on a note at the start of the first measure of the main section. Skip the intro',
    'second measure': 'Step 2. Click on a note at the start of the second measure of the main section',
    'tonic': 'Step 3. Click on a tonic of the main section',
    'mode': 'Step 4. Click on a characteristic note of the main section. Minor: b3, major: 3, phrygian: b2, dorian: #6, mixolydian: b7, blues: #4, pentatonic: 4',
    'end': 'Analysis completed, thank you!'
}

export const prevStep = (analysis, setAnalysis) =>
    setAnalysis({ ...analysis, step: STEPS[STEPS.indexOf(analysis.step) - 1] })

export const nextStep = (analysis, setAnalysis) =>
    setAnalysis({ ...analysis, step: STEPS[STEPS.indexOf(analysis.step) + 1] })

// TODO: save analysis

export const advanceAnalysis = (note, analysis, setAnalysis) => {
    const { step } = analysis;
    if (step === 'first measure') {
        setAnalysis({ ...analysis, firstMeasure: note.span[0], step: 'second measure' });
    } else if (step === 'second measure') {
        setAnalysis({ ...analysis, secondMeasure: note.span[0], step: 'tonic' });
    } else if (step === 'tonic') {
        setAnalysis({ ...analysis, tonic: note.note.midiNumber % 12, step: 'mode' });
    } else if (step === 'mode') {
        const mode = MODES[(note.note.midiNumber - analysis.tonic) % 12]
        setAnalysis({ ...analysis, mode, step: 'end' });
    }
}

const VerticalBar = styled.div`
    width: 1px;
    height: 100%;
    position: absolute;
    top: 0;
    z-index: 2;
`;

export const Cursor = styled(VerticalBar)`
    background-color: pink;
`;

const Downbeat = styled(VerticalBar)`
    background-color: black;
`;

const BeatBar = styled(VerticalBar)`
    border-left: 1px dashed darkgrey;
`;

const Measure = ({ second, number }) => {
    const left = secondsToX(second)
    return <>
        <Downbeat style={{
            left
        }} />
        <div style={{ position: 'absolute', top: 10, left: `${left + 5}px`, color: 'black' }} >{number}</div >
    </>
}

const Beat = ({ second }) => <BeatBar style={{ left: secondsToX(second) }} />

const adjustMeasureLength = (second, allNotes) => {
    let closestDiff = Infinity;
    let closestNoteOn = null;
    for (const note of allNotes) {
        const currentDiff = Math.abs(second - note.span[0])
        if (currentDiff < closestDiff) {
            closestNoteOn = note.span[0];
            closestDiff = currentDiff;
        }
    }
    return closestNoteOn;
}

const TonalGrid = ({ tonic }) => {
    if (tonic === null) {
        return [];
    }
    const result = []
    for (let octave = 2; octave <= 7; ++octave) {
        result.push(<div style={{ position: 'absolute', width: '2000px', height: NOTE_HEIGHT, left: 0, top: midiNumberToY(tonic + octave * 12), backgroundColor: '#888', zIndex: 1, }} />)
    }
    return result
}

export const AnalysisGrid: React.FC<{ analysis: Analysis, allNotes: Note[] }> = React.memo(({ analysis, allNotes }) => {
    let measures = [];
    let beats = [];
    console.log('inside grid, analysis', analysis)

    if (analysis.firstMeasure) {
        measures.push(<Measure second={analysis.firstMeasure} number={1} />)
    }
    if (analysis.secondMeasure) {
        // measures.push(<Measure second={analysis.secondMeasure} number={2} />)

        let previousMeasure = analysis.firstMeasure;
        let measureLength = analysis.secondMeasure - analysis.firstMeasure;
        measures.push(<Measure second={previousMeasure} number={1} />)
        for (let i = 2; i < 100; i++) {
            const newMeasure = adjustMeasureLength(previousMeasure + measureLength, allNotes);
            if (previousMeasure === newMeasure) break;
            measures.push(<Measure second={newMeasure} number={i} />)
            beats.push(<Beat second={previousMeasure * 0.75 + newMeasure * 0.25} />)
            beats.push(<Beat second={previousMeasure * 0.5 + newMeasure * 0.5} />)
            beats.push(<Beat second={previousMeasure * 0.25 + newMeasure * 0.75} />)
            // measureLength = newMeasure - previousMeasure // I'm not sure it improves anything
            previousMeasure = newMeasure
        }
    }
    return <>
        {measures}
        {beats}
        {<TonalGrid tonic={analysis.tonic} />}
    </>
});
