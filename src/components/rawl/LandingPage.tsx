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
        <Example
          name={"Feliz Navidad"}
          pathname={"/browse/static/musescore_manual?song=Feliz_Navidad.mid"}
        />
        <Example
          name={"John Lennon – Imagine"}
          pathname={
            "/browse/static/musescore_manual?song=John_Lennon_Imagine.mid"
          }
        />
        <Example
          name={"Ed Sheeran – Perfect"}
          pathname={
            "/browse/static/musescore_manual?song=Ed_Sheeran_Perfect.mid"
          }
        />
        <Example
          name={"Jingle Bell Rock"}
          pathname={"/browse/static/musescore_manual?song=Jingle_Bell_Rock.mid"}
        />
        <Example
          name={"Joe Hisaishi – Summer"}
          pathname={
            "/browse/static/musescore_manual?song=Summer_Joe_Hisaishi.mid"
          }
        />
        <Example
          name={"Super Mario Bros"}
          pathname={
            "/browse/static/musescore_manual?song=Super_Mario_Bros_Main_Theme.mid"
          }
        />
        <Example
          name={"Disney – Up"}
          pathname={
            "/browse/static/musescore_manual?song=Disney_Pixar_Up_Theme.mid"
          }
        />
        <Example
          name={"Yiruma – Kiss the Rain"}
          pathname={
            "/browse/static/musescore_manual?song=Kiss_The_Rain_-_Yiruma_-_10th_Anniversary_Version_Piano_Updated_2019.mid"
          }
        />
        <Example
          name={"Julius Fučík – Entrance of the Gladiators"}
          pathname={
            "/browse/static/musescore_manual?song=Entry_of_the_Gladiators_-_Julius_Fuk_-_1897.mid"
          }
        />
      </Section>
      <Section title="natural minor" scale={[0, 2, 3, 5, 7, 8, 10]}>
        <Example
          name={"Game of Thrones"}
          pathname={
            "/browse/static/musescore_manual?song=Game_of_Thrones_Easy_piano.mid"
          }
        />
        <Example
          name={"Hallelujah"}
          pathname={"/browse/static/musescore_manual?song=Hallelujah.mid"}
        />
        <Example
          name={"Jolene"}
          pathname={"/browse/static/musescore_manual?song=Jolene.mid"}
        />
        <Example
          name={"John Legend – All of Me"}
          pathname={
            "/browse/static/musescore_manual?song=All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK.mid"
          }
        />
        <Example
          name={"Minecraft – Sweden"}
          pathname={"/browse/static/musescore_manual?song=Sweden_Minecraft.mid"}
        />
        <Example
          name={"Yann Tiersen – Amelie"}
          pathname={
            "/browse/static/musescore_manual?song=Yann_Tiersen_Amelie.mid"
          }
        />
        <Example
          name={"Despacito"}
          pathname={"/browse/static/musescore_manual?song=Despacito.mid"}
        />
      </Section>
      <Section title="harmonic minor" scale={[0, 2, 3, 5, 7, 8, 11]}>
        <Example
          name={"Imagine Dragons – Believer"}
          pathname={
            "/browse/static/musescore_manual?song=Believer_-_Imagine_Dragons.mid"
          }
        />
        <Example
          name={"Bella Ciao"}
          pathname={"/browse/static/musescore_manual?song=Bella_Ciao.mid"}
        />
        <Example
          name={"Requiem for a Dream"}
          pathname={
            "/browse/static/musescore_manual?song=Requiem_for_a_Dream.mid"
          }
        />
      </Section>
      <Section title="mixed minor" scale={[0, 2, 3, 5, 7, 8, 10, 11]}>
        <Example
          name={"Tetris"}
          pathname={"/browse/static/musescore_manual?song=Tetris_Theme.mid"}
        />
        <Example
          name={"Tetris (arr. Kyle Landry"}
          pathname={
            "/browse/static/musescore_manual?song=Kyle_Landrys_Tetris_Theme_Variations_for_Piano_SoloKorobeiniki.mid"
          }
        />
        <Example
          name={"Pirates of the Caribbean"}
          pathname={
            "/browse/static/musescore_manual?song=Pirates_of_the_Caribbean_-_Hes_a_Pirate.mid"
          }
        />
        <Example
          name={"Carol of the Bells"}
          pathname={
            "/browse/static/musescore_manual?song=Carol_of_the_Bells.mid"
          }
        />
        <Example
          name={"Godfather"}
          pathname={"/browse/static/musescore_manual?song=Godfather.mid"}
        />
        <Example
          name={"Pokémon"}
          pathname={
            "/browse/static/musescore_manual?song=Pokemon_Theme_Song.mid"
          }
        />
        <Example
          name={"Gravity Falls"}
          pathname={
            "/browse/static/musescore_manual?song=Gravity_Falls_Opening.mid"
          }
        />
      </Section>
      <Section title="blues scale" scale={[0, 3, 5, 6, 7, 10]}>
        <Example
          name={"Pink Panther"}
          pathname={"/browse/static/musescore_manual?song=Pink_Panther.mid"}
        />
        <Example
          name={"Megalovania"}
          pathname={
            "/browse/static/musescore_manual?song=Undertale_-_Megalovania_Piano_ver._3.mid"
          }
        />
        <Example
          name={"Hit the Road Jack"}
          pathname={
            "/browse/static/musescore_manual?song=Hit_the_Road_Jack.mid"
          }
        />
      </Section>
      <Section title="relative keys">
        <Example
          name={"Fly Me to the Moon"}
          pathname={
            "/browse/static/musescore_manual?song=Fly_Me_to_the_Moon.mid"
          }
        />
        <Example
          name={"Titanic"}
          pathname={"/browse/static/musescore_manual?song=Titanic.mid"}
        />
      </Section>
      <Section title="parallel keys">
        <Example
          name={"George Bizet – Habanera (from Carmen)"}
          pathname={
            "/browse/static/musescore_manual?song=Habanera_-_Piano_Solo_-_Georges_Bizet.mid"
          }
        />
        <Example
          name={"Gymnopedie"}
          pathname={
            "/browse/static/musescore_manual?song=Gymnopdie_No._1__Satie.mid"
          }
        />
        <Example
          name={"Mozart – Piano Sonata No. 11, mov. 1 (variations)"}
          pathname={
            "/browse/static/musescore_manual?song=mozart_sonata_11_1st.mid"
          }
        />
      </Section>
      <Section title="modulations">
        <Example
          name={"Attack on Titan"}
          pathname={
            "/browse/static/musescore_manual?song=Attack_on_Titan_Shinzou_wo_Sasageyo.mid"
          }
        />
        <Example
          name={"Disney – Frozen"}
          pathname={
            "/browse/static/musescore_manual?song=Let_It_Go_Disney_Frozen.mid"
          }
        />
        <Example
          name={"Chopin – Military Polonaise"}
          pathname={
            "/browse/static/musescore_manual?song=chopin_military_polonaise.mid"
          }
        />

        <Example
          name={"Beethoven – Sonata No. 5, mov. 1"}
          pathname={
            "/browse/static/musescore_manual?song=beethoven_sonate_5_1st.mid"
          }
        />
        <Example
          name={"George Bizet – Prelude to Act 1 of Carmen"}
          pathname={
            "/browse/static/musescore_manual?song=Prlude_to_Act_1_of_Carmen_-_Piano_Solo_-_Bizet.mid"
          }
        />
      </Section>
      <Section title="ragtimes by Scott Joplin">
        <Example
          name={"The Entertainer"}
          pathname={
            "/browse/static/musescore_manual?song=the_entertainer_scott_joplin.mid"
          }
        />
        <Example
          name={"Maple Leaf Rag"}
          pathname={
            "/browse/static/musescore_manual?song=Maple_Leaf_Rag_Scott_Joplin.mid"
          }
        />
        <Example
          name={"Pine Apple Rag"}
          pathname={
            "/browse/static/musescore_manual?song=Pine_Apple_Rag_-_Scott_Joplin_-_1908.mscz.mid"
          }
        />
      </Section>
      <Section title="jazz">
        <Example
          name={"Misty"}
          pathname={"/browse/static/musescore_manual?song=Misty_piano_solo.mid"}
        />
        <Example
          name={"White Christmas"}
          pathname={"/browse/static/musescore_manual?song=white_christmas.mid"}
        />
        <Example
          name={"Tamás Deák – Vízisí"}
          pathname={"/browse/static/musescore_manual?song=vizisi.mid"}
        />
        <Example
          name={"George Gershwin – Rhapsody in Blue"}
          pathname={
            "/browse/static/musescore_manual?song=Gershwin_Rhapsody_in_Blue_Piano_solo.mid"
          }
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
        <Example
          name={"Joe Hisaishi – Summer"}
          pathname="https://musescore.com/user/39031562/scores/15671254"
        />
      </Section>

      {/* <Example
          name={"Für Elise"}
          pathname={"/browse/static/musescore_manual?song=Fr_Elise.mid"}
        /> */}

      {/* <Example
          name={"Interstellar"}
          pathname={"/browse/static/musescore_manual?song=Interstellar.mid"}
        />
        <Example
          name={"Moonlight Sonata"}
          pathname={
            "/browse/static/musescore_manual?song=Sonate_No._14_Moonlight_1st_Movement.mid"
          }
        /> */}

      {/* <Example
          name={"Minecraft – Wet Hands"}
          pathname={
            "/browse/static/musescore_manual?song=Wet_Hands_Minecraft.mid"
          }
        /> */}

      {/* <Example
          name={"Ed Sheeran – Shape of You"}
          pathname={
            "/browse/static/musescore_manual?song=Ed_Sheeran_Shape_of_you.mid"
          }
        /> */}
      {/* <Example
          name={"Ed Sheeran – Photograph"}
          pathname={
            "/browse/static/musescore_manual?song=Photograph_Ed_Sheeran.mid"
          }
        /> */}

      {/* <Example
          name={"Billie Eilish – Bad Guy"}
          pathname={
            "/browse/static/musescore_manual?song=Billie_Eilish_Bad_Guy.mid"
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