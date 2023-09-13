import * as React from 'react';
import { Note, RESOLUTION_MS, secondsToX } from './Chiptheory';
import styled from 'styled-components';

// Analysis is done in steps.
// The meaning of a click/hover at each step is different.

export type Step = 'first measure' | 'second measure' | 'tonic' | 'mode' | 'end'

type Analysis = {
    clickResolutionMs: number,
    firstMeasure: number,
    secondMeasure: number,
    tonic: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11,
}

export const getSavedAnalysis: () => Analysis = () => {
    return {
        clickResolutionMs: RESOLUTION_MS,
        firstMeasure: null,
        secondMeasure: null,
        tonic: null, // 0..11 in midi notes
    }
}

export const STEP_CALL_TO_ACTION: Record<Step, string> = {
    'first measure': 'Step 1. Click on a note at the start of the first measure of the main section. Skip the intro',
    'second measure': 'Step 2. Click on a note at the start of the second measure of the main section',
    'tonic': 'Step 3. Click on a tonic of the main section',
    'mode': 'Step 4. Click on a characteristic note of the main section. Minor: b3, major: 3, phrygian: b2, dorian: #6, mixolydian: b7, blues: #4, pentatonic: 4',
    'end': 'Thank you!'
}

export const advanceAnalysis = (note, analysis, setAnalysis, step, setStep) => {
    console.log('advanceAnalysis', step, analysis)
    if (step === 'first measure') {
        setAnalysis({ ...analysis, firstMeasure: note.span[0] });
        setStep('second measure');
    } else if (step === 'second measure') {
        setAnalysis({ ...analysis, secondMeasure: note.span[0] });
        setStep('tonic');
    } else if (step === 'tonic') {
        setAnalysis({ ...analysis, tonic: note.note.midiNumber });
        setStep('mode');
    }
}

const VerticalBar = styled.div`
    width: 1px;
    height: 100%;
    position: absolute;
    top: 0;
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
        <div style={{ position: 'absolute', top: 20, left: `${left + 5}px` }}>{number}</div>
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
        for (let i = 2; i < 100; i++) {
            const newMeasure = adjustMeasureLength(previousMeasure + measureLength, allNotes);
            measures.push(<Measure second={newMeasure} number={i} />)
            beats.push(<Beat second={previousMeasure * 0.75 + newMeasure * 0.25} />)
            beats.push(<Beat second={previousMeasure * 0.5 + newMeasure * 0.5} />)
            beats.push(<Beat second={previousMeasure * 0.25 + newMeasure * 0.75} />)
            previousMeasure = newMeasure
        }
    }
    return <>
        {measures}
        {beats}
    </>
});
