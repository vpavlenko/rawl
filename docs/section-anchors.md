# Section alignment

Select a section's first measure when the score has multiple sections:

- **Q / W** move left / right through phrase starts in the previous section.
- **A / S** move left / right through phrase starts in the next section.
- Click the **anchor icon** above a neighboring phrase's measure number to align directly.
- Click **Reset** to return the selected section to the left edge.

A missing neighbor or movement past the rightmost phrase does nothing. Moving
left past the first available alignment returns to the left edge. Selection
stays active while anchoring. Anchoring changes only horizontal layout, not
measure times or playback order.

## Annotation format

`sections` retains its existing zero-based global phrase indices. The optional
`sectionAnchors` map uses the same indices for its keys and both values:

```json
{
  "sections": [0, 2, 4],
  "sectionAnchors": {
    "2": { "section": 0, "phrase": 1 }
  }
}
```

This aligns the section beginning at phrase index 2 with phrase index 1 in the
previous section, which begins at index 0. An omitted or empty map leaves all
sections at the left edge. Offsets follow the target section's own alignment and
are recalculated from phrase timing when zoom or timing changes.

The target section must be adjacent and contain the target phrase. Splitting or
merging sections discards anchors that no longer satisfy this rule. If a new
anchor would create a cycle, the target section's outgoing anchor is released.
Invalid anchors and cyclic links in imported annotations are ignored.

Score text uses **one-based** global phrase numbers:

```text
sections 3 5
sectionAnchors 3:1:2
```

Each anchor is `source-section:target-section:target-phrase`. Multiple anchors
are separated by spaces. Score export and import preserve this field.
