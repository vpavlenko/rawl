import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import ChordStairs, { MODES } from "./ChordStairs";
import { InlinePianoLegend, PianoLegend } from "./PianoLegend";
import landingLeftSideImage from "./landing_left_side.png";
import landingRightSideImage from "./landing_right_side.png";

const DropBox = styled.div`
  border: 4px dashed #0f0; /* Neon green dashed border */
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  transition: all 0.2s ease-in-out;
  background: #000; /* Black background */
  box-shadow: 0 0 10px #0f0; /* Neon glow effect */
`;

const Icon = styled(FontAwesomeIcon)`
  font-size: 48px;
  color: #0f0; /* Neon green color */
`;

const Text = styled.p`
  margin-top: 15px;
  font-size: 16px;
  color: #0f0; /* Neon green text */
`;

const FileDropBox: React.FC = () => (
  <DropBox>
    <Icon icon={faMusic} />
    <Text>Drag & Drop your MIDI files here</Text>
  </DropBox>
);

const NeonLink = styled.a`
  display: inline-block;
  padding: 2px 6px; // Adjust padding as needed
  color: #fff; // White text color for the neon effect
  font-size: 17px;
  font-family: "Helvetica Neue", Arial, sans-serif; // Sexy sans-serif font
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 40px;

  &:hover,
  &:visited:hover {
    color: #fff; // Lighter pink color on hover for added interaction
    text-shadow:
      0 0 5px #660,
      0 0 15px #660;
  }
`;

const Example: React.FC<{ name: string; pathname: string }> = ({
  name,
  pathname,
}) => (
  <NeonLink key={pathname} href={pathname} target="_blank">
    {name}
  </NeonLink>
);

const Container = styled.div`
  display: flex;
  width: 100vw; // Set container width to 100% of the viewport width
  justify-content: center; // Center the children horizontally
`;

const Side = styled.div<{ sideImage: string }>`
  flex-grow: 1;
  background-size: cover;
  background-position: center;
  // Basic structure for the background-image, actual gradient will be defined in LeftSide and RightSide
  background-image: url(${(props) => props.sideImage});
`;

const LeftSide = styled(Side)`
  margin-right: 20px;
  background-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 1) 100%
    ),
    url(${(props) => props.sideImage});
`;

const RightSide = styled(Side)`
  margin-left: 20px;
  background-image: linear-gradient(
      to left,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 1) 100%
    ),
    url(${(props) => props.sideImage});
`;

const Content = styled.div`
  width: 900px; // Set a fixed width for the content
  margin: auto; // Center the content block horizontally within its container

  display: flex; // Enable flexbox for this container
  flex-direction: column; // Stack children vertically
  justify-content: center; // Center children vertically in the container
  align-items: center; // Center children horizontally in the container

  text-align: center; // Center text inside the content (if needed)

  @media (max-width: 900px) {
    width: 100%; // Make width 100% on smaller screens
    padding: 0 20px; // Add padding to avoid touching the screen edges
  }
`;

const ChordStairsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 100px;
  margin-top: 30px;
  margin-bottom: 30px;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const LegendAndMetaphorsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 100px;
  margin-top: 30px;
  margin-bottom: 30px;

  @media (max-width: 900px) {
    gap: 20px;
  }
`;

const Section: React.FC<{
  title: string;
  children: ReactNode;
  scale?: number[];
}> = ({ title, children, scale }) => {
  return (
    <div
      style={{
        marginTop: 50,
        textAlign: "left",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 5,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <span style={{ color: "gray", width: 120 }}>{title} </span>
        {scale && <InlinePianoLegend enabledPitches={scale} />}
      </div>
      <div>{children}</div>
    </div>
  );
};

const LandingPage = () => (
  <Container>
    <LeftSide sideImage={landingLeftSideImage} />

    <Content>
      <div
        style={{
          fontSize: 40,
          fontFamily: "Verdana, serif",
          marginTop: 40,
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        See Western music in 12 colors
      </div>
      <div style={{ margin: "100px 0 100px 0" }}>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/uW7r-nehi7o?si=zjR312K-CGekpBwU"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ border: "0px" }}
        />
      </div>
      <LegendAndMetaphorsContainer>
        <div>
          <PianoLegend />
        </div>
        <div>
          <div
            style={{
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            <span>
              <span style={{ fontWeight: 900 }}>
                the tonic note is always white
              </span>
            </span>
            <span>
              <span className="landing_gradient_green">
                tonic chords have a green pitch
              </span>
            </span>
            <span>
              <span className="landing_gradient_cool">
                predominants are in cool colors
              </span>
            </span>
            <span>
              <span className="landing_gradient_warm">
                dominants are in warm colors
              </span>
            </span>
            <span>
              <span className="landing_gradient_bright">
                major mode is brighter
              </span>
            </span>
            <span>
              <span className="landing_gradient_dark">
                minor mode is darker
              </span>
            </span>
          </div>
        </div>
      </LegendAndMetaphorsContainer>
      <ChordStairsContainer>
        <ChordStairs mode={MODES[1]} />
        <ChordStairs mode={MODES[0]} />
      </ChordStairsContainer>
      <Section title="major" scale={[0, 2, 4, 5, 7, 9, 11]}>
        <Example name={"Feliz Navidad"} pathname={"f/Feliz_Navidad"} />
        <Example
          name={"John Lennon – Imagine"}
          pathname={"f/John_Lennon_Imagine"}
        />
        <Example
          name={"Ed Sheeran – Perfect"}
          pathname={"f/Ed_Sheeran_Perfect"}
        />
        <Example name={"Jingle Bell Rock"} pathname={"f/Jingle_Bell_Rock"} />
        <Example
          name={"Joe Hisaishi – Summer"}
          pathname={"f/Summer_Joe_Hisaishi"}
        />
        <Example
          name={"Super Mario Bros"}
          pathname={"f/Super_Mario_Bros_Main_Theme"}
        />
        <Example name={"Disney – Up"} pathname={"f/Disney_Pixar_Up_Theme"} />
        <Example
          name={"Yiruma – Kiss the Rain"}
          pathname={
            "f/Kiss_The_Rain_-_Yiruma_-_10th_Anniversary_Version_Piano_Updated_2019"
          }
        />
        <Example
          name={"Julius Fučík – Entrance of the Gladiators"}
          pathname={"f/Entry_of_the_Gladiators_-_Julius_Fuk_-_1897"}
        />
      </Section>
      <Section title="natural minor" scale={[0, 2, 3, 5, 7, 8, 10]}>
        <Example
          name={"Game of Thrones"}
          pathname={"f/Game_of_Thrones_Easy_piano"}
        />
        <Example name={"Hallelujah"} pathname={"f/Hallelujah"} />
        <Example name={"Jolene"} pathname={"f/Jolene"} />
        <Example
          name={"John Legend – All of Me"}
          pathname={"f/All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK"}
        />
        <Example name={"Minecraft – Sweden"} pathname={"f/Sweden_Minecraft"} />
        <Example
          name={"Yann Tiersen – Amélie"}
          pathname={"f/Yann_Tiersen_Amelie"}
        />
        <Example name={"Despacito"} pathname={"f/Despacito"} />
      </Section>
      <Section title="harmonic minor" scale={[0, 2, 3, 5, 7, 8, 11]}>
        <Example
          name={"Imagine Dragons – Believer"}
          pathname={"f/Believer_-_Imagine_Dragons"}
        />
        <Example name={"Bella Ciao"} pathname={"f/Bella_Ciao"} />
        <Example
          name={"Requiem for a Dream"}
          pathname={"f/Requiem_for_a_Dream"}
        />
      </Section>
      <Section title="mixed minor" scale={[0, 2, 3, 5, 7, 8, 10, 11]}>
        <Example name={"Tetris"} pathname={"f/Tetris_Theme"} />
        <Example
          name={"Tetris (arr. Kyle Landry)"}
          pathname={
            "f/Kyle_Landrys_Tetris_Theme_Variations_for_Piano_SoloKorobeiniki"
          }
        />
        <Example
          name={"Pirates of the Caribbean"}
          pathname={"f/Pirates_of_the_Caribbean_-_Hes_a_Pirate"}
        />
        <Example
          name={"Carol of the Bells"}
          pathname={"f/Carol_of_the_Bells"}
        />
        <Example name={"Godfather"} pathname={"f/Godfather"} />
        <Example name={"Pokémon"} pathname={"f/Pokemon_Theme_Song"} />
        <Example name={"Gravity Falls"} pathname={"f/Gravity_Falls_Opening"} />
      </Section>
      <Section title="blues scale" scale={[0, 3, 5, 6, 7, 10]}>
        <Example name={"Pink Panther"} pathname={"f/Pink_Panther"} />
        <Example
          name={"Megalovania"}
          pathname={"f/Undertale_-_Megalovania_Piano_ver._3"}
        />
        <Example name={"Hit the Road Jack"} pathname={"f/Hit_the_Road_Jack"} />
      </Section>
      <Section title="relative keys">
        <Example
          name={"Fly Me to the Moon"}
          pathname={"f/Fly_Me_to_the_Moon"}
        />
        <Example name={"Titanic"} pathname={"f/Titanic"} />
      </Section>
      <Section title="parallel keys">
        <Example
          name={"George Bizet – Habanera (from Carmen)"}
          pathname={"f/Habanera_-_Piano_Solo_-_Georges_Bizet"}
        />
        <Example name={"Gymnopedie"} pathname={"f/Gymnopdie_No._1__Satie"} />
        <Example
          name={"Mozart – Piano Sonata No. 11, mov. 1 (variations)"}
          pathname={"f/mozart_sonata_11_1st"}
        />
      </Section>
      <Section title="modulations">
        <Example
          name={"Attack on Titan"}
          pathname={"f/Attack_on_Titan_Shinzou_wo_Sasageyo"}
        />
        <Example
          name={"Disney – Frozen"}
          pathname={"f/Let_It_Go_Disney_Frozen"}
        />
        <Example
          name={"Chopin – Military Polonaise"}
          pathname={"f/chopin_military_polonaise"}
        />

        <Example
          name={"Beethoven – Sonata No. 5, mov. 1"}
          pathname={"f/beethoven_sonate_5_1st"}
        />
        <Example
          name={"George Bizet – Prelude to Act 1 of Carmen"}
          pathname={"f/Prlude_to_Act_1_of_Carmen_-_Piano_Solo_-_Bizet"}
        />
      </Section>
      <Section title="ragtimes by Scott Joplin">
        <Example
          name={"The Entertainer"}
          pathname={"f/the_entertainer_scott_joplin"}
        />
        <Example
          name={"Maple Leaf Rag"}
          pathname={"f/Maple_Leaf_Rag_Scott_Joplin"}
        />
        <Example
          name={"Pine Apple Rag"}
          pathname={"f/Pine_Apple_Rag_-_Scott_Joplin_-_1908.mscz"}
        />
      </Section>
      <Section title="jazz">
        <Example name={"Misty"} pathname={"f/Misty_piano_solo"} />
        <Example name={"White Christmas"} pathname={"f/white_christmas"} />
        <Example name={"Tamás Deák – Vízisí"} pathname={"f/vizisi"} />
        <Example
          name={"George Gershwin – Rhapsody in Blue"}
          pathname={"f/Gershwin_Rhapsody_in_Blue_Piano_solo"}
        />
      </Section>
      <Section title="sheet music">
        <Example
          name={"Scott Joplin – The Entertainer"}
          pathname="https://musescore.com/user/39031562/scores/15664612"
        />
        <Example
          name={"Jingle Bell Rock (arr. John Herbert)"}
          pathname="https://musescore.com/user/39031562/scores/15670804"
        />
        <Example
          name={"Jingle Bell Rock (arr. SkyRecon, in D)"}
          pathname="https://musescore.com/user/39031562/scores/15671017"
        />
      </Section>
      <Section title="James Hepokoski. A&nbsp;Sonata Theory Handbook (2020)">
        <Example
          name={"Mozart, Piano Sonata in B-flat, K. 333/i (Allegro)"}
          pathname={"f/sonata_no_13_1st_movement_k_333"}
        />
        <Example
          name={
            "Mozart, Symphony No. 34 in C, K. 338/ii (Andante di molto più tosto Allegretto)"
          }
          pathname={
            "c/Classical%20MIDI/Mozart/Symphonies/Symphony%20No.%2034,%20K338%20–%20II.%20Andante%20di%20molto.mid"
          }
        />
        <Example
          name={`Haydn, Symphony No. 100 in G, "Military," first movement (Adagio-Allegro)`}
          pathname={"f/haydn_100_1"}
        />
        <Example
          name={`Haydn, String Quartet in G, op. 76 no. 1/i (Allegrocon spirito)`}
          pathname={
            "f/string_quartet_in_g_major_hob_iii_75_op_76_no_1_joseph_haydn"
          }
        />
        <Example
          name={`Beethoven, Symphony No. 2 in D, op. 36/i (Adagio molto - Allegro con brio)`}
          pathname={
            "c/Classical%20MIDI/Beethoven/Symphony%20No.%202%20(Lucarelli)%20-%201.mid"
          }
        />
        <Example
          name={`Beethoven, String Quartet in E Minor,op. 59no. 2/i (Allegro)`}
          pathname={"f/string_quartet_no_8_in_e_minor_opus_59_rasumovsky_no_2"}
        />
        <Example
          name={`Schubert, String Quartet No. 14 in D Minor, D. 810/i (Allegro)`}
          pathname={"f/schubert_death_and_maiden_string_quartet"}
        />
      </Section>

      {/* <Example
          name={"Für Elise"}
          pathname={"f/Fr_Elise"}
        /> */}

      {/* <Example
          name={"Interstellar"}
          pathname={"f/Interstellar"}
        />
        <Example
          name={"Moonlight Sonata"}
          pathname={
            "f/Sonate_No._14_Moonlight_1st_Movement"
          }
        /> */}

      {/* <Example
          name={"Minecraft – Wet Hands"}
          pathname={
            "f/Wet_Hands_Minecraft"
          }
        /> */}

      {/* <Example
          name={"Ed Sheeran – Shape of You"}
          pathname={
            "f/Ed_Sheeran_Shape_of_you"
          }
        /> */}
      {/* <Example
          name={"Ed Sheeran – Photograph"}
          pathname={
            "f/Photograph_Ed_Sheeran"
          }
        /> */}

      {/* <Example
          name={"Billie Eilish – Bad Guy"}
          pathname={
            "f/Billie_Eilish_Bad_Guy"
          }
        /> */}
      <div style={{ marginTop: 100 }}>
        <FileDropBox />
      </div>
      <div style={{ marginTop: 100 }}>
        <Link to={{ pathname: "/course" }} style={{ fontSize: 26 }}>
          A course on rock harmony and arrangement
        </Link>
      </div>
      <div style={{ marginTop: 100 }}>
        I'm{" "}
        <a href="mailto:cxielamiko@gmail.com" target="_blank" rel="noreferrer">
          Vitaly Pavlenko
        </a>
        . I explain my approach in{" "}
        <a
          href="https://twitter.com/vitalypavlenko/status/1771820942680830417"
          target="_blank"
          rel="noreferrer"
        >
          39 tweets
        </a>
        . The code is{" "}
        <a
          href="https://github.com/vpavlenko/rawl"
          target="_blank"
          rel="noreferrer"
        >
          on Github
        </a>
        . I also collect{" "}
        <a
          href="https://github.com/vpavlenko/study-music"
          target="_blank"
          rel="noreferrer"
        >
          resources on music theory
        </a>
      </div>
    </Content>
    <RightSide sideImage={landingRightSideImage} />
  </Container>
);

export default LandingPage;
