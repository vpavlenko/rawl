interface Citation {
  bibtex: string;
  pages?: string[];
}

export const CITES: Record<string, Citation> = {
  rings_tuning: {
    bibtex: `@book{book:2550186,
   title =     {The Oxford handbook of critical concepts in music theory},
   editor =    {Steven Rings and Alexander Rehding},
   publisher = {},
   isbn =      {9780190454746,0190454741},
   year =      {2019},
   series =    {},
   edition =   {},
   volume =    {},
   url = {https://annas-archive.org/md5/e157064be938ddab29b4aab7633dd0a5}
}`,
    pages: [`16-20`],
  },
  alf_aeolian: {
    bibtex: `@misc{bjornberg1984aeolian,
  author = {Alf Björnberg},
  title = {On Aeolian Harmony in Contemporary Popular Music},
  year = {1984},
  note = {Scanned from typescript presented in conjunction with research seminar at the Department of Musicology, University of Göteborg, 1984. An extended Swedish version of this text appeared as "There’s Something Going On — Om Eolisk Harmonik i Rockmusik" in Tvärspel, pp. 371-386 (Göteborg, 1984). An English-language version of the text was published in 1989 as Nordic IASPM Working Paper DK, 1. The Italian version "Armonia Eolia nella 'Popular Music' Contemporanea" appeared in Musica/Realtà 46, pp. 41-50 (1995). Minor editorial comments by Philip Tagg (October 2001).},
  howpublished = {Research Seminar, Department of Musicology, University of Göteborg},
  url = {https://www.tagg.org/xpdfs/bjbgeol.pdf}
}
`,
  },
} as const;
