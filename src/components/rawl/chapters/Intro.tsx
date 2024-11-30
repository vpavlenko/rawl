import * as React from "react";

export const TOP_100_COMPOSERS: {
  slug: string;
  composer: string;
  order?: number;
  chapter?: string;
  chords?: string[];
}[] = [
  { slug: "river-flows-in-you", composer: "Yiruma", order: 200 },
  {
    slug: "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
    composer: "Joe Hisaishi",
    order: 5600,
  },
  { slug: "Canon_in_D", composer: "Pachelbel", order: 1000 },
  {
    slug: "Clair_de_Lune__Debussy",
    composer: "Debussy",
    chapter: "Complicated mix",
  },
  { slug: "Fr_Elise", composer: "Beethoven", order: 2850 },
  { slug: "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major", composer: "Chopin" },
  { slug: "Gymnopdie_No._1__Satie", composer: "Satie", order: 2040 },
  {
    slug: "Undertale_-_Megalovania_Piano_ver._3",
    composer: "Toby Fox",
    order: 2905,
    chapter: "Blues scale",
  },
  {
    slug: "Golden_Hour__JVKE_Updated_Ver.",
    composer: "JVKE",
    order: 2030,
    chapter: "Seventh chords and extensions",
  },
  {
    slug: "Je_Te_Laisserai_Des_Mots_-_Patrick_Watson",
    composer: "Patrick Watson",
    order: 1630,
  },

  { slug: "Hallelujah", composer: "Leonard Cohen", order: 2920 },
  {
    slug: "Interstellar",
    composer: "Hans Zimmer",
    order: 1890,
    chapter: "Minor and major",
  },
  {
    slug: "Another_Love__-_Tom_Odell_Professional",
    composer: "Tom Odell",
    order: 620,
  },
  { slug: "Sweden_Minecraft", composer: "C418", order: 2035 },
  {
    slug: "Pirates_of_the_Caribbean_-_Hes_a_Pirate",
    composer: "Klaus Badelt",
    order: 1600,
  },
  {
    slug: "Game_of_Thrones_Easy_piano",
    composer: "Ramin Djawadi",
    order: 500,
  },
  { slug: "Someone_You_Loved", composer: "Lewis Capaldi", order: 355 },
  {
    slug: "Ed_Sheeran_Perfect",
    composer: "Ed Sheeran",
    order: 300,
    chapter: "A mix of progressions in major",
  },
  { slug: "Liebestraum_No._3_in_A_Major", composer: "Liszt" },
  {
    slug: "Believer_-_Imagine_Dragons",
    composer: "Imagine Dragons",
    order: 1400,
  },

  {
    slug: "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK",
    composer: "John Legend",
    order: 380,
  },
  { slug: "Mad_world_Piano", composer: "Roland Orzabal", order: 250 },
  {
    slug: "mariage-d-amour---paul-de-senneville-marriage-d-amour",
    composer: "Paul de Senneville",
    order: 1800,
  },
  { slug: "Someone_Like_You_easy_piano", composer: "Adele", order: 350 },
  {
    slug: "my-heart-will-go-on",
    composer: "James Horner",
    order: 2910,
    chapter: "Double-tonic",
  },
  {
    slug: "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2",
    composer: "Yugo Kanno",
    order: 2907,
  },
  { slug: "Carol_of_the_Bells", composer: "Mykola Leontovych", order: 1620 },
  {
    slug: "piano-man-piano",
    composer: "Billy Joel",
    order: 2300,
    chapter: "V/V",
  },
  {
    slug: "Fly_Me_to_the_Moon",
    composer: "Bart Howard",
    order: 5300,
    chapter: "ii V I jazz",
  },
  {
    slug: "passacaglia---handel-halvorsen",
    composer: "Handel",
    order: 1650,
    chapter: "Circle of fifths",
  },

  {
    slug: "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",
    composer: "Bach",
  },
  {
    slug: "All_I_Want_for_Christmas_is_You",
    composer: "Mariah Carey",
    order: 2600,
  },
  {
    slug: "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
    composer: "Shostakovich",
    order: 2700,
  },
  {
    slug: "wa-mozart-marche-turque-turkish-march-fingered",
    composer: "Mozart",
    order: 2420,
  },
  { slug: "Viva_La_Vida_Coldplay", composer: "Coldplay", order: 280 },
  { slug: "Gravity_Falls_Opening", composer: "Brad Breeck", order: 1500 },
  {
    slug: "the_entertainer_scott_joplin",
    composer: "Scott Joplin",
    order: 2900,
  },
  {
    slug: "Disney_Pixar_Up_Theme",
    composer: "Michael Giacchino",
    order: 2350,
  },
  {
    slug: "a-thousand-years",
    composer: "Christina Perri",
    order: 900,
    chapter: "Functional major",
  },
  { slug: "John_Lennon_Imagine", composer: "John Lennon", order: 1100 },

  {
    slug: "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
    composer: "Kanye West",
    order: 55,
    chords: ["I", "iii", "IV", "vi"],
  },
  { slug: "Lovely_Billie_Eilish", composer: "Billie Eilish", order: 600 },
  { slug: "Omori_Duet", composer: "Pedro Silva", order: 2450 },
  { slug: "Never_Gonna_Give_You_Up", composer: "Mike Stock", order: 650 },
  {
    slug: "despacito-piano-cover-peter-bence",
    composer: "Luis Fonsi",
    order: 100,
  },
  { slug: "solas---jamie-duffy", composer: "Jamie Duffy", order: 870 },
  { slug: "autumn-leaves-jazz-piano", composer: "Joseph Kosma", order: 5400 },
  {
    slug: "still-dre---variation-composition",
    composer: "Andre Young",
    order: 400,
    chapter: "Natural minor",
  },
  {
    slug: "what-falling-in-love-feels-like---jake25.17-fanmade-extended-version",
    composer: "Jake 25.17",
  },
  { slug: "mii-channel-piano", composer: "Kazumi Totaka" },

  {
    slug: "sadness-and-sorrow-for-piano-solo",
    composer: "Toshio Masuda",
    order: 700,
  },
  {
    slug: "Super_Mario_Bros_Main_Theme",
    composer: "Koji Kondo",
    order: 5200,
  },
  {
    slug: "Cant_Help_Falling_In_Love",
    composer: "Jean-Paul-Égide Martini",
    order: 2490,
  },
  { slug: "g-minor-bach-original", composer: "Luo Ni", order: 1670 },
  {
    slug: "when-i-was-your-man---bruno-mars-600e3a",
    composer: "Bruno Mars",
    order: 4950,
    chapter: "bVII in major",
  },
  {
    slug: "gurenge--demon-slayer-kimetsu-no-yaiba-op",
    composer: "Kayoko Kusano",
    order: 1640,
  },
  { slug: "Let_Her_Go_Passenger", composer: "Passenger", order: 610 },
  {
    slug: "we-are-number-one-but-it-s-a-piano-transcript",
    composer: "Máni Svavarsson",
    order: 1300,
  },
  {
    slug: "dragonborn---skyrim-theme-song-piano-solo",
    composer: "Jeremy Soule",
    order: 850,
  },
  {
    slug: "doki-doki-literature-club-ost---your-reality",
    composer: "Dan Salvato",
    order: 270,
  },

  {
    slug: "ylang-ylang---fkj-transcribed-by-lilroo",
    composer: "FKJ",
    order: 2910,
  },
  {
    slug: "attack-on-titan-theme-guren-no-yumiya",
    composer: "Hiroyuki Sawano",
    order: 1520,
  },
  {
    slug: "Bella_Ciao",
    composer: "Italian folk",
    order: 1450,
    chapter: "Minor with V",
  },
  {
    slug: "minuet-bwv-anhang-114-in-g-major",
    composer: "Christian Petzold",
    order: 2400,
    chapter: "Modulations in classical music",
  },
  { slug: "Take_on_me", composer: "a-ha", order: 5000 },
  { slug: "congratulations---mac-miller", composer: "Mac Miller" },
  {
    slug: "the-office---opening-titles-theme-song-for-piano",
    composer: "Jay Ferguson",
    order: 50,
    chapter: "Single four-chord progression in major",
    chords: ["I", "iii", "IV", "vi"],
  },
  {
    slug: "it-s-been-a-long-long-time---harry-james",
    composer: "Jule Styne",
    order: 5500,
  },
  {
    slug: "Dawn_Pride_and_Prejudice",
    composer: "Dario Marianelli",
    order: 2100,
  },
  {
    slug: "kimi-no-na-wa---sparkle-theishter-2016",
    composer: "Radwimps",
    order: 5100,
  },

  { slug: "Yann_Tiersen_Amelie", composer: "Yann Tiersen", order: 60 },
  { slug: "sia---snowman", composer: "Sia", order: 2470 },
  {
    slug: "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
    composer: "Takahiro Obata",
    order: 1895,
  },
  {
    slug: "theme-from-schindler-s-list---piano-solo",
    composer: "John Williams",
    order: 2430,
  },
  {
    slug: "happy_birthday_bass_and_chords",
    composer: "Patty Smith Hill",
    order: 20,
    chapter: "Intro",
    chords: ["I", "IV", "V"],
  },
  {
    slug: "flight-of-the-bumblebee",
    composer: "Nikolai Rimsky-Korsakov",
    order: 2800,
  },
  {
    slug: "dance-of-the-sugar-plum-fairy",
    composer: "Pyotr Ilyich Tchaikovsky",
  },
  { slug: "dont-stop-believing-piano", composer: "Journey", order: 330 },
  {
    slug: "sign-of-the-times---harry-styles",
    composer: "Harry Styles",
    order: 2050,
    chapter: "V7 in major",
  },
  {
    slug: "Requiem_for_a_Dream",
    composer: "Clint Mansell",
    order: 1200,
    chapter: "bVI V i",
  },

  {
    slug: "yuri-on-ice---piano-theme-full",
    composer: "Taro Umebayashi + Taku Matsushiba",
    order: 2045,
  },
  {
    slug: "ye-niqu-keru-yoru-ni-kakeru---racing-into-the-night",
    composer: "Ayase",
    order: 2600,
  },
  { slug: "africa---toto", composer: "Toto" },
  { slug: "vivaldi---summer---piano", composer: "Vivaldi", order: 1680 },
  {
    slug: "Love_Like_You_Steven_Universe",
    composer: "Steven Universe",
    order: 2650,
  },
  { slug: "alan-walker---alone-piano", composer: "Alan Walker", order: 150 },
  {
    slug: "my-lie-watashi-no-uso---your-lie-in-april",
    composer: "Masaru Yokoyama",
    order: 2497,
  },
  {
    slug: "anastasia---once-upon-a-december",
    composer: "Stephen Flaherty",
    order: 2440,
    chapter: "Other applied chords",
  },
  {
    slug: "Test_Drive_How_to_Train_Your_Dragon",
    composer: "John Powell",
    order: 2380,
  },
  { slug: "Pokemon_Theme_Song", composer: "John Siegler", order: 1645 },

  { slug: "your-song-piano", composer: "Elton John", order: 2495 },
  {
    slug: "nothing-else-matters---metallica",
    composer: "Metallica",
    order: 800,
    chapter: "Dorian IV",
  },
  {
    slug: "calum-scott---you-are-the-reason-piano-sheet-lyrics-lyrics-version-link-in-description",
    composer: "Calum Scott",
    order: 1900,
    chapter: "iv in major",
  },
  {
    slug: "fairy-tail-main-theme",
    composer: "Yasuharu Takanashi",
    order: 230,
  },
  {
    slug: "welcome-to-the-black-parade---my-chemical-romance",
    composer: "My Chemical Romance",
    order: 5250,
  },
  {
    slug: "how-far-i-ll-go-~-moana-ost",
    composer: "Lin-Manuel Miranda",
    order: 1950,
  },
  { slug: "la-vie-en-rose-solo-accordion", composer: "Louiguy", order: 1970 },
  { slug: "Im_Blue_Eiffel_65", composer: "Eiffel 65", order: 630 },
  {
    slug: "old-town-road---lil-nas-x-ft.-billy-ray-cyrus",
    composer: "Lil Nas X",
    order: 360,
  },
  { slug: "abba--the-winner-takes-it-all", composer: "ABBA", order: 2500 },
];

const IntroText = () => {
  return (
    <>
      <p>
        I went through{" "}
        <a
          href="https://musescore.com/sheetmusic/non-official?sort=view_count"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://musescore.com/sheetmusic/non-official?sort=view_count
        </a>
        . My goal was to find {TOP_100_COMPOSERS.length} most popular composers
        and take the most popular score from each of them.
      </p>

      <p>
        Here's a complete list of 100 composers in the corpus:{" "}
        {TOP_100_COMPOSERS.map(({ slug, composer }, i) => (
          <>
            <a href={`/f/${slug}`} target="_blank" rel="noreferrer">
              {composer}
            </a>
            {i < TOP_100_COMPOSERS.length - 1 && ", "}
          </>
        ))}
      </p>

      <p>
        Many moderns works is a join work of several people, and for those I
        name a single person as a composer arbitrarily.
      </p>

      <p>
        In most cases, I take the same arrangement that scored the most views.
        Sometimes I find an arrangement that suits better to my narrative -
        maybe by having less mistakes, original key, better MIDI sound or so.
      </p>

      <p>
        I only take solo piano arrangements because I want to focus on harmony,
        not on the arrangement. For "We Are Number One" the most popular version
        is a band arrangement, and I represent this piece by its piano
        arrangement.
      </p>

      <p>
        I've gathered the corpus on Oct 31, 2024. Now, the view count on the
        most popular work doesn't equal the work's popularity even on MuseScore.
        Eg. "River flows in you" has 7.3M on the most popular arrangement, but
        their next top 5 arrangements (out of 687 community scores of this
        title) have 1.5M more view counts. I don't add up all view counts across
        all versions, I purely use the top 1.
      </p>

      <p>
        My method of gathering a corpus is less computationally intensive, and
        may result in a bit of misrepresentation. Some compositions which almost
        made it to top 100 by a very narrow margin are BTS's "I Need You", as
        well as themes from "Godfather" and "The Pink Panther". Next time!
      </p>

      <p>
        I don't use the number of view counts (position within the top 100)
        throughout the book on harmony. I care about the total range of harmonic
        devices used, not about their relative popularity weighted by each
        work's popularity.
      </p>

      <p>
        Neither do I want it to be weighted by the number of distinct pieces of
        the same composer which are popular. So, as a result of my method I
        include "Für Elise" and therefore I exclude "Moonlight" and "Tempest".
        Out of the entire Bach heritage I include exactly a single WTC-1 C major
        prelude. As a benefit, I don't get 7 works of Chopin into the top 100 as
        I would otherwise. Also we cut on Liszt, Joe Hisaishi, Koji Kondo, Ed
        Sheeran etc.
      </p>

      <p>
        In the special case of "He's a Pirate", I attribute it to Klaus Badelt
        to avoid excluding it because of Hans Zimmer's "Interstellar". Call it
        data manipulation, but they are even written in different minors (major
        V vs natural).
      </p>

      <p>
        In the case of "G Minor Bach" the original harmony was modernized so
        much that I include this track under Luo Ni.
      </p>

      <p>
        Also, I ignore Turkish tabs from Musa Çetiner's account. This is a great
        material which I'd look into separately. I'm not sure these view counts
        are coming from anywhere outside of the Turkish-speaking world.
      </p>

      <p>
        For ABBA, I take "The Winner Takes It All" instead of "Chiquitita",
        because "Chiquitita", although higher in view counts, is represented
        only by its ending.
      </p>

      <p>
        As I understand, the copyright takedowns of community scores didn't
        affect my corpus - even John Williams got represented.
      </p>
    </>
  );
};

const Intro = () => {
  // Sort composers with order first, then the rest
  const orderedComposers = [...TOP_100_COMPOSERS].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return 0;
  });

  // Group composers by chapters
  const composerGroups = orderedComposers.reduce<
    Array<typeof TOP_100_COMPOSERS>
  >((acc, composer) => {
    if (composer.chapter || acc.length === 0) {
      // Start a new group if composer has a chapter or it's the first composer
      acc.push([composer]);
    } else {
      // Add to the last group
      acc[acc.length - 1].push(composer);
    }
    return acc;
  }, []);

  return (
    <div>
      <h1>Musescore Top 100 Harmony</h1>

      {composerGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {group[0].chapter && <h2>{group[0].chapter}</h2>}
          <ul
            style={{
              listStyle: "none",
              paddingLeft: "0",
              margin: "10px 0 35px 0",
            }}
          >
            {group.map(({ slug, composer }) => (
              <li key={slug} style={{ marginLeft: "0" }}>
                <a
                  href={`/f/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "white" }}
                >
                  <span style={{ color: "#999" }}>{composer}. </span>
                  {slug.replace(/_|-/g, " ")}
                </a>
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
      <IntroText />
    </div>
  );
};

export default Intro;
