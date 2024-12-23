interface Citation {
  bibtex: string;
  where?: string;
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
    where: "pp. 16-20",
  },
  alf_aeolian: {
    bibtex: `@misc{bjornberg1984aeolian,
  author = {Alf Björnberg},
  title = {On Aeolian Harmony in Contemporary Popular Music},
  year = {1984},
  url = {https://www.tagg.org/xpdfs/bjbgeol.pdf}
}
`,
  },
  tagg_loops: {
    bibtex: `@book{tagg2017everyday,
  title ={Everyday Tonality II: Towards a Tonal Theory of what Most People Hear},
  author={Tagg, Philip},
  year={2017},
  publisher={Mass Media Music Scholars' Press},
  url={https://hugoribeiro.com.br/area-restrita/Tagg-Everyday_tonality.pdf}
}
`,
    where: "ch. 13",
  },
  nobile: {
    bibtex: `@book{book:2586637,
   title =     {Form as Harmony in Rock Music (Oxford Studies in Music Theory)},
   author =    {Drew Nobile},
   publisher = {},
   isbn =      {2020932174,9780190948368,9780190948351},
   year =      {2020},
   series =    {},
   edition =   {},
   volume =    {},
   url =       {https://annas-archive.org/md5/8e6e4c92afc8e11ac3ff486582c5d0c4}
}
`,
  },
  richards: {
    bibtex: `@article{richards2017tonal,
  title={Tonal Ambiguity in Popular Music’s Axis Progressions},
  author={Richards, Mark},
  journal={Music Theory Online},
  volume={23},
  number={3},
  year={2017},
  publisher={Society for Music Theory},
  url={https://mtosmt.org/issues/mto.17.23.3/mto.17.23.3.richards.html}
}
`,
  },
} as const;
