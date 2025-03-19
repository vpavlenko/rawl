import React from "react";
import styled from "styled-components";
import { A, c, k, s } from "../book/chapters";
import { CorpusLink } from "../corpora/CorpusLink";
import type { Chord } from "../legends/chords";

// Reuse styling components

const SPAN = styled.span`
  line-height: 1.3;
  font-size: 12pt;
  color: #c8c8c8;
`;

const P = styled.p`
  margin-bottom: 1.5em;
  line-height: 1.3;
  font-size: 12pt;
  color: #c8c8c8;
`;

const H = styled.h2`
  margin-top: 70px;
  font-family: "Inter", sans-serif;
`;

const a = (href: string, text: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ textDecoration: "underline" }}
  >
    {text}
  </a>
);

// Template string proxy for CorpusLink
const CL = (strings: TemplateStringsArray, ...values: any[]) => {
  // Combine the strings and values to get the full slug
  const slug = strings.reduce((result, str, i) => {
    return result + str + (values[i] || "");
  }, "");
  return <CorpusLink slug={slug} />;
};

const Direct = styled.span`
  color: #fff;
  font-weight: 700;
  font-size: 14pt;
  letter-spacing: 0.03em;
  // font-family: "Playfair Display", serif;
  font-family: "Alegreya", serif;
  // font-family: "Merriweather", serif;
  // font-family: 'Crimson Text', serif;
  // font-family: 'Bitter', serif;
  // font-family: 'Roboto Mono', monospace;
  // font-family: "Josefin Slab", serif;
  // font-family: "Cormorant Garamond", serif;
  // font-family: "DM Serif Display", serif;
  // font-family: 'Source Code Pro', monospace;
`;

const DirectMe = styled.span`
  color: #fff;
  font-weight: 700;
  font-size: 14pt;
  letter-spacing: 0.05em;
  font-family: "Times New Roman", serif;
`;

// Blog post interface
interface BlogPost {
  id: number;
  title: string;
  date: string; // Format: "YYYY-MM-DD"
  titleChords?: Chord[]; // Added titleChords property
  content: () => React.ReactNode;
}

// Blog posts collection
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "I gathered a corpus of Stevie Wonder",
    date: "2025-03-17",
    titleChords: ["Imaj9", "I7", "i7"],
    content: () => (
      <>
        <H>Hooked</H>
        <P>
          <Direct>
            — Stevie Wonder composed in a unique way, he used his own special{" "}
            <i>wonderful</i> mode. I'm not sure exactly which one, but I hear
            it.
          </Direct>{" "}
          — Natasha told me over coffee earlier today as we were sitting in
          Pulp, an expat coffee shop in Tbilisi. (There was no pun in Russian.)
        </P>
        <P>
          I had very poor resolution in my memory around that part of musical
          culture, so I tried to come up with a speculative stub answer:
        </P>
        <P>
          <DirectMe>
            — Well, if I play {A("superstition")} in my head, it uses{" "}
            {s`scale:minor_pentatonic`}. Plus I'd expect {s`dorian:IV`}, like in
            soul on average.
          </DirectMe>{" "}
          — I replied.
        </P>
        <P>
          "Maybe also a {s`V:soul_dominant`}, as Mark Spicer cleverly{" "}
          {a(
            "https://mtosmt.org/issues/mto.17.23.2/mto.17.23.2.spicer.html",
            "christened it",
          )}
          ." I've thought that but I didn't say that because Natasha got a
          degree in Soviet music theory long ago, and people haven't talked
          about soul dominants back then yet.
        </P>
        <P>
          <Direct>
            — No, there's something deeper. He has some simple tracks, right,
            but in some others he's doing idiosyncratic complex harmonies which
            I couldn't indentify by ear yet.
          </Direct>
        </P>
        <P>
          I didn't believe it. I've never heard of Stevie Wonder being as unique
          as {CL`tom_jobim`} or Frank Zappa. I was without a laptop, so I
          coulnd't start investigating on the spot.
        </P>
        <P>
          <DirectMe>— How would you approach this puzzle?</DirectMe> — I asked
          her.
        </P>
        <P>
          <Direct>
            — Well, I'll listen to his tracks and start transcribing them on a
            piano.
          </Direct>
        </P>
        <P>
          I was hooked. These tasks are exactly what I can easily snipe with my
          machinery.
        </P>
        <P>
          <DirectMe>
            — I can answer that in 10 minutes, if we have MIDI files.
          </DirectMe>{" "}
          — I said. Well, maybe it'll take three hours or a day, but
          energetically it would feel like 10 minutes, like the most pleasant
          activity I can imagine. And like something certainly doable.
        </P>
        <P>
          I didn't remember how much tracks we have for him on{" "}
          {a("https://colinraffel.com/projects/lmd/", "Lakh MIDI dataset")} -
          one or fifty? Was he as popular as The Beatles?
        </P>
        <P>
          I opened{" "}
          {a(
            "https://chiptune.app/browse/MIDI/Stevie%20Wonder/",
            "Stevie Wonder on Chiptune",
          )}
          . Luckily, I've found 25 songs. Therefore, by the end of today I will
          know what's going on.
        </P>
        <H>Building the corpus</H>
        <P>
          Lakh has several versions for many songs. I speculate that in the 90s
          and 2000s many karaoke arrangers encoded music in MIDI. One of them
          was even teaching me computer arrangement in 2022 in MCIM. The more
          popular the track was, the more versions of it were circulating in the
          early internet.
        </P>
        <P>
          Ideally I should pick the best file overall by listening to them all
          and comparing to the original recordings. But I don't even have time
          to listen original recordings. And if The Mode actually exists, it
          should be so pronounced that I will see it even in dirty data.
        </P>
        <P>
          So for each song I've simply picked a file with the biggest size. I
          considered that it's a good proxy metric for transcription accuracy.
          Much like when I trust a chord transcriber more if they notate
          something like Am7b5 or Csus2 – over the one who only uses Am and Dm.
        </P>
        <P>
          I've uploaded 25 tracks to Rawl. Next I've annotated them:
          <ul>
            <li>marked tonicizations/modulations ("colorized the notes")</li>
            <li>
              marked phrases (moved white four-bar vertical lines here and
              there)
            </li>
            <li>marked sections (vertically stacked repeating chunks).</li>
          </ul>
        </P>
        <P>
          Here's what I've got: {CL`stevie_wonder`}. As you open each track,
          uncheck (mute) the "Std Drum Kit" / "Drums" in the top right - drum
          parts are very noisy and unrelated to our quest of describing the
          wonderful mode. Also disable the "Bird Tweet" track if you find one -
          it isn't as equally temperamental.
        </P>
        <H>No Wonder</H>
        <P>
          As the very first step, I asked{" "}
          {a(
            "https://chatgpt.com/share/67d85b2d-af54-8005-bae8-3c1f8ad7a2ba",
            "GPT",
          )}{" "}
          and{" "}
          {a(
            "https://claude.ai/share/860a44ca-0946-4292-9e32-ba3c4145cf18",
            "Claude",
          )}{" "}
          to exclude covers. It may be that Natasha specifically loves his
          covers – as I haven't asked her to name any tracks that are
          particularly wonderful. But for the sake of time, to make the corpus
          as stylistically coherent as possible, I'm gonna exclude what's not
          coming directly from his harmonic brain.
        </P>
        <P>
          I've excluded {A("a-place-in-the-sun")}, {A("ebony-ivory")},{" "}
          {A("for-once-in-my-life.2")}, {A("heaven-help-us-all")} and{" "}
          {A("that-s-what-friends-are-for")}.
        </P>
        <P>
          We can also think of them as hold-outs: we can later validate that
          excluded tracks are stylistically far from Stevie Wonder's own tracks.
          This way we can check if our findings present discoveries of Stevie
          Wonder's style rather than of soul in general.
        </P>
        <H>Modes</H>
        <P>As the very second step, I've listed tonic chords for each track:</P>

        <div style={{ position: "relative", width: "100%", margin: "2em 0" }}>
          <table
            style={{
              position: "relative",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100vw",
              maxWidth: "100vw",
              borderCollapse: "collapse",
              marginBottom: "1.5em",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{ textAlign: "left", padding: "8px" }}
                >{c`Imaj9`}</th>
                <th
                  style={{ textAlign: "left", padding: "8px" }}
                >{c`Imaj7`}</th>
                <th style={{ textAlign: "left", padding: "8px" }}>{c`I`}</th>
                <th style={{ textAlign: "left", padding: "8px" }}>{c`I7`}</th>
                <th style={{ textAlign: "left", padding: "8px" }}>{c`i7`}</th>
                <th style={{ textAlign: "left", padding: "8px" }}>{c`i`}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ verticalAlign: "top" }}>
                <td style={{ textAlign: "left", padding: "8px" }}>
                  <div>{A("do-i-do")}</div>
                  <div>{A("golden-lady.1")}</div>
                  <div>{A("you-are-the-sunshine-of-my-life.5")}</div>
                </td>
                <td style={{ textAlign: "left", padding: "8px" }}>
                  <div>{A("for-your-love")}</div>
                  <div>{A("my-cherie-amour.1")}</div>
                  <div>{A("send-one-your-love")}</div>
                </td>
                <td style={{ textAlign: "left", padding: "8px" }}>
                  <div>{A("happy-birthday-stevie-wonder")}</div>
                  <div>{A("i-just-called-to-say-i-love-you.6")}</div>
                  <div>{A("isn-t-she-lovely-2")}</div>
                  <div>{A("overjoyed.1")}</div>
                  <div>{A("ribbon-in-the-sky.1")}</div>
                  <div>{A("sir-duke")}</div>
                </td>
                <td style={{ textAlign: "left", padding: "8px" }}>
                  <div>{A("boogie-on-reggae-woman.1")}</div>
                  <div>{A("signed-sealed-delivered-i-m-yours.1")}</div>
                  <div>{A("uptight-everything-s-alright")}</div>
                </td>
                <td style={{ textAlign: "left", padding: "8px" }}>
                  <div>{A("higher-ground.2")}</div>
                  <div>{A("i-wish.1")}</div>
                  <div>{A("part-time-lover.3")}</div>
                  <div>{A("superstition")}</div>
                </td>
                <td style={{ textAlign: "left", padding: "8px" }}>
                  <div>{A("don-t-you-worry-bout-a-thing")}</div>
                  <div>{A("master-blaster")}</div>
                  <div>{A("golden-lady.1")} (last section)</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <P>
          Maybe looking at these modes will be fruitful eventually. For now I
          want to group together some harmonic devices that Stevie Wonder uses
          throughout: {s`blog_1:line_clichee`} {s`blog_1:mario_cadence`}
        </P>

        <H>One-liner analyses</H>

        <P>
          Next I want to briefly analyse harmony of each track. I'll go from
          easiest to trickiest. The easiest group is {c`I7`}:
        </P>
        <P>
          {A("boogie-on-reggae-woman.1")}: {c`II7 V7 I7 IV7 bVII7`} – mostly
          dominant seventh chords
        </P>
        <P>
          {A("uptight-everything-s-alright")}: {s`shuttle:mixolydian`}{" "}
          throughout
        </P>
        <P>
          {A("signed-sealed-delivered-i-m-yours.1")}:{" "}
          {c`I I7 vi7 ii7 IV Vsoulii I`}, diatonic major with {c`b7`} instead of{" "}
          {c`7`}
        </P>

        <H>Conclusion</H>

        <P>
          This turned out to be a longer project than I expected. I've spent a
          day gathering a corpus, but it'll take more days to process all
          harmonies in it and make detailed descriptions on what Stevie Wonder
          does.
        </P>
      </>
    ),
  },
  {
    id: 2,
    title: "Types of dominant V",
    date: "2025-03-18",
    titleChords: ["V9", "Vb9", "V+", "V+s9", "Vsus4", "Vsoul"],
    content: () => (
      <>
        <H>Dominant V</H>
        <P>
          The most common harmonic motion observed by any Western music
          theoriests is dominant to tonic: {c`V I`} and {c`V7 I`} in major,{" "}
          {c`V i`} and {c`V7 i`} in minor. It usually happens at the end of the
          phrase or a section.
        </P>
        <P>
          There are various extra notes that can be stacked upon {c`V`} in this
          context. In common practice harmony, it's either {c`V`} or {c`V7`}, in
          Romantic style {s`V:9`} and {s`V:b9`} is frequent, in jazz harmony
          various tension tones are added: {s`V:augmented`}, {s`V:aug_s9`}. Plus
          there's a ubiquitous voice-leading-turned-chord {s`V:sus4`} which, in
          last decades, can be left {s`V:sus4_unresolved`}. In soul there's{" "}
          {s`V:soul_dominant`}.
        </P>
      </>
    ),
  },

  {
    id: 3,
    title: "Whole-tone scale",
    date: "2025-03-19",
    titleChords: ["1", "2", "3", "#4", "b6", "b7"],
    content: () => (
      <>
        <H>Two variants</H>
        <P>
          If a chromatic scale is the alphabet of Western music, whole-tone
          scale is the easiest object to build on it. You should simply omit all
          even notes. Or, equivalently, omit all odd notes.
        </P>
        <P>
          So, from {c`1 b2 2 b3 3 4 #4 5 b6 6 b7 7`} we get two scales:
          <ul>
            <li>{c`1 2 3 #4 b6 b7`}</li>
            <li>{c`b2 b3 4 5 6 7`}</li>
          </ul>
        </P>
        <P>Try it: {k("major-seconds")}</P>
        <P>
          The most important property of it is its complete symmetry. All
          intervals are the same. Therefore, out of context there's no way to
          decide, which of its six notes should be chosen as the main, {c`1`}{" "}
          note. This happens for{" "}
          {a(
            "https://en.wikipedia.org/wiki/Mode_of_limited_transposition",
            "Modes of limited transposition",
          )}
        </P>
        <P>
          This isn't a typical object in Western functional harmony. Therefore,
          in my color scheme both scales look like random sets of colors. That's
          because they are used rarely - mostly in 20th century. A modern,
          fresh, spicy beast.
        </P>
        <P>Examples in my corpus: {s`scale:whole-tone`}</P>
        <P>
          In jazz, it can be played over a {c`V7`} chord:{" "}
          <ul>
            <li>{A("coconut-mall---mario-kart-wii")}</li>
            <li>
              {A("oscar-peterson---jazz-exercises-for-piano---exercise-4")}
            </li>
            <li>{A("magic-waltz")}</li>
            <li>
              {A("vizisi")} over an applied {c`V7/ii`}
            </li>
          </ul>
        </P>

        <P>It's usually used once in a piece.</P>
      </>
    ),
  },
  {
    id: 4,
    title: "Schubert, Two chords in major",
    date: "2025-02-23",
    titleChords: ["V7", "I", "V7", "I"],
    content: () => (
      <>
        <H>Schubert's Originaltänze op. 9</H>
        <P>
          In 1821, when Schubert was 24, he published a set of 36 waltzes known
          as Originaltänze op. 9 (D 365). Most of them are here:{" "}
          {CL`schubert_op9_d365`}
        </P>
        <P>
          I've hand-picked four of them which have the simplest organization:
          they consist of just two chords: {c`I`} and {c`V7`}.
        </P>
        <P>
          Here they are:
          <ul>
            <li>{A("schubert_d365_09")}</li>
            <li>{A("wima.e480-schubert_de.-tanz-d.365.25")}</li>
            <li>{A("wima.1124-schubert_de.-tanz-d.365.26")}</li>
            <li>{A("wima.4be9-schubert_de.-tanz-d.365.28")}</li>
          </ul>
        </P>
        <H>Analysis</H>
        <P>
          These waltzes are remarkable for their simplicity, yet they remain
          charming and musically interesting. Schubert manages to create melodic
          variety while restricting himself to just two chords: the tonic (I)
          and dominant seventh (V7).
        </P>
        <P>
          Waltz #25 is particularly interesting in how it establishes a clear
          rhythmic pattern in the left hand while the right hand melody dances
          above it with grace.
        </P>
        <P>
          For composers, these pieces demonstrate how much can be achieved with
          minimal harmonic material when combined with thoughtful melodic
          writing and rhythmic consistency.
        </P>
        <P>
          I recommend studying waltz #25{" "}
          {A("wima.e480-schubert_de.-tanz-d.365.25")} in detail. The left hand
          provides a steady rhythmic foundation while the melody contains both
          stepwise motion and elegant leaps.
        </P>
        <P>
          For another example in a similar style, check out "Les Cloches du
          Monastère" by Alfred Lefébure-Wély.
        </P>
      </>
    ),
  },
  {
    id: 5,
    title: "Gibran Alcocer, Four-chord Loops of Triads in Natural Minor",
    date: "2025-03-02",
    titleChords: ["i", "bVI", "bVII", "iv"],
    content: () => (
      <>
        <H>The Modern Sound of Looping Minor Triads</H>
        <P>
          {CL`gibran_alcocer`}'s compositions sound distinctly modern. They
          evoke the same feeling as {CL`yann_tiersen`}'s music for Amélie or{" "}
          {CL`evgeny_grinko`}'s compositions. But what makes this style so
          recognizable?
        </P>
        <P>
          After analyzing several pieces, I've identified some key
          characteristics that define this modern piano style.
        </P>
        <H>Musical Analysis</H>
        <P>
          Two pieces in particular showcase these elements clearly:
          <ul>
            <li>{A("idea-15---gibran-alcocer")}</li>
            <li>{A("idea-10---gibran-alcocer")}</li>
          </ul>
        </P>
        <P>
          The harmonic foundation of these pieces lies in natural minor triads:
        </P>
        <P>
          These compositions rely on a limited selection of chords from the
          natural minor scale:
        </P>
        <P>
          <ul>
            <li>{c`i`} - minor tonic</li>
            <li>{c`iio`} - diminished supertonic</li>
            <li>{c`bIII`} - flat mediant</li>
            <li>{c`iv`} - minor subdominant</li>
            <li>{c`v`} - minor dominant</li>
            <li>{c`bVI`} - flat submediant</li>
            <li>{c`bVII`} - flat subtonic</li>
          </ul>
        </P>
        <P>
          What's particularly distinctive is Alcocer's use of{" "}
          {s`progression:four_chords`} as the structural foundation. This
          approach creates a hypnotic, repeating framework that's both
          predictable and emotionally evocative.
        </P>
        <H>Rhythmic Structure</H>
        <P>
          Another distinctive feature in Alcocer's work is his use of{" "}
          {s`hypermeter:extra_bar_last_chord_in_loop`}. This technique adds a
          slight asymmetry to what would otherwise be perfectly square phrases,
          creating a sense of gentle forward momentum.
        </P>
        <P>
          For those interested in exploring similar sounds, I recommend studying
          these additional examples from other composers:
        </P>
        <P>
          <ul>
            <li>{A("i-wanted-to-leave---syml")}</li>
            <li>{A("fabrizio-paterlini---snow")}</li>
          </ul>
        </P>
        <P>
          These pieces share a similar emotional quality and harmonic approach,
          though each composer brings their own unique voice to the style.
        </P>
      </>
    ),
  },
];
