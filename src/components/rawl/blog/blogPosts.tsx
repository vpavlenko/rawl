import React from "react";
import styled from "styled-components";
import { A, c, s } from "../book/chapters";
import { CorpusLink } from "../corpora/CorpusLink";

// Reuse styling components
const P = styled.p`
  margin-bottom: 1.5em;
  line-height: 1.3;
  font-size: 12pt;
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
  // color: #ddd;
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
  // font-family: 'DM Serif Display', serif;
  // font-family: 'Source Code Pro', monospace;
`;

// Blog post interface
interface BlogPost {
  id: number;
  title: string;
  date: string; // Format: "YYYY-MM-DD"
  content: () => React.ReactNode;
}

// Blog posts collection
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Stevie Wonder's wonderful mode",
    date: "2025-03-17",
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
          <Direct>
            — Well, if I play {A("superstition")} in my head, it uses{" "}
            {s`scale:minor_pentatonic`}
            plus {s`dorian:IV`}, like soul on average.
          </Direct>{" "}
          — I replied.
        </P>
        <P>
          “Maybe also a {s`V:soul_dominant`}, as Mark Spicer cleverly{" "}
          {a(
            "https://mtosmt.org/issues/mto.17.23.2/mto.17.23.2.spicer.html",
            "christened it",
          )}
          .” I've thought that but I didn't say that because Natasha got a
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
          <Direct>— How would you approach this puzzle?</Direct> — I asked her.
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
          <Direct>
            — I can answer that in 10 minutes, if we have MIDI files.
          </Direct>{" "}
          — I said. Well, maybe it'll take three hours or a day, but
          energetically it would feel like 10 minutes, like the most pleasant
          activity I can imagine. And like something certainly doable.
        </P>
        <P>
          I opened Chiptune on my iPad and searched for Stevie Wonder. I didn't
          remember how much tracks we have for him on Lakh MIDI dataset - one or
          fifty? Was he as popular as The Beatles?
        </P>
        <P>
          Luckily, I've found 25 songs. Therefore, by the end of today I will
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
        <P>
          As the very second step, I grouped similar tracks together: minors{" "}
          {c`i`} with minors and majors {c`I`} with majors.
        </P>
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
        <P>What notes does Stevie Wonder prefer upon the trailing {c`V`}?</P>
      </>
    ),
  },
  // More blog posts can be added here
];
