# Huzzam / Sikah source check

Reviewed the user's local Inside Arabic Music PDF visually at PDF page 423
(printed 388), figure 24.21, and retained figure 24.23 (printed 389) as the
alternate ascending Sikah shoulder. The UI uses the user's spelling Huzzam;
the printed source uses Huzam.

- Primary Huzzam pitches relative to E half-flat: 0, 1.5, 3.5, 4.5, 7.5, 8.5, 10.5, 12.
- Primary bracket labels retained verbatim: Sikah 1, Hijaz 3, Rast 6.
- Alternate Sikah shoulder, beginning at G: 3.5, 5.5, 7, 8.5, 10.5, 12.
- Alternate bracket labels retained verbatim: Upper Rast 3/6, Rast 6.
- Shared root jins and lower auxiliaries remain from figure 14.18 (printed 223).
- New original crops and their source/output hashes are in public/maqam-figures/figures.json.
- Original Sikah crops remain as source evidence; no Sayr diagram is rendered on /maqam.

Extraction command: python3 scripts/rawl/extract-maqam-figures.py /path/to/book.pdf huzzam.

The Huzzam scale crop was visually inspected and is byte-identical to the
independently rendered crop used to transcribe these notes (SHA-256
 d599845b65c7e8a05915689302c52af12515bee3ea59f5906abee3aee49aafbd).
