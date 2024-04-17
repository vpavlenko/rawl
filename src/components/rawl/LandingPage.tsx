import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import ChordStairs, { MODES } from "./ChordStairs";
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
  padding: 5px 10px; // Adjust padding as needed
  color: #fff; // White text color for the neon effect
  font-size: 20px;
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
`;

const LandingPage = () => (
  <Container>
    <LeftSide sideImage={landingLeftSideImage} />

    <Content>
      <div
        style={{
          fontSize: 40,
          fontFamily: "Verdana, serif",
          marginTop: 60,
          textAlign: "center",
        }}
      >
        See music in 12 colors
      </div>
      <div style={{ marginTop: 100 }}>
        <Example
          name={"Pirates of the Caribbean"}
          pathname={
            "/browse/static/musescore_manual?song=Pirates_of_the_Caribbean_-_Hes_a_Pirate.mid"
          }
        />
        {/* <Example
          name={"Für Elise"}
          pathname={"/browse/static/musescore_manual?song=Fr_Elise.mid"}
        /> */}
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
        <Example
          name={"Attack on Titan"}
          pathname={
            "/browse/static/musescore_manual?song=Attack_on_Titan_Shinzou_wo_Sasageyo.mid"
          }
        />
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
          name={"Carol of the Bells"}
          pathname={
            "/browse/static/musescore_manual?song=Carol_of_the_Bells.mid"
          }
        />
        <Example
          name={"Fly Me to the Moon"}
          pathname={
            "/browse/static/musescore_manual?song=Fly_Me_to_the_Moon.mid"
          }
        />
        <Example
          name={"Godfather"}
          pathname={"/browse/static/musescore_manual?song=Godfather.mid"}
        />
        <Example
          name={"Jingle Bell Rock"}
          pathname={"/browse/static/musescore_manual?song=Jingle_Bell_Rock.mid"}
        />
        <Example
          name={"Pink Panther"}
          pathname={"/browse/static/musescore_manual?song=Pink_Panther.mid"}
        />
        <Example
          name={"Requiem for a Dream"}
          pathname={
            "/browse/static/musescore_manual?song=Requiem_for_a_Dream.mid"
          }
        />
        <Example
          name={"Joe Hisaishi – Summer"}
          pathname={
            "/browse/static/musescore_manual?song=Summer_Joe_Hisaishi.mid"
          }
        />
        <Example
          name={"Gymnopedie"}
          pathname={
            "/browse/static/musescore_manual?song=Gymnopdie_No._1__Satie.mid"
          }
        />
        <Example
          name={"Minecraft – Sweden"}
          pathname={"/browse/static/musescore_manual?song=Sweden_Minecraft.mid"}
        />
        {/* <Example
          name={"Minecraft – Wet Hands"}
          pathname={
            "/browse/static/musescore_manual?song=Wet_Hands_Minecraft.mid"
          }
        /> */}
        <Example
          name={"Megalovania"}
          pathname={
            "/browse/static/musescore_manual?song=Undertale_-_Megalovania_Piano_ver._3.mid"
          }
        />
        <Example
          name={"All of Me"}
          pathname={
            "/browse/static/musescore_manual?song=All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK.mid"
          }
        />
        <Example
          name={"Disney – Frozen"}
          pathname={
            "/browse/static/musescore_manual?song=Let_It_Go_Disney_Frozen.mid"
          }
        />
        <Example
          name={"Disney – Up"}
          pathname={
            "/browse/static/musescore_manual?song=Disney_Pixar_Up_Theme.mid"
          }
        />
        <Example
          name={"Ed Sheeran – Perfect"}
          pathname={
            "/browse/static/musescore_manual?song=Ed_Sheeran_Perfect_THE_WORST_PIANO_ARRANGEMENT_I_HAVE_EVER_MADE.mid"
          }
        />
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
        <Example
          name={"Feliz Navidad"}
          pathname={"/browse/static/musescore_manual?song=Feliz_Navidad.mid"}
        />
        <Example
          name={"Gravity Falls"}
          pathname={
            "/browse/static/musescore_manual?song=Gravity_Falls_Opening.mid"
          }
        />
        <Example
          name={"Yiruma – Kiss the Rain"}
          pathname={
            "/browse/static/musescore_manual?song=Kiss_The_Rain_-_Yiruma_-_10th_Anniversary_Version_Piano_Updated_2019.mid"
          }
        />
        <Example
          name={"Pokémon"}
          pathname={
            "/browse/static/musescore_manual?song=Pokemon_Theme_Song.mid"
          }
        />
        <Example
          name={"Super Mario Bros"}
          pathname={
            "/browse/static/musescore_manual?song=Super_Mario_Bros_Main_Theme.mid"
          }
        />
        <Example
          name={"Yann Tiersen – Amelie"}
          pathname={
            "/browse/static/musescore_manual?song=Yann_Tiersen_Amelie.mid"
          }
        />
        {/* <Example
          name={"Billie Eilish – Bad Guy"}
          pathname={
            "/browse/static/musescore_manual?song=Billie_Eilish_Bad_Guy.mid"
          }
        /> */}
        <Example
          name={"Despacito"}
          pathname={"/browse/static/musescore_manual?song=Despacito.mid"}
        />
        <Example
          name={"Hit the Road Jack"}
          pathname={
            "/browse/static/musescore_manual?song=Hit_the_Road_Jack.mid"
          }
        />
        <Example
          name={"John Lennon – Imagine"}
          pathname={
            "/browse/static/musescore_manual?song=John_Lennon_Imagine.mid"
          }
        />
        <Example
          name={"Jolene"}
          pathname={"/browse/static/musescore_manual?song=Jolene.mid"}
        />
        <Example
          name={"Titanic"}
          pathname={"/browse/static/musescore_manual?song=Titanic.mid"}
        />
      </div>
      <div style={{ marginTop: 100 }}>
        <FileDropBox />
      </div>
      <div style={{ marginTop: 100 }}>
        <Link to={{ pathname: "/course" }} style={{ fontSize: 26 }}>
          A course on rock harmony and arrangement
        </Link>
      </div>
      <div
        style={{
          marginTop: 100,
          display: "flex",
          flexDirection: "column",
          gap: 70,
        }}
      >
        <ChordStairs mode={MODES[0]} />
        <ChordStairs mode={MODES[1]} />
      </div>
      <div style={{ marginTop: 100 }}>
        Read the idea explained in a{" "}
        <a
          href="https://twitter.com/vitalypavlenko/status/1771820942680830417"
          target="_blank"
          rel="noreferrer"
        >
          Twitter thread
        </a>
      </div>
      <div style={{ marginTop: 20 }}>
        Created by{" "}
        <a href="mailto:cxielamiko@gmail.com" target="_blank" rel="noreferrer">
          Vitaly Pavlenko
        </a>
        ,{" "}
        <a
          href="https://github.com/vpavlenko/rawl"
          target="_blank"
          rel="noreferrer"
        >
          open-source
        </a>
      </div>
    </Content>
    <RightSide sideImage={landingRightSideImage} />
  </Container>
);

export default LandingPage;
