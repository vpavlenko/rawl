import * as React from "react";
import { ReadableTextBlock } from "./Book";
import { A } from "./chapters";

const AboutTop100Corpus = (
  <ReadableTextBlock>
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
      . My goal was to find 100 most popular composers and take the most popular
      score from each of them.
    </p>

    <p>
      I've gathered the corpus on Oct 31, 2024. The view count on the most
      popular work doesn't equal the work's popularity even on MuseScore. Eg.
      "River flows in you" has 7.3M on the most popular arrangement, but their
      next top 5 arrangements (out of 687 community scores of this title) have
      1.5M more view counts. I don't add up all view counts across all versions,
      I purely use the top 1 - which makes a bit of a random selection at the
      lower end of the top 100.
    </p>

    <p>
      Some compositions which almost made it to top 100 by a very narrow margin
      are BTS's "I Need You", as well as themes from "Godfather" and "The Pink
      Panther". Next time!
    </p>

    <p>
      I don't use the number of view counts (position within the top 100)
      throughout the book on harmony. I care about the total range of harmonic
      devices used, not about their relative popularity weighted by each work's
      popularity.
    </p>

    <p>
      Neither do I want it to be weighted by the number of distinct pieces of
      the same composer which are popular. So, as a result of my method I
      include "Für Elise" and therefore I exclude "Moonlight" and "Tempest". Out
      of the entire Bach heritage I include exactly a single WTC-1 C major
      prelude. As a benefit, I don't get 7 works of Chopin into the top 100 as I
      would otherwise. Also we cut on Liszt, Joe Hisaishi, Koji Kondo, Ed
      Sheeran etc.
    </p>

    <p>
      In most cases, I take the same arrangement that scored the most views.
      Sometimes I find an arrangement that suits better to my narrative - maybe
      by having less mistakes, original key, better MIDI sound or so.
    </p>

    <p>
      I only take solo piano arrangements because I want to focus on harmony,
      not on the arrangement. For "We Are Number One" the most popular version
      is a band arrangement, and I represent this piece by its piano
      arrangement. "Solo piano" doesn't guarantee that the arrangement is
      actually playable by a mortal two-handed human – some of them incorporate
      more lines like octave bass + chords + melody. Since we study structures
      and harmony in general, rather that a piano-specific idiom, this is
      acceptable.
    </p>

    <p>
      In the special case of "He's a Pirate", I attribute it to Klaus Badelt to
      avoid excluding it because of Hans Zimmer's "Interstellar". Call it data
      manipulation, but they are even written in different minors (major V vs
      natural).
    </p>

    <p>
      I attribute "Runaway" to Kanye West, since the melody and the bass line
      was probably created by him first and only later arranged by Ramin
      Djawadi.
    </p>

    <p>
      In the case of "G Minor Bach" the original harmony was modernized so much
      (departing from {A("prelude-no.-2-bwv-847-in-c-minor")}) that I include
      this track under Luo Ni.
    </p>

    <p>
      Also, I ignore Turkish tabs from Musa Çetiner's account. This is a great
      material which I'd look into separately. I'm not sure these view counts
      are coming from anywhere outside of the Turkish-speaking world.
    </p>

    <p>
      For ABBA, I take "The Winner Takes It All" instead of "Chiquitita",
      because "Chiquitita", although higher in view counts, is represented only
      by its ending.
    </p>

    <p>
      As I understand, the copyright takedowns of community scores didn't affect
      my corpus - even John Williams got represented.
    </p>
  </ReadableTextBlock>
);

export default AboutTop100Corpus;
