// Canonical album sequence: https://www.thebeatles.com/albums
// Track sequences: https://www.beatlesbible.com/albums/
// This is song-level organization, not a claim about the recording used by a MIDI.
// Repeated songs belong to their earliest album here; non-album songs use Past Masters.
const releases = [
  [
    "Please Please Me",
    "1963",
    "I Saw Her Standing There|Misery|Anna (Go to Him)|Chains|Boys|Ask Me Why|Please Please Me|Love Me Do|P. S. I Love You|Baby It's You|Do You Want to Know a Secret|A Taste of Honey|There's a Place|Twist and Shout",
  ],
  [
    "With the Beatles",
    "1963",
    "It Won't Be Long|All I've Got to Do|All My Loving|Don't Bother Me|Little Child|'Til There Was You|Please Mister Postman|Roll Over Beethoven|Hold Me Tight|You Really Got a Hold on Me|I Wanna Be Your Man|Devil in Her Heart|Not a Second Time|Money",
  ],
  [
    "A Hard Day's Night",
    "1964",
    "A Hard Day's Night|I Should Have Known Better|If I Fell|I'm Happy Just to Dance With You|And I Love Her|Tell Me Why|Can't Buy Me Love|Anytime at All|I'll Cry Instead|Things We Said Today|When I Get Home|You Can't Do That|I'll Be Back",
  ],
  [
    "Beatles for Sale",
    "1964",
    "No Reply|I'm a Loser|Baby's in Black|Rock and Roll Music|I'll Follow the Sun|Mr. Moonlight|Kansas City (Lieber-Stoller)|Eight Days a Week|Words of Love|Honey Don't|Every Little Thing|I Don't Want to Spoil the Party|What You're Doing|Everybody's Trying to Be My Baby",
  ],
  [
    "Help!",
    "1965",
    "Help!|The Night Before|You've Got to Hide Your Love Away|I Need You|Another Girl|You're Going to Lose That Girl|Ticket to Ride|Act Naturally|Its Only Love|You Like Me Too Much|Tell Me What You See|I've Just Seen a Face|Yesterday|Dizzy Miss Lizzy",
  ],
  [
    "Rubber Soul",
    "1965",
    "Drive My Car|Norwegian Wood|You Won't See Me|Nowhere Man|Think for Yourself|The Word|Michelle|What Goes On|Girl|I'm Looking Through You|In My Life|Wait|If I Needed Someone|Run for Your Life",
  ],
  [
    "Revolver",
    "1966",
    "Taxman|Eleanor Rigby|I'm Only Sleeping|Love to You|Here, There and Everywhere|Yellow Submarine|She Said She Said|Good Day Sunshine|And Your Bird Can Sing|For No One|Doctor Robert|I Want to Tell You|Got to Get You Into My Life|Tomorrow Never Knows",
  ],
  [
    "Sgt. Pepper's Lonely Hearts Club Band",
    "1967",
    "Sgt. Pepper's Lonely Hearts Club Band|With a Little Help From My Friends|Lucy in the Sky With Diamonds|Getting Better|Fixing a Hole|She's Leaving Home|Being For The Benefit Of Mr. Kite|Within You Without You|When I'm 64|Lovely Rita|Good Morning Good Morning|Sgt. Peppers Lonely Hearts Club Band (reprise)|A Day in the Life|Sgt. Pepper Inner Groove",
  ],
  [
    "Magical Mystery Tour",
    "1967",
    "Magical Mystery Tour|The Fool on the Hill|Flying|Blue Jay Way|Your Mother Should Know|I Am the Walrus|Hello Goodbye|Strawberry Fields Forever|Penny Lane|Baby You're a Rich Man|All You Need Is Love",
  ],
  [
    "The Beatles (White Album)",
    "1968",
    "Back in the U.S.S.R.|Dear Prudence|Glass Onion|Ob-La-Di, Ob-La-Da|Wild Honey Pie|The Continuing Story of Bungalow Bill|While My Guitar Gently Weeps|Happiness Is a Warm Gun|Martha My Dear|I'm So Tired|Blackbird|Piggies|Rocky Raccoon|Don't Pass Me By|Why Don't We Do It in the Road|I Will|Julia|Birthday|Yer Blues|Mother Nature's Son|Everybody's Got Something to Hide Except Me and My Monkey|Sexy Sadie|Helter Skelter|Long, Long, Long|Revolution 1|Honey Pie|Savoy Truffle|Cry Baby Cry|Revolution 9|Good Night",
  ],
  [
    "Yellow Submarine",
    "1969",
    "Yellow Submarine|Only a Northern Song|All Together Now|Hey Bulldog|It's All Too Much|All You Need Is Love",
  ],
  [
    "Abbey Road",
    "1969",
    "Come Together|Something|Maxwell's Silver Hammer|Oh! Darling|Octopus's Garden|I Want You (She's So Heavy)|Here Comes the Sun|Because|You Never Give Me Your Money|Sun King|Mean Mr. Mustard|Polythene Pam|She Came In Through the Bathroom Window|Golden Slumbers|Carry That Weight|The End|Her Majesty",
  ],
  [
    "Let It Be",
    "1970",
    "Two of Us|Dig a Pony|Across the Universe|I Me Mine|Dig It|Let It Be|Maggie Mae|I've Got a Feeling|One After 909|The Long and Winding Road|For You Blue|Get Back",
  ],
  [
    "Past Masters",
    "1988 · non-album singles & EPs",
    "Love Me Do|From Me to You|Thank You Girl|She Loves You|I'll Get You|I Want to Hold Your Hand|This Boy|Komm Gib Mir Deine Hand|Sie Liebt Dich|Long Tall Sally|I Call Your Name|Slow Down|Matchbox|I Feel Fine|She's a Woman|Bad Boy|Yes It Is|I'm Down|Day Tripper|We Can Work It Out|Paperback Writer|Rain|Lady Madonna|The Inner Light|Hey Jude|Revolution|Get Back|Don't Let Me Down|Ballad of John and Yoko|Old Brown Shoe|Across the Universe|Let It Be|You Know My Name (Look Up the Number)",
  ],
  [
    "Live at the BBC",
    "1994 · radio recordings",
    "I Got a Woman|Too Much Monkey Business|Keep Your Hands Off My Baby|I'll Be on My Way|Youngblood|A Shot of Rhythm and Blues|Some Other Guy|Carol|Clarabella|I'm Gonna Sit Right Down and Cry (Over You)|Crying, Waiting, Hoping|The Honeymoon Song|Johnny B. Goode|Memphis, Tennessee|Lucille|Sweet Little Sixteen|Lonesome Tears in My Eyes|Nothin' Shakin'|Hippy Hippy Shake|Glad All Over|I Just Don't Understand|I Forgot to Remember to Forget|I Got to Find My Baby|Don't Ever Change",
  ],
  [
    "Anthology 1",
    "1995 · archival recordings",
    "Free as a Bird|Hallelujah I Love Her So|Cayenne|My Bonnie|Ain't She Sweet|Cry For a Shadow|Searchin|Three Cool Cats|The Sheik of Araby|Like Dreamers Do|Hello Little Girl|Besame Mucho|How Do You Do It|Lend Me Your Comb|Moonlight Bay|You Know What to Do|Leave My Kitten Alone",
  ],
  [
    "Anthology 2",
    "1996 · archival recordings",
    "Real Love|Yes It Is|I'm Down|You've Got to Hide Your Love Away|That Means a Lot|Norweigian Wood (This Bird Has Flown) (take 1)|Being for the Benefit of Mr. Kite! (takes 1 and 2)|Only a Northern Song",
  ],
  [
    "Anthology 3",
    "1996 · archival recordings",
    "A Beginning|Junk|Not Guilty|What's the New Mary Jane?|Step Inside Love   Los Paranoias|All Things Must Pass|Teddy Boy|Medley: Rip It Up   Shake, Rattle and Roll   Blue Suede Shoes|Mailman, Bring Me No Blues|Come and Get It",
  ],
];

const normalize = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]/g, "");
const aliases: Record<string, string> = {
  elenorrigby: "eleanorrigby",
  foolonthehill: "thefoolonthehill",
  mailmanbringmenomoreblues: "mailmanbringmenoblues",
};
const keyFor = (title: string) => aliases[normalize(title)] || normalize(title);
export const beatlesVariantNumber = (file: string) =>
  Number(file.match(/\.(\d+)\.mid$/i)?.[1] || 0);

export function groupBeatlesTracks(files: string[]) {
  const songs = new Map<string, string[]>();
  files.forEach((file) => {
    const key = keyFor(file.replace(/(?:\.\d+)?\.mid$/i, ""));
    songs.set(key, [...(songs.get(key) || []), file]);
  });
  songs.forEach((variants) =>
    variants.sort((a, b) =>
      beatlesVariantNumber(a) - beatlesVariantNumber(b) ||
      a.localeCompare(b, undefined, { numeric: true }),
    ),
  );
  const groups = releases.map(([title, date, titles]) => ({
    title,
    date,
    songs: titles.split("|").flatMap((song, index) => {
      const key = keyFor(song);
      const variants = songs.get(key);
      if (!variants) return [];
      songs.delete(key);
      return [
        {
          number: Number(date.slice(0, 4)) < 1980 ? index + 1 : 0,
          files: variants,
        },
      ];
    }),
  }));
  groups.push({
    title: "Other recordings & medleys",
    date: "Unassigned to an album",
    songs: Array.from(songs.values()).map((variants) => ({
      number: 0,
      files: variants,
    })),
  });
  return groups.filter((group) => group.songs.length);
}
