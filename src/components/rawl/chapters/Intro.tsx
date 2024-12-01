import * as React from "react";
import { AppContext } from "../../AppContext";
import ChordStairs, {
  APPLIED_CHORDS,
  DORIAN_MINOR,
  EXTENSIONS,
  JAZZ_MODE,
  MARIO_CADENCE,
  MINOR_WITH_V,
  Mode,
  NATURAL_MINOR,
  SIX_MAJOR_TRIADS,
  V_of_V,
} from "../ChordStairs";
import { PianoLegend } from "../PianoLegend";
import SnippetList from "../SnippetList";
import { Snippet } from "../analysis";

type EnhancedSnippet = Snippet & {
  composerSlug: string;
};

export const TOP_100_COMPOSERS: {
  slug: string;
  composer: string;
  order?: number;
  chapter?: string;
  chords?: string[];
  displayTitle: string;
  mode?: Mode;
}[] = [
  {
    slug: "river-flows-in-you",
    composer: "Yiruma",
    displayTitle: "River Flows in You",
    order: 200,
    chords: ["vi", "I", "IV", "V"],
  },
  {
    slug: "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
    composer: "Joe Hisaishi",
    displayTitle: "Merry-Go-Round of Life (from Howl's Moving Castle)",
    order: 5600,
  },
  {
    slug: "Canon_in_D",
    composer: "Johann Pachelbel",
    displayTitle: "Canon in D major",
    order: 1000,
  },
  {
    slug: "Clair_de_Lune__Debussy",
    composer: "Claude Debussy",
    displayTitle: "Clair de Lune",
    chapter: "Complicated mix",
  },
  {
    slug: "Fr_Elise",
    composer: "Ludwig van Beethoven",
    displayTitle: "Für Elise",
    order: 2850,
  },
  {
    slug: "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
    composer: "Frédéric Chopin",
    displayTitle: "Nocturne in E-flat major, Op. 9 No. 2",
  },
  {
    slug: "Gymnopdie_No._1__Satie",
    composer: "Erik Satie",
    displayTitle: "Gymnopédie No. 1",
    order: 2040,
  },
  {
    slug: "Undertale_-_Megalovania_Piano_ver._3",
    composer: "Toby Fox",
    displayTitle: "Megalovania (from Undertale)",
    order: 2905,
    chapter: "Blues scale and hexatonic minor",
  },
  {
    slug: "Golden_Hour__JVKE_Updated_Ver.",
    composer: "JVKE",
    displayTitle: "Golden Hour",
    order: 2030,
    chapter: "Seventh chords and extensions",
    mode: EXTENSIONS,
  },
  {
    slug: "Je_Te_Laisserai_Des_Mots_-_Patrick_Watson",
    composer: "Patrick Watson",
    displayTitle: "Je te laisserai des mots",
    order: 1630,
  },
  {
    slug: "Hallelujah",
    composer: "Leonard Cohen",
    displayTitle: "Hallelujah",
    order: 1104,
  },
  {
    slug: "Interstellar",
    composer: "Hans Zimmer",
    displayTitle: "Interstellar Main Theme",
    order: 705,
  },
  {
    slug: "Another_Love__-_Tom_Odell_Professional",
    composer: "Tom Odell",
    displayTitle: "Another Love",
    order: 620,
  },
  {
    slug: "Sweden_Minecraft",
    composer: "C418",
    displayTitle: "Sweden (from Minecraft)",
    order: 2035,
  },
  {
    slug: "Pirates_of_the_Caribbean_-_Hes_a_Pirate",
    composer: "Klaus Badelt",
    displayTitle: "He's a Pirate (from Pirates of the Caribbean)",
    order: 1600,
  },
  {
    slug: "Game_of_Thrones_Easy_piano",
    composer: "Ramin Djawadi",
    displayTitle: "Game of Thrones Main Theme",
    order: 500,
  },
  {
    slug: "Someone_You_Loved",
    composer: "Lewis Capaldi",
    displayTitle: "Someone You Loved",
    order: 355,
  },
  {
    slug: "Ed_Sheeran_Perfect",
    composer: "Ed Sheeran",
    displayTitle: "Perfect",
    order: 300,
    chapter: "A mix of progressions in major",
  },
  {
    slug: "Liebestraum_No._3_in_A_Major",
    composer: "Franz Liszt",
    displayTitle: "Liebestraum No. 3 in A-flat major",
  },
  {
    slug: "Believer_-_Imagine_Dragons",
    composer: "Imagine Dragons",
    displayTitle: "Believer",
    order: 1400,
  },
  {
    slug: "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK",
    composer: "John Legend",
    displayTitle: "All of Me",
    order: 380,
  },
  {
    slug: "Mad_world_Piano",
    composer: "Roland Orzabal",
    displayTitle: "Mad World",
    order: 250,
    chords: ["ii", "IV", "I", "V"],
  },
  {
    slug: "mariage-d-amour---paul-de-senneville-marriage-d-amour",
    composer: "Paul de Senneville",
    displayTitle: "Mariage d'Amour",
    order: 1800,
  },
  {
    slug: "Someone_Like_You_easy_piano",
    composer: "Adele",
    displayTitle: "Someone Like You",
    order: 350,
  },
  {
    slug: "my-heart-will-go-on",
    composer: "James Horner",
    displayTitle: "My Heart Will Go On (from Titanic)",
    order: 2670,
  },
  {
    slug: "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2",
    composer: "Yugo Kanno",
    displayTitle: "Il vento d'oro (Giorno's Theme)",
    order: 2907,
  },
  {
    slug: "Carol_of_the_Bells",
    composer: "Mykola Leontovych",
    displayTitle: "Carol of the Bells (Shchedryk)",
    order: 1620,
  },
  {
    slug: "piano-man-piano",
    composer: "Billy Joel",
    displayTitle: "Piano Man",
    order: 2300,
    chapter: "V/V",
    mode: V_of_V,
  },
  {
    slug: "Fly_Me_to_the_Moon",
    composer: "Bart Howard",
    displayTitle: "Fly Me to the Moon (In Other Words)",
    order: 5300,
    chapter: "ii V I jazz",
    mode: JAZZ_MODE,
  },
  {
    slug: "passacaglia---handel-halvorsen",
    composer: "Handel",
    displayTitle: "Passacaglia in G minor (arr. Halvorsen)",
    order: 1650,
    chapter: "Circle of fifths: i iv ♭VII ♭III ♭vi",
  },

  {
    slug: "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",
    composer: "Bach",
    displayTitle: "Prelude in C major, BWV 846",
    order: 2602,
  },
  {
    slug: "All_I_Want_for_Christmas_is_You",
    composer: "Mariah Carey",
    displayTitle: "All I Want for Christmas Is You",
    order: 2600,
  },
  {
    slug: "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
    composer: "Shostakovich",
    displayTitle: "Waltz No. 2 (Suite for Variety Orchestra)",
    order: 2700,
  },
  {
    slug: "wa-mozart-marche-turque-turkish-march-fingered",
    composer: "Mozart",
    displayTitle: "Turkish March (Rondo alla Turca)",
    order: 2420,
  },
  {
    slug: "Viva_La_Vida_Coldplay",
    composer: "Coldplay",
    displayTitle: "Viva la Vida",
    order: 280,
  },
  {
    slug: "Gravity_Falls_Opening",
    composer: "Brad Breeck",
    displayTitle: "Gravity Falls Theme",
    order: 1500,
  },
  {
    slug: "the_entertainer_scott_joplin",
    composer: "Scott Joplin",
    displayTitle: "The Entertainer",
    order: 2900,
  },
  {
    slug: "Disney_Pixar_Up_Theme",
    composer: "Michael Giacchino",
    displayTitle: "Married Life (from Up)",
    order: 2350,
  },
  {
    slug: "a-thousand-years",
    composer: "Christina Perri",
    displayTitle: "A Thousand Years",
    order: 900,
    chapter: "Functional major with V7",
  },
  {
    slug: "John_Lennon_Imagine",
    composer: "John Lennon",
    displayTitle: "Imagine",
    order: 1100,
  },

  {
    slug: "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
    composer: "Kanye West",
    displayTitle: "Runaway (arr. Ramin Djawadi for Westworld Season 2)",
    order: 55,
    chords: ["I", "iii", "IV", "vi"],
  },
  {
    slug: "Lovely_Billie_Eilish",
    composer: "Billie Eilish",
    displayTitle: "Lovely (with Khalid)",
    order: 600,
  },
  {
    slug: "Omori_Duet",
    composer: "Pedro Silva",
    displayTitle: "Duet (from Omori)",
    order: 2450,
  },
  {
    slug: "Never_Gonna_Give_You_Up",
    composer: "Mike Stock",
    displayTitle: "Never Gonna Give You Up",
    order: 650,
  },
  {
    slug: "despacito-piano-cover-peter-bence",
    composer: "Luis Fonsi",
    displayTitle: "Despacito",
    order: 100,
    chords: ["vi", "I", "IV", "V"],
  },
  {
    slug: "solas---jamie-duffy",
    composer: "Jamie Duffy",
    displayTitle: "Solas",
    order: 870,
  },
  {
    slug: "autumn-leaves-jazz-piano",
    composer: "Joseph Kosma",
    displayTitle: "Autumn Leaves (Les Feuilles mortes)",
    order: 5400,
  },
  {
    slug: "still-dre---variation-composition",
    composer: "Andre Young",
    displayTitle: "Still D.R.E.",
    order: 400,
    chapter: "Natural minor",
    mode: NATURAL_MINOR,
  },
  {
    slug: "what-falling-in-love-feels-like---jake25.17-fanmade-extended-version",
    composer: "Jake 25.17",
    displayTitle: "What Falling in Love Feels Like",
  },
  {
    slug: "mii-channel-piano",
    composer: "Kazumi Totaka",
    displayTitle: "Mii Channel Theme",
  },

  {
    slug: "sadness-and-sorrow-for-piano-solo",
    composer: "Toshio Masuda",
    displayTitle: "Sadness and Sorrow (from Naruto)",
    order: 700,
  },
  {
    slug: "Super_Mario_Bros_Main_Theme",
    composer: "Koji Kondo",
    displayTitle: "Super Mario Bros. Main Theme",
    order: 5200,
  },
  {
    slug: "Cant_Help_Falling_In_Love",
    composer: "Jean-Paul-Égide Martini",
    displayTitle: "Can't Help Falling in Love",
    order: 2490,
  },
  {
    slug: "g-minor-bach-original",
    composer: "Luo Ni",
    displayTitle: "G minor Bach (from Piano Tiles 2, an adaptation of BWV 847)",
    order: 1670,
  },
  {
    slug: "when-i-was-your-man---bruno-mars-600e3a",
    composer: "Bruno Mars",
    displayTitle: "When I Was Your Man",
    order: 4950,
    chapter: "♭VII in major",
    mode: MARIO_CADENCE,
  },
  {
    slug: "gurenge--demon-slayer-kimetsu-no-yaiba-op",
    composer: "Kayoko Kusano",
    displayTitle: "Gurenge (Demon Slayer Opening)",
    order: 1640,
  },
  {
    slug: "Let_Her_Go_Passenger",
    composer: "Passenger",
    displayTitle: "Let Her Go",
    order: 610,
  },
  {
    slug: "we-are-number-one-but-it-s-a-piano-transcript",
    composer: "Máni Svavarsson",
    displayTitle: "We Are Number One (LazyTown)",
    order: 1300,
  },
  {
    slug: "dragonborn---skyrim-theme-song-piano-solo",
    composer: "Jeremy Soule",
    displayTitle: "Dragonborn (Skyrim Theme)",
    order: 850,
  },
  {
    slug: "doki-doki-literature-club-ost---your-reality",
    composer: "Dan Salvato",
    displayTitle: "Your Reality (from Doki Doki Literature Club)",
    order: 270,
  },

  {
    slug: "ylang-ylang---fkj-transcribed-by-lilroo",
    composer: "FKJ",
    displayTitle: "Ylang Ylang",
  },
  {
    slug: "attack-on-titan-theme-guren-no-yumiya",
    composer: "Hiroyuki Sawano",
    displayTitle: "Guren no Yumiya (Attack on Titan Opening)",
  },
  {
    slug: "Bella_Ciao",
    composer: "Italian folk",
    displayTitle: "Bella ciao",
    order: 1450,
    chapter: "Minor with V",
    mode: MINOR_WITH_V,
  },
  {
    slug: "minuet-bwv-anhang-114-in-g-major",
    composer: "Christian Petzold",
    displayTitle: "Minuet in G major, BWV Anh. 114",
    order: 2400,
    chapter: "Modulations in classical music",
  },
  {
    slug: "Take_on_me",
    composer: "a-ha",
    displayTitle: "Take On Me",
    order: 5000,
  },
  {
    slug: "congratulations---mac-miller",
    composer: "Mac Miller",
    displayTitle: "Congratulations",
  },
  {
    slug: "the-office---opening-titles-theme-song-for-piano",
    composer: "Jay Ferguson",
    displayTitle: "The Office - Main Theme",
    order: 50,
    chapter: "Single four-chord progression in major",
    chords: ["I", "iii", "IV", "vi"],
    mode: SIX_MAJOR_TRIADS,
  },
  {
    slug: "it-s-been-a-long-long-time---harry-james",
    composer: "Jule Styne",
    displayTitle: "It's Been a Long, Long Time",
    order: 5500,
  },
  {
    slug: "Dawn_Pride_and_Prejudice",
    composer: "Dario Marianelli",
    displayTitle: "Dawn (from Pride & Prejudice)",
    order: 1105,
  },
  {
    slug: "kimi-no-na-wa---sparkle-theishter-2016",
    composer: "Radwimps",
    displayTitle: "Sparkle (from Your Name 2016)",
    order: 5100,
  },

  {
    slug: "Yann_Tiersen_Amelie",
    composer: "Yann Tiersen",
    displayTitle: "Comptine d'un autre été (from Amélie)",
    order: 270,
    chords: ["vi", "I", "iii", "V"],
  },
  {
    slug: "sia---snowman",
    composer: "Sia",
    displayTitle: "Snowman",
    order: 2470,
  },
  {
    slug: "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
    composer: "Takahiro Obata",
    displayTitle: "Isabella's Lullaby (The Promised Neverland)",
  },
  {
    slug: "theme-from-schindler-s-list---piano-solo",
    composer: "John Williams",
    displayTitle: "Theme from Schindler's List",
    order: 2430,
  },
  {
    slug: "happy_birthday_bass_and_chords",
    composer: "Patty Smith Hill",
    displayTitle: "Happy Birthday to You",
    order: 20,
    chapter: "Intro",
    chords: ["I", "IV", "V"],
  },
  {
    slug: "flight-of-the-bumblebee",
    composer: "Nikolai Rimsky-Korsakov",
    displayTitle: "Flight of the Bumblebee",
    order: 2800,
  },
  {
    slug: "dance-of-the-sugar-plum-fairy",
    composer: "Pyotr Ilyich Tchaikovsky",
    displayTitle: "Dance of the Sugar Plum Fairy",
  },
  {
    slug: "dont-stop-believing-piano",
    composer: "Journey",
    displayTitle: "Don't Stop Believin'",
    order: 330,
  },
  {
    slug: "sign-of-the-times---harry-styles",
    composer: "Harry Styles",
    displayTitle: "Sign of the Times",
    order: 1103,
  },
  {
    slug: "Requiem_for_a_Dream",
    composer: "Clint Mansell",
    displayTitle: "Lux Aeterna (from Requiem for a Dream)",
    order: 1200,
    chapter: "i ♭VI V",
    chords: ["i", "bVI", "V"],
  },

  {
    slug: "yuri-on-ice---piano-theme-full",
    composer: "Taro Umebayashi + Taku Matsushiba",
    displayTitle: "Yuri on Ice Main Theme",
    order: 2045,
  },
  {
    slug: "ye-niqu-keru-yoru-ni-kakeru---racing-into-the-night",
    composer: "Ayase",
    displayTitle: "Yoru ni Kakeru (Racing into the Night)",
    order: 2600,
  },
  {
    slug: "africa---toto",
    composer: "Toto (David Paich + Jeff Porcaro)",
    displayTitle: "Africa",
  },
  {
    slug: "vivaldi---summer---piano",
    composer: "Antonio Vivaldi",
    displayTitle: "Summer (from The Four Seasons)",
    order: 1680,
  },
  {
    slug: "Love_Like_You_Steven_Universe",
    composer: "Rebecca Sugar",
    displayTitle: "Love Like You (from Steven Universe)",
    order: 2650,
    chapter: "Modulations and applied chords combined",
  },
  {
    slug: "alan-walker---alone-piano",
    composer: "Alan Walker",
    displayTitle: "Alone",
    order: 150,
    chords: ["vi", "I", "IV", "V", "iii"],
  },
  {
    slug: "my-lie-watashi-no-uso---your-lie-in-april",
    composer: "Masaru Yokoyama",
    displayTitle: "Watashi no Uso, My Lie (from Your Lie in April)",
    order: 2497,
  },
  {
    slug: "anastasia---once-upon-a-december",
    composer: "Stephen Flaherty",
    displayTitle: "Once Upon a December (from Anastasia)",
    order: 2440,
    chapter: "Other applied chords",
    mode: APPLIED_CHORDS,
  },
  {
    slug: "Test_Drive_How_to_Train_Your_Dragon",
    composer: "John Powell",
    displayTitle: "Test Drive (from How to Train Your Dragon)",
    order: 2380,
  },
  {
    slug: "Pokemon_Theme_Song",
    composer: "John Siegler",
    displayTitle: "Pokémon Theme",
    order: 1645,
  },

  {
    slug: "your-song-piano",
    composer: "Elton John",
    displayTitle: "Your Song",
    order: 2495,
  },
  {
    slug: "nothing-else-matters---metallica",
    composer: "Metallica",
    displayTitle: "Nothing Else Matters",
    order: 800,
    chapter: "Dorian IV",
    mode: DORIAN_MINOR,
  },
  {
    slug: "calum-scott---you-are-the-reason-piano-sheet-lyrics-lyrics-version-link-in-description",
    composer: "Calum Scott",
    displayTitle: "You Are the Reason",
    order: 1900,
    chapter: "iv in major",
  },
  {
    slug: "fairy-tail-main-theme",
    composer: "Yasuharu Takanashi",
    displayTitle: "Fairy Tail Main Theme",
    order: 2909,
  },
  {
    slug: "welcome-to-the-black-parade---my-chemical-romance",
    composer: "My Chemical Romance",
    displayTitle: "Welcome to the Black Parade",
    order: 5250,
  },
  {
    slug: "how-far-i-ll-go-~-moana-ost",
    composer: "Lin-Manuel Miranda",
    displayTitle: "How Far I'll Go (from Moana)",
    order: 1950,
  },
  {
    slug: "la-vie-en-rose-solo-accordion",
    composer: "Louiguy",
    displayTitle: "La Vie en rose",
    order: 1970,
  },
  {
    slug: "Im_Blue_Eiffel_65",
    composer: "Eiffel 65",
    displayTitle: "Blue (Da Ba Dee)",
    order: 630,
  },
  {
    slug: "old-town-road---lil-nas-x-ft.-billy-ray-cyrus",
    composer: "Lil Nas X",
    displayTitle: "Old Town Road",
    order: 360,
  },
  {
    slug: "abba--the-winner-takes-it-all",
    composer: "ABBA",
    displayTitle: "The Winner Takes It All",
    order: 2500,
  },
];

const IntroText = () => {
  return (
    <div style={{ maxWidth: "40em", marginTop: "180px" }}>
      <h2>How did I pick the pieces?</h2>
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
        I've gathered the corpus on Oct 31, 2024. The view count on the most
        popular work doesn't equal the work's popularity even on MuseScore. Eg.
        "River flows in you" has 7.3M on the most popular arrangement, but their
        next top 5 arrangements (out of 687 community scores of this title) have
        1.5M more view counts. I don't add up all view counts across all
        versions, I purely use the top 1 - which makes a bit of a random
        selection at the lower end of the top 100.
      </p>

      <p>
        Some compositions which almost made it to top 100 by a very narrow
        margin are BTS's "I Need You", as well as themes from "Godfather" and
        "The Pink Panther". Next time!
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
    </div>
  );
};

const Intro = () => {
  const appContext = React.useContext(AppContext);
  if (!appContext) throw new Error("AppContext not found");
  const { analyses } = appContext;
  const [loadingSnippets, setLoadingSnippets] = React.useState<Set<string>>(
    new Set(),
  );
  const [hoveredSlug, setHoveredSlug] = React.useState<string | null>(null);

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
      acc.push([composer]);
    } else {
      acc[acc.length - 1].push(composer);
    }
    return acc;
  }, []);

  // Handle snippet click with loading state
  const handleSnippetClick = async (snippet: EnhancedSnippet) => {
    const slug = snippet.composerSlug;
    setLoadingSnippets((prev) => new Set([...prev, slug]));
    try {
      await appContext.handleSongClick(slug);
    } finally {
      setLoadingSnippets((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <h1>Visual Harmony of Top 100 Composers on MuseScore.com</h1>
      <div
        style={{
          marginTop: "70px",
          marginBottom: "70px",
          marginLeft: "150px",
          transform: "scale(0.9)",
        }}
      >
        <PianoLegend inline={false} />
      </div>

      {composerGroups.map((group, groupIndex) => {
        const groupSnippets = group.flatMap((item) =>
          (analyses[`f/${item.slug}`]?.snippets || [])
            .filter((snippet) => snippet.tag === "book:index")
            .map((snippet) => ({ ...snippet, composerSlug: item.slug })),
        );

        return (
          <div>
            <div
              style={{
                marginBottom: "10px",
                marginTop: "50px",
                marginLeft: "150px",
                transform: "scale(0.9)",
              }}
            >
              {group[0].mode && <ChordStairs mode={group[0].mode} />}
            </div>
            <div
              key={groupIndex}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
                gap: "60px",
                marginBottom: "80px",
              }}
            >
              <div>
                {group[0].chapter && (
                  <>
                    <h2 style={{ margin: "0 0 10px 0" }}>{group[0].chapter}</h2>
                  </>
                )}
                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: "0",
                    margin: "0",
                  }}
                >
                  {group.map(({ slug, composer, displayTitle }) => (
                    <li
                      key={slug}
                      style={{
                        marginLeft: "0",
                        whiteSpace: "nowrap",
                        transition: "all 0.3s ease",
                        textShadow:
                          hoveredSlug === slug
                            ? "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)"
                            : "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          hoveredSlug === slug
                            ? "rgba(255, 255, 255, 0.1)"
                            : "transparent",
                      }}
                    >
                      <a
                        href={`/f/${slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: hoveredSlug === slug ? "#fff" : "white",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            color: hoveredSlug === slug ? "#ccc" : "#999",
                            transition: "color 0.3s ease",
                          }}
                        >
                          {composer}.{" "}
                        </span>
                        <span style={{ flex: 1 }}>{displayTitle}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              {groupSnippets.length > 0 && (
                <div>
                  <SnippetList
                    snippets={groupSnippets}
                    noteHeight={3}
                    isPreview={true}
                    onSnippetClick={handleSnippetClick}
                    loadingSnippets={loadingSnippets}
                    onSnippetHover={(snippet) =>
                      setHoveredSlug(
                        snippet
                          ? (snippet as EnhancedSnippet).composerSlug
                          : null,
                      )
                    }
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <IntroText />
    </div>
  );
};

export default Intro;
