import * as React from "react";
import { corpora } from "../corpora/corpora";

const TOP_100_COMPOSERS = [
  { slug: "river-flows-in-you", composer: "Yiruma" },
  {
    slug: "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
    composer: "Joe Hisaishi",
  },
  { slug: "Canon_in_D", composer: "Pachelbel" },
  { slug: "Clair_de_Lune__Debussy", composer: "Debussy" },
  { slug: "Fr_Elise", composer: "Beethoven" },
  { slug: "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major", composer: "Chopin" },
  { slug: "Gymnopdie_No._1__Satie", composer: "Satie" },
  { slug: "Undertale_-_Megalovania_Piano_ver._3", composer: "Toby Fox" },
  { slug: "Golden_Hour__JVKE_Updated_Ver.", composer: "JVKE" },
  {
    slug: "Je_Te_Laisserai_Des_Mots_-_Patrick_Watson",
    composer: "Patrick Watson",
  },

  { slug: "Hallelujah", composer: "Leonard Cohen" },
  { slug: "Interstellar", composer: "Hans Zimmer" },
  { slug: "Another_Love__-_Tom_Odell_Professional", composer: "Tom Odell" },
  { slug: "Sweden_Minecraft", composer: "C418" },
  { slug: "Pirates_of_the_Caribbean_-_Hes_a_Pirate", composer: "Klaus Badelt" },
  { slug: "Game_of_Thrones_Easy_piano", composer: "Ramin Djawadi" },
  { slug: "Someone_You_Loved", composer: "Lewis Capaldi" },
  { slug: "Ed_Sheeran_Perfect", composer: "Ed Sheeran" },
  { slug: "Liebestraum_No._3_in_A_Major", composer: "Liszt" },
  { slug: "Believer_-_Imagine_Dragons", composer: "Imagine Dragons" },

  {
    slug: "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK",
    composer: "John Legend",
  },
  { slug: "Mad_world_Piano", composer: "Roland Orzabal" },
  {
    slug: "mariage-d-amour---paul-de-senneville-marriage-d-amour",
    composer: "Paul de Senneville",
  },
  { slug: "Someone_Like_You_easy_piano", composer: "Adele" },
  { slug: "my-heart-will-go-on", composer: "James Horner" },
  {
    slug: "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2",
    composer: "Yugo Kanno",
  },
  { slug: "Carol_of_the_Bells", composer: "Mykola Leontovych" },
  { slug: "piano-man-piano", composer: "Billy Joel" },
  { slug: "Fly_Me_to_the_Moon", composer: "Bart Howard" },
  { slug: "passacaglia---handel-halvorsen", composer: "Handel" },

  {
    slug: "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",
    composer: "Bach",
  },
  { slug: "All_I_Want_for_Christmas_is_You", composer: "Mariah Carey" },
  {
    slug: "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
    composer: "Shostakovich",
  },
  {
    slug: "wa-mozart-marche-turque-turkish-march-fingered",
    composer: "Mozart",
  },
  { slug: "Viva_La_Vida_Coldplay", composer: "Coldplay" },
  { slug: "Gravity_Falls_Opening", composer: "Brad Breeck" },
  { slug: "the_entertainer_scott_joplin", composer: "Scott Joplin" },
  { slug: "Disney_Pixar_Up_Theme", composer: "Michael Giacchino" },
  { slug: "a-thousand-years", composer: "Christina Perri" },
  { slug: "John_Lennon_Imagine", composer: "John Lennon" },

  {
    slug: "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
    composer: "Emile Haynie",
  },
  { slug: "Lovely_Billie_Eilish", composer: "Billie Eilish" },
  { slug: "Omori_Duet", composer: "Pedro Silva" },
  { slug: "Never_Gonna_Give_You_Up", composer: "Mike Stock" },
  { slug: "despacito-piano-cover-peter-bence", composer: "Luis Fonsi" },
  { slug: "solas---jamie-duffy", composer: "Jamie Duffy" },
  { slug: "autumn-leaves-jazz-piano", composer: "Joseph Kosma" },
  { slug: "still-dre---variation-composition", composer: "Andre Young" },
  {
    slug: "what-falling-in-love-feels-like---jake25.17-fanmade-extended-version",
    composer: "Jake 25.17",
  },
  { slug: "mii-channel-piano", composer: "Kazumi Totaka" },

  { slug: "sadness-and-sorrow-for-piano-solo", composer: "Toshio Masuda" },
  { slug: "Super_Mario_Bros_Main_Theme", composer: "Koji Kondo" },
  { slug: "Cant_Help_Falling_In_Love", composer: "Jean-Paul-Égide Martini" },
  { slug: "g-minor-bach-original", composer: "Luo Ni" },
  { slug: "when-i-was-your-man---bruno-mars-600e3a", composer: "Bruno Mars" },
  {
    slug: "gurenge--demon-slayer-kimetsu-no-yaiba-op",
    composer: "Kayoko Kusano",
  },
  { slug: "Let_Her_Go_Passenger", composer: "Passenger" },
  {
    slug: "we-are-number-one-but-it-s-a-piano-transcript",
    composer: "Máni Svavarsson",
  },
  {
    slug: "dragonborn---skyrim-theme-song-piano-solo",
    composer: "Jeremy Soule",
  },
  {
    slug: "doki-doki-literature-club-ost---your-reality",
    composer: "Dan Salvato",
  },

  { slug: "ylang-ylang---fkj-transcribed-by-lilroo", composer: "FKJ" },
  {
    slug: "attack-on-titan-theme-guren-no-yumiya",
    composer: "Hiroyuki Sawano",
  },
  { slug: "Bella_Ciao", composer: "Italian folk" },
  { slug: "minuet-bwv-anhang-114-in-g-major", composer: "Christian Petzold" },
  { slug: "Take_on_me", composer: "a-ha" },
  { slug: "congratulations---mac-miller", composer: "Mac Miller" },
  { slug: "the-office-opening-theme", composer: "Jay Ferguson" },
  { slug: "it-s-been-a-long-long-time---harry-james", composer: "Jule Styne" },
  { slug: "Dawn_Pride_and_Prejudice", composer: "Dario Marianelli" },
  { slug: "kimi-no-na-wa---sparkle-theishter-2016", composer: "Radwimps" },

  { slug: "Yann_Tiersen_Amelie", composer: "Yann Tiersen" },
  { slug: "sia---snowman", composer: "Sia" },
  {
    slug: "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
    composer: "Takahiro Obata",
  },
  {
    slug: "theme-from-schindler-s-list---piano-solo",
    composer: "John Williams",
  },
  { slug: "happy-birthday-to-you-c-major", composer: "Patty Smith Hill" },
  { slug: "flight-of-the-bumblebee", composer: "Nikolai Rimsky-Korsakov" },
  {
    slug: "dance-of-the-sugar-plum-fairy",
    composer: "Pyotr Ilyich Tchaikovsky",
  },
  { slug: "dont-stop-believing-piano", composer: "Journey" },
  { slug: "sign-of-the-times---harry-styles", composer: "Harry Styles" },
  { slug: "Requiem_for_a_Dream", composer: "Clint Mansell" },

  {
    slug: "yuri-on-ice---piano-theme-full",
    composer: "Taro Umebayashi + Taku Matsushiba",
  },
  {
    slug: "ye-niqu-keru-yoru-ni-kakeru---racing-into-the-night",
    composer: "Ayase",
  },
  { slug: "africa---toto", composer: "Toto" },
  { slug: "vivaldi---summer---piano", composer: "Vivaldi" },
  { slug: "Love_Like_You_Steven_Universe", composer: "Steven Universe" },
  { slug: "alan-walker---alone-piano", composer: "Alan Walker" },
  {
    slug: "my-lie-watashi-no-uso---your-lie-in-april",
    composer: "Masaru Yokoyama",
  },
  { slug: "anastasia---once-upon-a-december", composer: "Stephen Flaherty" },
  { slug: "Test_Drive_How_to_Train_Your_Dragon", composer: "John Powell" },
  { slug: "Pokemon_Theme_Song", composer: "John Siegler" },

  { slug: "your-song-piano", composer: "Elton John" },
  { slug: "nothing-else-matters---metallica", composer: "Metallica" },
  {
    slug: "calum-scott---you-are-the-reason-piano-sheet-lyrics-lyrics-version-link-in-description",
    composer: "Calum Scott",
  },
  { slug: "fairy-tail-main-theme", composer: "Yasuharu Takanashi" },
  {
    slug: "welcome-to-the-black-parade---my-chemical-romance",
    composer: "My Chemical Romance",
  },
  { slug: "how-far-i-ll-go-~-moana-ost", composer: "Lin-Manuel Miranda" },
  { slug: "la-vie-en-rose-solo-accordion", composer: "Louiguy" },
  { slug: "Im_Blue_Eiffel_65", composer: "Eiffel 65" },
  {
    slug: "old-town-road---lil-nas-x-ft.-billy-ray-cyrus",
    composer: "Lil Nas X",
  },
  { slug: "abba--the-winner-takes-it-all", composer: "ABBA" },
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
        . My goal was to find 100 most popular pieces. However, for every
        composer I only take one most popular piece, to get 100 composers in
        total.
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
        In most cases, I take the same arrangement that scored the most view
        counts. Sometimes I find an arrangement that suits better to my
        narrative - maybe by having less mistakes, original key, better MIDI
        sound or so.
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
  return (
    <div>
      <h1>Musescore Top 100 Harmony</h1>
      <IntroText />
      {corpora
        .filter((corpus) => corpus.slug.startsWith("chapters"))
        .map((corpus) => (
          <div key={corpus.slug}>
            <a href={`/corpus/${corpus.slug}`}>
              {corpus.slug.replace(/_/g, " ")}{" "}
              <span style={{ color: "white", fontSize: 10 }}>
                {corpus.midis.length}
              </span>
            </a>
            <br />
          </div>
        ))}
    </div>
  );
};

export default Intro;
