"""Keep Bravura Text's Unicode accidentals; requires fonttools==4.66.1.

Usage: python3 scripts/rawl/subset-harmony-font.py /path/to/BravuraText.woff
The modified font is renamed to respect Bravura's Reserved Font Name.
"""
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

font = TTFont(sys.argv[1])
options = subset.Options()
options.layout_features = []
options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17]
options.name_legacy = True
options.name_languages = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=[0x266D, 0x266F])
subsetter.subset(font)
names = {
    1: "Rawl Harmony Symbols", 3: "RawlHarmonySymbols-Regular-1",
    4: "Rawl Harmony Symbols Regular", 6: "RawlHarmonySymbols-Regular",
    16: "Rawl Harmony Symbols",
}
for record in font["name"].names:
    if record.nameID in names:
        record.string = names[record.nameID].encode(record.getEncoding())
font.flavor = "woff"
target = Path(__file__).resolve().parents[2] / "src/components/rawl/fonts/RawlHarmonySymbols.woff"
target.parent.mkdir(parents=True, exist_ok=True)
font.save(target)
print(f"Saved {target.stat().st_size} bytes to {target}")
