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
} as const;
