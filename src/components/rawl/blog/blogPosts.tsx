import React from "react";
import styled from "styled-components";
import { s } from "../book/chapters";

// Reuse styling components
const P = styled.p`
  margin-bottom: 1.5em;
  line-height: 1.2;
  font-size: 12pt;
`;

const H = styled.h2`
  margin-top: 40px;
`;

// Blog post container with bottom margin
export const BlogPostContainer = styled.div`
  margin-bottom: 200px;
`;

// Helper components similar to chapters.tsx
export const c = (strings: TemplateStringsArray) => {
  const chord = strings.join("");
  return <span className="chord">{chord}</span>;
};

export const a = (href: string, text: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
);

// Corpus link function similar to A function in chapters.tsx
export const Corpus = (href: string) => (
  <a
    href={`/corpus/${href}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#fff", whiteSpace: "nowrap" }}
  >
    {href}
  </a>
);

export const Direct = styled.span`
  color: #ffa;
  font-size: 14pt;
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
export interface BlogPost {
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
            – Stevie Wonder composed a unique music, he used his own special{" "}
            <i>wonderful</i> mode. I'm not sure exactly which one, but there is
            one.
          </Direct>{" "}
          – Natasha told me over coffee earlier today as we were sitting in
          Pulp, an expat coffee shop in Tbilisi. There wasn't a pun in her
          Russian phrase.
        </P>
        <P>
          I have very poor resolution in my memory around that part of musical
          culture, so I tried to come up with a stub answer:
        </P>
        <P>
          <Direct>
            – Well, if I play Superstition in my head, it's{" "}
            {s`scale:minor_pentatonic`}
            plus {s`dorian:IV`}, just like in soul on average.
          </Direct>{" "}
          – Maybe also a {s`V:soul_dominant`}, as Mark Spicer cleverly{" "}
          {a(
            "https://mtosmt.org/issues/mto.17.23.2/mto.17.23.2.spicer.html",
            "christened it",
          )}
          .
        </P>
        <P>
          <Direct>
            – No, there's something deeper. He has some simple tracks, right,
            but in some others he's doing idiosyncratic complex harmonies which
            I couldn't indentify by ear yet.
          </Direct>
        </P>
        <P>
          I didn't believe it. I've never heard of Stevie Wonder being as unique
          as {Corpus("tom_jobim")} or Frank Zappa. I was without a laptop, so I
          coulnd't start investigating on the spot.
        </P>
        <P>
          <Direct>– How would you approach this puzzle?</Direct> – I asked her.
        </P>
        <P>
          <Direct>
            – Well, I'll play his tracks and start transcribing them on a piano.
          </Direct>
        </P>
        <P>
          I was hooked. These tasks are exactly what I can easily snipe with my
          machinery.
        </P>
        <P>
          <Direct>
            – I can answer that in 10 minutes, if we have MIDI files.
          </Direct>{" "}
          – I said. Well, maybe it'll take three hours, but energetically it
          would feel like 10 minutes, like the most pleasant activity I can
          imagine.
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
          and 2000s karaoke arrangers encoded music in MIDI. The more popular
          the track was, the more versions were created.
        </P>
        <P>
          Ideally I should pick the best file overall by listening to them all
          and comparing to the original recordings. But I don't even have time
          to listen original recordings. And if the mode actually exists, it
          should be so pronounced that I will see it even in dirty data.
        </P>
        <P>
          So for each song I've picked a file with the biggest size. I've
          colored them and marked phrases (white four-bar vertical lines) and
          sections (vertically stacked note staves).
        </P>
        <P>Here's what I've got: {Corpus("stevie_wonder")}</P>
      </>
    ),
  },
  // More blog posts can be added here
];
