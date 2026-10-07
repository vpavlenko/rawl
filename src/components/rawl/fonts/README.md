# Harmony accidentals

`RawlHarmonySymbols.woff` contains only Unicode ♭ (U+266D) and ♯ (U+266F),
subset from Steinberg's Bravura Text. Letters and Roman numerals retain the app's
text font. The font family is renamed because Bravura is a Reserved Font Name.

Source revision: `37b194378b710cc40e406ab6c4b07608bb9548ae`.
[Original WOFF](https://github.com/steinbergmedia/bravura/blob/37b194378b710cc40e406ab6c4b07608bb9548ae/redist/woff/BravuraText.woff).
The accompanying `LICENSE.txt` retains the SIL Open Font License 1.1 and original
copyright notice. Subsetting uses `fonttools==4.66.1`:

```sh
python3 scripts/rawl/subset-harmony-font.py /path/to/BravuraText.woff
```
