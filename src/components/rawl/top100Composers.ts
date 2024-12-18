export type Top100Composer = {
  slug: string;
  composer: string;
  chords?: string[];
  displayTitle: string;
  isVocal?: boolean;
};

export const TOP_100_COMPOSERS: Top100Composer[] = [
  {
    slug: "river-flows-in-you",
    composer: "Yiruma",
    displayTitle: "River Flows in You",
    chords: ["vi", "I", "IV", "V"],
  },
  {
    slug: "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
    composer: "Joe Hisaishi",
    displayTitle: "Merry-Go-Round of Life (from Howl's Moving Castle)",
  },
  {
    slug: "Canon_in_D",
    composer: "Johann Pachelbel",
    displayTitle: "Canon in D major",
  },
  {
    slug: "Clair_de_Lune__Debussy",
    composer: "Claude Debussy",
    displayTitle: "Clair de Lune",
  },
  {
    slug: "Fr_Elise",
    composer: "Ludwig van Beethoven",
    displayTitle: "Für Elise",
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
  },
  {
    slug: "Undertale_-_Megalovania_Piano_ver._3",
    composer: "Toby Fox",
    displayTitle: "Megalovania (from Undertale)",
  },
  {
    slug: "Golden_Hour__JVKE_Updated_Ver.",
    composer: "JVKE",
    displayTitle: "Golden Hour",
    isVocal: true,
  },
  {
    slug: "Je_Te_Laisserai_Des_Mots_-_Patrick_Watson",
    composer: "Patrick Watson",
    displayTitle: "Je te laisserai des mots",
    isVocal: true,
  },
  {
    slug: "Hallelujah",
    composer: "Leonard Cohen",
    displayTitle: "Hallelujah",
    isVocal: true,
  },
  {
    slug: "Interstellar",
    composer: "Hans Zimmer",
    displayTitle: "Interstellar Main Theme",
  },
  {
    slug: "Another_Love__-_Tom_Odell_Professional",
    composer: "Tom Odell",
    displayTitle: "Another Love",
    isVocal: true,
  },
  {
    slug: "Sweden_Minecraft",
    composer: "C418",
    displayTitle: "Sweden (from Minecraft)",
  },
  {
    slug: "Pirates_of_the_Caribbean_-_Hes_a_Pirate",
    composer: "Klaus Badelt",
    displayTitle: "He's a Pirate (from Pirates of the Caribbean)",
  },
  {
    slug: "Game_of_Thrones_Easy_piano",
    composer: "Ramin Djawadi",
    displayTitle: "Game of Thrones Main Theme",
  },
  {
    slug: "someone-you-loved-lewis-capaldi",
    composer: "Lewis Capaldi",
    displayTitle: "Someone You Loved",
    isVocal: true,
  },
  {
    slug: "Ed_Sheeran_Perfect",
    composer: "Ed Sheeran",
    displayTitle: "Perfect",
    isVocal: true,
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
    chords: ["i", "bVI", "V"],
    isVocal: true,
  },
  {
    slug: "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK",
    composer: "John Legend",
    displayTitle: "All of Me",
    isVocal: true,
  },
  {
    slug: "Mad_world_Piano",
    composer: "Tears for Fears (Roland Orzabal)",
    displayTitle: "Mad World",
    chords: ["ii", "IV", "I", "V"],
    isVocal: true,
  },
  {
    slug: "mariage-d-amour---paul-de-senneville-marriage-d-amour",
    composer: "Paul de Senneville",
    displayTitle: "Mariage d'Amour",
  },
  {
    slug: "Someone_Like_You_easy_piano",
    composer: "Adele",
    displayTitle: "Someone Like You",
    isVocal: true,
  },
  {
    slug: "my-heart-will-go-on",
    composer: "James Horner",
    displayTitle: "My Heart Will Go On (from Titanic)",
    isVocal: true,
  },
  {
    slug: "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2",
    composer: "Yugo Kanno",
    displayTitle: "Il vento d'oro (Giorno's Theme)",
    isVocal: true,
  },
  {
    slug: "Carol_of_the_Bells",
    composer: "Mykola Leontovych",
    displayTitle: "Carol of the Bells (Shchedryk)",
    isVocal: true,
  },
  {
    slug: "piano-man-piano",
    composer: "Billy Joel",
    displayTitle: "Piano Man",
    isVocal: true,
  },
  {
    slug: "Fly_Me_to_the_Moon",
    composer: "Bart Howard",
    displayTitle: "Fly Me to the Moon (In Other Words)",
    isVocal: true,
  },
  {
    slug: "passacaglia---handel-halvorsen",
    composer: "Handel",
    displayTitle: "Passacaglia in G minor (arr. Halvorsen)",
  },

  {
    slug: "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",
    composer: "Bach",
    displayTitle: "Prelude in C major, BWV 846",
  },
  {
    slug: "All_I_Want_for_Christmas_is_You",
    composer: "Mariah Carey",
    displayTitle: "All I Want for Christmas Is You",
    isVocal: true,
  },
  {
    slug: "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
    composer: "Shostakovich",
    displayTitle: "Waltz No. 2 (Suite for Variety Orchestra)",
  },
  {
    slug: "wa-mozart-marche-turque-turkish-march-fingered",
    composer: "Mozart",
    displayTitle: "Turkish March (Rondo alla Turca)",
  },
  {
    slug: "Viva_La_Vida_Coldplay",
    composer: "Coldplay",
    displayTitle: "Viva la Vida",
    chords: ["IV", "V", "I", "vi"],
    isVocal: true,
  },
  {
    slug: "Gravity_Falls_Opening",
    composer: "Brad Breeck",
    displayTitle: "Gravity Falls Theme",
  },
  {
    slug: "the_entertainer_scott_joplin",
    composer: "Scott Joplin",
    displayTitle: "The Entertainer",
  },
  {
    slug: "Disney_Pixar_Up_Theme",
    composer: "Michael Giacchino",
    displayTitle: "Married Life (from Up)",
  },
  {
    slug: "a-thousand-years",
    composer: "Christina Perri",
    displayTitle: "A Thousand Years",
    isVocal: true,
  },
  {
    slug: "John_Lennon_Imagine",
    composer: "John Lennon",
    displayTitle: "Imagine",
    isVocal: true,
  },

  {
    slug: "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
    composer: "Kanye West",
    displayTitle: "Runaway (arr. Ramin Djawadi for Westworld Season 2)",
    chords: ["I", "iii", "IV", "vi"],
    isVocal: true,
  },
  {
    slug: "Lovely_Billie_Eilish",
    composer: "Billie Eilish",
    displayTitle: "Lovely (with Khalid)",
    isVocal: true,
  },
  {
    slug: "Omori_Duet",
    composer: "Pedro Silva",
    displayTitle: "Duet (from Omori)",
  },
  {
    slug: "Never_Gonna_Give_You_Up",
    composer: "Mike Stock",
    displayTitle: "Never Gonna Give You Up",
    isVocal: true,
  },
  {
    slug: "despacito-piano-cover-peter-bence",
    composer: "Luis Fonsi",
    displayTitle: "Despacito",
    chords: ["vi", "I", "IV", "V"],
    isVocal: true,
  },
  {
    slug: "solas---jamie-duffy",
    composer: "Jamie Duffy",
    displayTitle: "Solas",
  },
  {
    slug: "autumn-leaves-jazz-piano",
    composer: "Joseph Kosma",
    displayTitle: "Autumn Leaves (Les Feuilles mortes)",
    isVocal: true,
  },
  {
    slug: "still-dre---variation-composition",
    composer: "Andre Young",
    displayTitle: "Still D.R.E.",
    chords: ["i", "iv"],
    isVocal: true,
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
  },
  {
    slug: "Super_Mario_Bros_Main_Theme",
    composer: "Koji Kondo",
    displayTitle: "Super Mario Bros. Main Theme",
  },
  {
    slug: "Cant_Help_Falling_In_Love",
    composer: "Jean-Paul-Égide Martini",
    displayTitle: "Can't Help Falling in Love",
    isVocal: true,
  },
  {
    slug: "g-minor-bach-original",
    composer: "Luo Ni",
    displayTitle: "G minor Bach (from Piano Tiles 2, an adaptation of BWV 847)",
  },
  {
    slug: "when-i-was-your-man---bruno-mars-600e3a",
    composer: "Bruno Mars",
    displayTitle: "When I Was Your Man",
    isVocal: true,
  },
  {
    slug: "gurenge--demon-slayer-kimetsu-no-yaiba-op",
    composer: "Kayoko Kusano",
    displayTitle: "Gurenge (Demon Slayer Opening)",
    isVocal: true,
  },
  {
    slug: "Let_Her_Go_Passenger",
    composer: "Passenger",
    displayTitle: "Let Her Go",
    isVocal: true,
  },
  {
    slug: "we-are-number-one-but-it-s-a-piano-transcript",
    composer: "Máni Svavarsson",
    displayTitle: "We Are Number One (LazyTown)",
    chords: ["i", "bVI", "V"],
    isVocal: true,
  },
  {
    slug: "dragonborn---skyrim-theme-song-piano-solo",
    composer: "Jeremy Soule",
    displayTitle: "Dragonborn (Skyrim Theme)",
    isVocal: true,
  },
  {
    slug: "doki-doki-literature-club-ost---your-reality",
    composer: "Dan Salvato",
    displayTitle: "Your Reality (from Doki Doki Literature Club)",
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
    isVocal: true,
  },
  {
    slug: "Bella_Ciao",
    composer: "Italian folk",
    displayTitle: "Bella ciao",
    isVocal: true,
  },
  {
    slug: "minuet-bwv-anhang-114-in-g-major",
    composer: "Christian Petzold",
    displayTitle: "Minuet in G major, BWV Anh. 114",
  },
  {
    slug: "Take_on_me",
    composer: "a-ha",
    displayTitle: "Take On Me",
    isVocal: true,
  },
  {
    slug: "congratulations---mac-miller",
    composer: "Mac Miller",
    displayTitle: "Congratulations",
    isVocal: true,
  },
  {
    slug: "the-office---opening-titles-theme-song-for-piano",
    composer: "Jay Ferguson",
    displayTitle: "The Office - Main Theme",
    chords: ["I", "iii", "IV", "vi"],
  },
  {
    slug: "it-s-been-a-long-long-time---harry-james",
    composer: "Jule Styne",
    displayTitle: "It's Been a Long, Long Time",
    isVocal: true,
  },
  {
    slug: "Dawn_Pride_and_Prejudice",
    composer: "Dario Marianelli",
    displayTitle: "Dawn (from Pride & Prejudice)",
  },
  {
    slug: "kimi-no-na-wa---sparkle-theishter-2016",
    composer: "Radwimps",
    displayTitle: "Sparkle (from Your Name 2016)",
    isVocal: true,
  },

  {
    slug: "Yann_Tiersen_Amelie",
    composer: "Yann Tiersen",
    displayTitle: "Comptine d'un autre été (from Amélie)",
    chords: ["vi", "I", "iii", "V"],
  },
  {
    slug: "sia---snowman",
    composer: "Sia",
    displayTitle: "Snowman",
    isVocal: true,
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
  },
  {
    slug: "happy_birthday_bass_and_chords",
    composer: "Patty Smith Hill",
    displayTitle: "Happy Birthday to You",
    chords: ["I", "IV", "V"],
    isVocal: true,
  },
  {
    slug: "flight-of-the-bumblebee",
    composer: "Nikolai Rimsky-Korsakov",
    displayTitle: "Flight of the Bumblebee",
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
    isVocal: true,
  },
  {
    slug: "sign-of-the-times---harry-styles",
    composer: "Harry Styles",
    displayTitle: "Sign of the Times",
    isVocal: true,
  },
  {
    slug: "Requiem_for_a_Dream",
    composer: "Clint Mansell",
    displayTitle: "Lux Aeterna (from Requiem for a Dream)",
    chords: ["i", "bVI", "V"],
  },

  {
    slug: "yuri-on-ice---piano-theme-full",
    composer: "Taro Umebayashi + Taku Matsushiba",
    displayTitle: "Yuri on Ice Main Theme",
  },
  {
    slug: "ye-niqu-keru-yoru-ni-kakeru---racing-into-the-night",
    composer: "Ayase",
    displayTitle: "Yoru ni Kakeru (Racing into the Night)",
    isVocal: true,
  },
  {
    slug: "africa---toto",
    composer: "Toto (David Paich + Jeff Porcaro)",
    displayTitle: "Africa",
    isVocal: true,
  },
  {
    slug: "vivaldi---summer---piano",
    composer: "Antonio Vivaldi",
    displayTitle: "Summer (from The Four Seasons)",
  },
  {
    slug: "Love_Like_You_Steven_Universe",
    composer: "Rebecca Sugar",
    displayTitle: "Love Like You (from Steven Universe)",
    isVocal: true,
  },
  {
    slug: "alan-walker---alone-piano",
    composer: "Alan Walker",
    displayTitle: "Alone",
    chords: ["vi", "I", "IV", "V", "iii"],
    isVocal: true,
  },
  {
    slug: "my-lie-watashi-no-uso---your-lie-in-april",
    composer: "Masaru Yokoyama",
    displayTitle: "Watashi no Uso, My Lie (from Your Lie in April)",
  },
  {
    slug: "anastasia---once-upon-a-december",
    composer: "Stephen Flaherty",
    displayTitle: "Once Upon a December (from Anastasia)",
    isVocal: true,
  },
  {
    slug: "Test_Drive_How_to_Train_Your_Dragon",
    composer: "John Powell",
    displayTitle: "Test Drive (from How to Train Your Dragon)",
  },
  {
    slug: "Pokemon_Theme_Song",
    composer: "John Siegler",
    displayTitle: "Pokémon Theme",
    isVocal: true,
  },

  {
    slug: "your-song-piano",
    composer: "Elton John",
    displayTitle: "Your Song",
    isVocal: true,
  },
  {
    slug: "nothing-else-matters---metallica",
    composer: "Metallica",
    displayTitle: "Nothing Else Matters",
    isVocal: true,
  },
  {
    slug: "calum-scott---you-are-the-reason-piano-sheet-lyrics-lyrics-version-link-in-description",
    composer: "Calum Scott",
    displayTitle: "You Are the Reason",
    isVocal: true,
  },
  {
    slug: "fairy-tail-main-theme",
    composer: "Yasuharu Takanashi",
    displayTitle: "Fairy Tail Main Theme",
  },
  {
    slug: "welcome-to-the-black-parade---my-chemical-romance",
    composer: "My Chemical Romance",
    displayTitle: "Welcome to the Black Parade",
    isVocal: true,
  },
  {
    slug: "how-far-i-ll-go-~-moana-ost",
    composer: "Lin-Manuel Miranda",
    displayTitle: "How Far I'll Go (from Moana)",
    isVocal: true,
  },
  {
    slug: "la-vie-en-rose-solo-accordion",
    composer: "Louiguy",
    displayTitle: "La Vie en rose",
    isVocal: true,
  },
  {
    slug: "Im_Blue_Eiffel_65",
    composer: "Eiffel 65",
    displayTitle: "Blue (Da Ba Dee)",
    isVocal: true,
  },
  {
    slug: "A_Thousand_Miles",
    composer: "Vanessa Carlton",
    displayTitle: "A Thousand Miles",
    isVocal: true,
  },
  {
    slug: "old-town-road---lil-nas-x-ft.-billy-ray-cyrus",
    composer: "Lil Nas X",
    displayTitle: "Old Town Road",
    isVocal: true,
  },
  {
    slug: "abba--the-winner-takes-it-all",
    composer: "ABBA",
    displayTitle: "The Winner Takes It All",
    isVocal: true,
  },
  {
    slug: "Sonate_No._14_Moonlight_1st_Movement",
    composer: "Ludwig van Beethoven",
    displayTitle: "Piano Sonata No. 14 'Moonlight', 1st Movement",
  },
  {
    slug: "One_Summers_Day_Spirited_Away",
    composer: "Joe Hisaishi",
    displayTitle: "One Summer's Day (from Spirited Away)",
  },
  {
    slug: "Waltz_in_A_MinorChopin",
    composer: "Frédéric Chopin",
    displayTitle: "Waltz No. 19 in A minor",
  },
  {
    slug: "tude_S._1413_in_G_Minor_La_Campanella__Liszt",
    composer: "Franz Liszt",
    displayTitle: "Étude S. 141/3 in G minor (La Campanella)",
  },
  {
    slug: "Kiss_The_Rain_-_Yiruma_-_10th_Anniversary_Version_Piano_Updated_2019",
    composer: "Yiruma",
    displayTitle: "Kiss the Rain - 10th Anniversary Version",
  },
  {
    slug: "Wet_Hands_Minecraft",
    composer: "C418",
    displayTitle: "Wet Hands (from Minecraft)",
  },
  {
    slug: "eda-s-requiem---brad-breeck-piano",
    composer: "Brad Breeck",
    displayTitle: "Eda's Requiem",
  },
  {
    slug: "Maple_Leaf_Rag_Scott_Joplin",
    composer: "Scott Joplin",
    displayTitle: "Maple Leaf Rag",
  },
  {
    slug: "kanye-west-homecoming-piano-cover",
    composer: "Kanye West",
    displayTitle: "Homecoming",
  },
  {
    slug: "what-falling-in-love-feels-like---jake25.17-fanmade-extended-version",
    composer: "JVKE",
    displayTitle: "What Falling in Love Feels Like",
  },
  {
    slug: "pachelbel-chaconne-in-f-minor",
    composer: "Johann Pachelbel",
    displayTitle: "Chaconne in F minor",
  },
  {
    slug: "wii-sports-theme-piano",
    composer: "Kazumi Totaka",
    displayTitle: "Wii Sports Theme (From 'Nintendo Wii')",
  },
  {
    slug: "Billie_Eilish_Bad_Guy",
    composer: "Billie Eilish",
    displayTitle: "Bad Guy",
  },
  {
    slug: "secunda-the-elder-scrolls-v-skyrim",
    composer: "Jeremy Soule",
    displayTitle: "Secunda (from The Elder Scrolls V: Skyrim)",
  },
  {
    slug: "liz-on-top-of-the-world",
    composer: "Dario Marianelli",
    displayTitle: "Liz on Top of the World",
  },
  {
    slug: "Zeldas_Lullaby",
    composer: "Koji Kondo",
    displayTitle: "Zelda's Lullaby",
  },
  {
    slug: "lacrimosa---requiem",
    composer: "Mozart",
    displayTitle: "Lacrimosa",
  },
  {
    slug: "satie-e.---gnossienne-no.-1",
    composer: "Erik Satie",
    displayTitle: "Gnossienne No. 1",
  },
  {
    slug: "arabesque-l.-66-no.-1-in-e-major",
    composer: "Claude Debussy",
    displayTitle: "Arabesque L. 66 No. 1 in E major",
  },
  {
    slug: "Fallen_Down_Undertale",
    composer: "Toby Fox",
    displayTitle: "Fallen Down (from Undertale)",
  },
  {
    slug: "the-scientist---coldplay-piano-arrangement",
    composer: "Coldplay",
    displayTitle: "The Scientist",
  },
  {
    slug: "ballade-pour-adeline---richard-clayderman",
    composer: "Richard Clayderman",
    displayTitle: "Ballade pour Adeline",
  },
];
