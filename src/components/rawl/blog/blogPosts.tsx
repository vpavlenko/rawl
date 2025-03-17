import React from "react";
import styled from "styled-components";

// Reuse styling components
const P = styled.p`
  margin-bottom: 1.5em;
  line-height: 1.6;
`;

const H = styled.h2``;

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

export const Direct = styled.span`
  font-style: italic;
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
            – Stevie Wonder composed a unique music, he uses his own special{" "}
            <i>wonderful</i> mode. I'm not sure exactly which one, but there is
            one.
          </Direct>{" "}
          – Natasha told me over coffee earlier today as we were sitting in
          Pulp, an expat coffee shop in Tbilisi. There wasn't a pun in how she
          told that in Russian, originally.
        </P>
        <P>
          I have very poor resolution in my memory around that part of musical
          culture, so I tried to come up with a stub answer:
        </P>
        <P>
          – Well, if I play Superstition in my head, it's minor pentatonic plus
          dorian IV, just like in soul on average. Maybe also a soul dominant,
          as Mark Spicer it cleverly christened.
        </P>
        <P>
          – No, there's something deeper. He has some basic tracks, right, but
          in some others he's doing idiosyncratic complex harmonies which I
          couldn't indentify by ear yet.
        </P>
        <P>
          I didn't believe it. I've never heard of Stevie Wonder being as unique
          as Tom Jobim or Frank Zappa. I was without a laptop, so I coulnd't
          start investigating on the spot.
        </P>
        <P>– How would you approach this puzzle? – I asked.</P>
        <P>
          – Well, I'll play his tracks and start transcribing them on a piano.
        </P>
        <P>
          I was hooked. These tasks are exactly what I can easily snipe with my
          machinery.
        </P>
        <P>
          – I can answer that in 10 minutes, if we have MIDI files. – I said.
        </P>
        <P>
          I opened Chiptune on my iPad and searched for Stevie Wonder. I didn't
          remember how much tracks we have for him on Lakh - one or fifty? Was
          he as popular as The Beatles?
        </P>
        <P>
          Luckily, I've found 25 songs. Therefore, by the end of today I will
          know what's going on.
        </P>
      </>
    ),
  },
  // More blog posts can be added here
];
