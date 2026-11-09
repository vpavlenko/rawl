# VI Kanun, measures 35–39

The main-note inventory is complete: source and exported MIDI each contain 43 heads/attacks across35–39 (7,11,10,7,8). The apparent omissions include a definite ordering error: four successive grace heads in36 and37 are simultaneous chords at one onset. They should ascend C4,D4,E-flat4,F-sharp4 into G4. Source PDF115 shows three beams on the small grace run; there is no glissando/trill shorthand requiring extra invented main notes. The full-size C,D,E-flat,F-sharp pickup at the end of34 is a measured sixteenth run and already correct.

The same small grace run occurs in41(PDF115) and47(PDF116). Source IDs:

- 36:40410,40411,40412,40413; anchored G4:40414.
- 37:40524,40525,40526,40527; anchored G4:40528.
- 41:40556,40557,40558,40559; anchored G4:40560.
- 47:40705,40706,40707,40708; anchored G4:40709.

The two isolated grace ornaments in51(40943,40946) remain unchanged. Source crops are kanun115-top.png/kanun115-bottom.png in the sibling accidental-audit folder and m47-source.png here.

`sequence_kanun_graces(notes, step_quarters=.0625)` in scripts/kanun_graces.py changes only these16 grace heads. It preserves every main onset, pitch, dynamic, and program. At quarter=100 the default is37.5ms per head, a150ms run. This is an explicitly approximate performance choice for unmetered grace notes; .125 can be passed for75ms per head. Reference spectrograms were inspected, but the older full-VI DTW alignment is unreliable after31 and accompaniment prevents confident identification of exact grace spacing. The report does not claim a recording-derived precise value. Main-note fidelity and the sequential grace ordering are certain from the score.

The source instruction at PDF115 x410.28,y400.9 is `(Kanun muss "gut" verstaerktsein)`: the Kanun must be well amplified. The mf glyph70 is at x535.80,y431.64, adjacent to the first main G4 of35. Existing35–38 notes have velocity76, channel volume86, expression100. The special amplification instruction currently produces no separate gain increase.

Actual Rawl packaged WASM was measured holding G4 with GM15(Dulcimer), velocity76, volume86, expression100. Without note-off or any retrigger, BEST SoundFont RMS falls from .01228 in0–.116s to .00244 in.232–.348s and .000847 in.464–.580s (about23dB down). FAST falls .00677→.00378→.00173 over the same windows (about12dB). This natural plucked-envelope decay can contribute to masking against accompaniment. It does not establish missing main notes, and lengthening MIDI key duration does not remove the SoundFont's internal decay. The source-specific amplification instruction supports a modest Kanun gain increase, while preserving the plucked character.

Artifacts: measures35-39.json gives source and literal MIDI attack tables; sequencing-audit.json gives all before/after grace onsets; dulcimer-decay.json gives measured amplitude windows. No shared exporter was changed.
