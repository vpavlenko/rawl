import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import ChordStairs, { MODES } from "./ChordStairs";
import CorpusSearch from "./CorpusSearch";
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

const Example: React.FC<{ name: string; pathname: string; bad?: boolean }> = ({
  name,
  pathname,
  bad = false,
}) => (
  <NeonLink key={pathname} href={pathname} target="_blank">
    <span style={bad ? { textDecoration: "line-through" } : {}}>{name}</span>
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

export const ChordStairsContainer = styled.div`
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

const OldLandingPage = () => (
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

      <Section title="">
        <CorpusSearch />
      </Section>

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

      <Section title="EdMAC 2024">
        <div style={{ color: "gray" }}>Gavottes</div>
        <Example
          name={"Mozart, Piano Sonata in D, K. 284"}
          pathname={
            "c/Classical%20MIDI/Mozart/Piano%20Sonatas/Piano%20Sonata%20No.%206,%20K284.mid"
          }
        />
        <Example
          name={"Händel HWV 491"}
          pathname={"f/gavotte_in_g_major_hwv_491_handel_george_frideric"}
        />
        <Example name={"F. J. Gossec"} pathname={"f/gavotte_f_j_gossec"} />
        {/* <Example
          name={"Mahler, Symphony #4, mov. 3"}
          pathname={"f/mahler_4_3"}
          bad={true}
        /> */}
        <div style={{ color: "gray" }}>Bruckner</div>
        <Example name={"8/1"} pathname={"f/bruckner_8"} />
        <Example name={"8/1 (another file)"} pathname={"f/symphony_8_1"} />
        <Example name={"7/1"} pathname={"f/bruckner_7_1"} />
        <Example name={"7/2"} pathname={"f/bruckner_7_2"} />
        <div style={{ color: "gray" }}>
          Structural Versus Rhetorical Musical Borrowing
        </div>
        <Example
          name={"Ravel, Pavane pour une infante défunte"}
          pathname={"f/pavane_pour_une_infante_defunte_ravel_recorder"}
        />
        <Example name={"The Lamp is Low"} pathname={"f/the_lamp_is_low"} />
        <Example name={"Debussy, Rêverie"} pathname={"f/reverie_galimberti"} />
        <div style={{ color: "gray" }}>Energetic Overflow</div>
        <Example
          name={"Chopin, Ballade in F minor, op. 52"}
          pathname={"f/chopin_ballade_no_4_piano_solo"}
        />
        <Example
          name={"Brahms, Intermezzo op. 118 no. 1 in A minor"}
          pathname={"f/brahms_op118_1"}
        />
        <div style={{ color: "gray" }}>Eleanor Rigby</div>
        <Example
          name={"The Beatles"}
          pathname={"c/MIDI/The%20Beatles/Eleanor%20Rigby.4.mid"}
        />
        <Example
          name={"Cody Fry"}
          pathname={"/f/eleanor_rigby_cody_fry_no_perc1"}
        />

        <div style={{ color: "gray" }}>Piazzolla, Histoire du Tango:</div>
        <Example
          name={"Bordel 1900"}
          pathname={"f/piazzolla_histoire_du_tango_bordel_1900"}
        />
        <Example
          name={"Cafe 1930"}
          pathname={"f/piazzolla_histoire_du_tango_cafe_1930"}
        />
        <Example
          name={"Nightclub 1960"}
          pathname={"f/piazzolla_histoire_du_tango_nightclub_1960"}
        />
        <Example
          name={"Concert d'aujourd'hui"}
          pathname={"f/piazzolla_histoire_du_tango_concert_aujourdhui"}
        />
        {/* <div style={{ color: "gray" }}>Tigran Hamasyan:</div>
        <Example name={"Kars 1"} pathname={"f/kars_1_tigran_hamasyan"} /> */}
        <div style={{ color: "gray" }}>Max Steiner</div>
        <Example
          name={"Now Voyager Suite (choose ☰ in top-right, mute chords)"}
          pathname={"f/now_voyager_suite_max_steiner"}
        />
        <div style={{ color: "gray" }}>Rachmaninoff, piano concert #4:</div>
        <Example name={"1"} pathname={"f/rachmaninoff_piano_concerto_4_1"} />
        <Example
          name={"2"}
          pathname={"f/piano_concerto_no_4_op_40_sergei_rachmaninoff_ii_largo"}
          bad={true}
        />
        <Example
          name={"3"}
          pathname={
            "f/piano_concerto_no_4_op_40_sergei_rachmaninoff_iii_allegro_vivace"
          }
          bad={true}
        />
      </Section>
      <Section title="Yoel Greenberg, How Sonata Forms (2022)">
        <Example
          name={"2.1. Scarlatti, K. 159"}
          pathname={"f/sonata_k159_scarlatti"}
        />
        <Example
          name={"4.1. Corelli, op. 1 no. 8, II"}
          pathname={"f/corelli_op1_no8_ii"}
        />
      </Section>
      <Section title="Third school">
        <Example name={"ABBA, “SOS”"} pathname={"c/MIDI/ABBA/S.O.S.mid"} />
        <Example
          name={"Ed Sheeran, “Shivers”"}
          pathname={"f/shivers_ed_sheeran_shivers_ed_sheeran_mixed_ensemble"}
        />
        <Example
          name={"Earth, Wind & Fire, “September”"}
          pathname={"f/earth_wind_fire_september"}
        />
        <Example
          name={"Michael Jackson “Rock With You”"}
          pathname={"c/MIDI/Michael%20Jackson/Rock%20With%20You.mid"}
        />
        <Example
          name={"The Korgis, “Everybody’s Got to Learn Sometime”"}
          pathname={
            "c/MIDI/Korgis/Everybody%27s%20Got%20to%20Learn%20Sometime.mid"
          }
        />
        <Example
          name={"Simply Red, “If You Don’t Know Me By Now”"}
          pathname={
            "c/MIDI/Simply%20Red/If%20You%20Don%27t%20Know%20Me%20By%20Now.mid"
          }
        />
        <Example
          name={"Gotye (feat. Kimbra), “Somebody That I Used to Know”"}
          pathname={"f/gotye_feat_kimbra_somebody_that_i_used_to_know"}
        />
        <Example
          name={"Peter Gabriel, “Solsbury Hill”"}
          pathname={"c/MIDI/Peter%20Gabriel/Solsbury%20Hill.mid"}
        />
        <Example
          name={"Björk, “Hyperballad”"}
          pathname={"c/MIDI/Bjork/Hyper-Ballad.mid"}
        />
        <Example
          name={"Coldplay, “Viva la Vida”"}
          pathname={"f/Viva_La_Vida_Coldplay"}
        />
      </Section>
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
      <Section title="hijaz" scale={[0, 1, 4, 5, 7, 8, 10]}>
        <Example name={"Underground Cocek"} pathname={"f/underground-cocek"} />
        <Example name={"Tetris"} pathname={"f/korobeiniki-tetris"} />
        <Example
          name={"Dunavsko horo"}
          pathname={"f/dunavsko-horo---diko-iliev-diko-iliev"}
        />
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
          name={"Michel Legrand – Umbrellas"}
          pathname={
            "c/Classical%20MIDI/Legrand/Michel%20Legrand%20-%20Umbrellas%201.mid"
          }
        />
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
      <Section title="chromatic">
        <Example
          name={"Tchaikovsky. Sugar Plum Fairy"}
          pathname={
            "c/Classical%20MIDI/Tchaikovsky/The%20Nutcracker%20(Suite%20from%20the%20Ballet),%20Op.%2071a%20–%203.%20Dance%20of%20the%20Sugar-Plum%20Fairy%20(D.%20Ganetz).mid"
          }
        />
      </Section>
      <Section title="Balkan brass">
        <Example name={"Underground Cocek"} pathname={"f/underground-cocek"} />
        <Example name={"Bubamara"} pathname={"f/bubamara"} />
        <Example name={"Ederlezi"} pathname={"f/ederlezi"} />
        <Example name={"Hava Nagila"} pathname={"f/hava-nagila"} />
        <Example name={"Kalashnjikov"} pathname={"f/kalasnjikov"} />
        <Example name={"Tetris"} pathname={"f/korobeiniki-tetris"} />
        <Example name={"Mesecina"} pathname={"f/mesecina"} />
      </Section>
      <Section title="preludes by Chopin">
        <Example
          name={"4 (E minor)"}
          pathname={
            "c/Classical%20MIDI/Chopin/24%20Preludes,%20Op.%2028%20–%20No.%204%20in%20E%20minor%20('Suffocation')%20(J.%20Sirulnikoff).mid"
          }
        />
      </Section>
      <Section title="symphonies">
        <Example
          name={"Rachmaninoff 1/i"}
          pathname={
            "c/Classical%20MIDI/Rachmaninoff/Symphony%20No.%201%20in%20D%20minor,%20Op.%2013%20for%20piano%20duet%20-%20I.%20Grave,%20Allegro%20ma%20non%20troppo.mid"
          }
        />
        <Example
          name={"Shostakovich 5/ii (solo piano)"}
          pathname={"f/shostakovich_symphony_no5_2nd_movement_for_piano_solo"}
        />
      </Section>
      <Section title="John Williams">
        <Example
          name={"Double Trouble"}
          pathname={
            "c/Classical%20MIDI/Williams/Harry%20Potter/Prisoner%20of%20Azkaban%20-%20Double%20Trouble.mid"
          }
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
        <Example
          name={"The Ragtime Dance"}
          pathname={"f/the_ragtime_dance_scott_joplin_1906_arrangement"}
        />
        <Example
          name={"Country Club"}
          pathname={"f/country_club_ragtime_two_step_scott_joplin_1909"}
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
          name={`Haydn, String Quartet in G, op. 76 no. 1/i (Allegro con spirito)`}
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
          name={`Beethoven, String Quartet in E Minor, op. 59 no. 2/i (Allegro)`}
          pathname={"f/string_quartet_no_8_in_e_minor_opus_59_rasumovsky_no_2"}
        />
        <Example
          name={`Schubert, String Quartet No. 14 in D Minor, D. 810/i (Allegro)`}
          pathname={"f/schubert_death_and_maiden_string_quartet"}
        />
        <div style={{ color: "gray" }}>also mentioned:</div>
        <Example
          name={`Mozart, Symphony No. 28 in C, K. 200/i (Allegro)`}
          pathname={
            "c/Classical%20MIDI/Mozart/Symphonies/Symphony%20No.%2028,%20K200%20–%20I.%20Allegro.mid"
          }
        />
        <Example
          name={`Mozart, Symphony No. 30 in D, K. 202/i (Allegro)`}
          pathname={
            "c/Classical%20MIDI/Mozart/Symphonies/Symphony%20No.%2030,%20K202%20–%20I.%20Allegro.mid"
          }
        />
        <Example
          name={`Mozart, Piano Sonata in F, K. 332/i (Allegro)`}
          pathname={
            "c/Classical%20MIDI/Mozart/Piano%20Sonatas/Piano%20Sonata%20No.%2013,%20K332%20–%20I.%20Allegro.mid"
          }
        />
        <Example
          name={`Mozart, Symphony No. 39 in E-flat, K. 543/iv (Finale, Allegro Molto)`}
          pathname={
            "c/Classical%20MIDI/Mozart/Symphonies/Symphony%20No.%2039,%20K543%20–%20IV.%20Finale%20(Allegro%20molto).mid"
          }
        />
      </Section>
      <Section title="William E.&nbsp;Caplin. Analyzing Classical Form (2013)">
        <div>
          <a
            href="https://www.music.mcgill.ca/acf/"
            target="_blank"
            rel="noreferrer"
          >
            the original companion website
          </a>
        </div>
        <Example
          name={"2.1. Beethoven, Piano Sonata in F minor, Op. 2, No. 1"}
          pathname={"f/beethoven_sonata_in_f_minor_op_2_no_1_movement_i"}
        />
        <Example
          name={"2.2. Mozart, Rondo in D, K. 485"}
          pathname={
            "f/mozart_rondo_in_d_major_k_485_professional_production_score"
          }
        />
        <Example
          name={"2.3. Beethoven, Piano Sonata in G, Op. 14, No. 2/i"}
          pathname={"f/beethoven_sonata_in_g_op_14_no_2_movement_i"}
        />
        <Example
          name={"2.6. Mozart, Piano Sonata in C, K. 330/i"}
          pathname={
            "c/Classical%20MIDI/Mozart/Piano%20Sonatas/Piano%20Sonata%20No.%2011,%20K330%20–%20I.%20Allegro%20moderato.mid"
          }
        />
        <Example
          name={"2.7. Beethoven, Bagatelle in G minor, Op. 119, No. 1"}
          pathname={
            "f/bagatelle_in_g_minor_op_119_no_1_ludwig_van_beethoven_16_07_1770_26_03_1827_piano_solo"
          }
        />
        <Example
          name={"2.9. Mozart, Piano Sonata in G, K. 283/i"}
          pathname={
            "c/Classical%20MIDI/Mozart/Piano%20Sonatas/Piano%20Sonata%20No.%205,%20K283.mid"
          }
        />
        <Example
          name={`2.10. Mozart, String Quartet in C ("Dissonance"), K. 465/i`}
          pathname={"f/mozart_string_quartet_no_19_in_c_major_k465_dissonance"}
        />
        <Example
          name={`2.11. Mozart, Piano Sonata in C, K. 309/iii`}
          pathname={
            "c/Classical%20MIDI/Mozart/Piano%20Sonatas/Piano%20Sonata%20No.%2010,%20K309%20–%20III.%20Presto.mid"
          }
        />
        <Example
          name={"2.13. Beethoven, Piano Sonata in G, Op. 14, No. 2/i"}
          pathname={"f/beethoven_sonata_in_g_op_14_no_2_movement_i"}
        />
        <Example
          name={"2.14. Mozart, Piano Sonata in C, K. 330/i"}
          pathname={
            "c/Classical%20MIDI/Mozart/Piano%20Sonatas/Piano%20Sonata%20No.%2011,%20K330%20–%20I.%20Allegro%20moderato.mid"
          }
        />
        <Example
          name={`2.15. Mozart, Piano Sonata in C, K. 309/iii`}
          pathname={
            "c/Classical%20MIDI/Mozart/Piano%20Sonatas/Piano%20Sonata%20No.%2010,%20K309%20–%20III.%20Presto.mid"
          }
        />
        <Example
          name={`2.16. Mozart, Piano Sonata in D, K. 311/iii`}
          pathname={"f/sonata_no_9_3rd_movement_k_311"}
        />
        <Example
          name={`2.17. Mozart, String Quartet in C ("Dissonance"), K. 465/i`}
          pathname={"f/mozart_string_quartet_no_19_in_c_major_k465_dissonance"}
        />
        <Example
          name={"2.18. Beethoven, Bagatelle in G minor, Op. 119, No. 1"}
          pathname={
            "f/bagatelle_in_g_minor_op_119_no_1_ludwig_van_beethoven_16_07_1770_26_03_1827_piano_solo"
          }
        />
        <Example
          name={"2.23. Beethoven, Piano Sonata in C, Op. 2, No. 3/i"}
          pathname={
            "f/piano_sonata_no_3_in_c_major_op_2_no_3_ludwig_van_beethoven_piano_sonata_no_3_in_c_major_op_2_no_3_complete"
          }
        />
        <Example
          name={"2.25. Mozart, String Quartet in A, K. 464/ii (from m. 546)"}
          pathname={"f/mozart_string_quartet_no_18_in_a_major_k464"}
        />
        <Example
          name={"2.26. Mozart, Piano Sonata in F, K. 332/ii"}
          pathname={
            "c/Classical%20MIDI/Mozart/Piano%20Sonatas/Piano%20Sonata%20No.%2013,%20K332%20–%20II.%20Menuetto.mid"
          }
        />
        <Example
          name={"2.27. Beethoven, Symphony No. 5 in C minor, Op. 67/i"}
          pathname={
            "c/Classical%20MIDI/Beethoven/Symphony%20No.%205%20(Galimberti)%20-%201.mid"
          }
        />
        <Example
          name={"2.29. Beethoven (?), Piano Sonatina in G, Anh. 5/i"}
          pathname={"f/sonatina_in_g_beethoven_anh_5_no_1_beethoven"}
        />
        <Example
          name={"2.30. Mozart, Fantasy for Piano in D minor, K. 397"}
          pathname={"f/fantasia_in_d_minor_k_397_385g_wolfgang_amadeus_mozart"}
        />
        <Example
          name={"2.33. Mozart, Piano Sonata in F, K. 332/iii"}
          pathname={
            "c/Classical%20MIDI/Mozart/Piano%20Sonatas/Piano%20Sonata%20No.%2013,%20K332%20–%20III.%20Allegro.mid"
          }
        />
        <Example
          name={"2.34. Beethoven, Piano Trio in B-flat, Op. 11/ii"}
          pathname={
            "f/beethoven_trio_for_clarinet_cello_and_piano_no_4_op_11_2nd_movement"
          }
        />
        <Example
          name={"2.35. Haydn, Piano Sonata in E minor, H. 34/ii"}
          pathname={
            "f/sonata_in_e_minor_hob_xvi_34_joseph_haydn_piano_sonata_hob_xvi_34_2_adagio"
          }
        />
      </Section>

      <Section title="Barbershop">
        <Example
          name={"Kristofer Maddigan, Cuphead – A Quick Break"}
          pathname={"f/cuphead_a_quick_break"}
        />
        <Example
          name={
            "Kristofer Maddigan, Cuphead – Don't Deal With The Devil (incomplete arrangement)"
          }
          pathname={"f/don_t_deal_with_the_devil_barbershop_quartet_cuphead"}
        />
        <Example
          name={"God Only Knows, arr. Clay Hine (OST 'Bioshock Infinite')"}
          pathname={"f/god_only_knows_bioshock_infinite_2013"}
        />
        <Example
          name={"Chauncey Olcott, My Wild Irish Rose (polecat)"}
          pathname={"f/my_wild_irish_rose"}
        />
        <Example
          name={
            "Never Gonna Give You Up (Rick Roll) - not a barbershop harmony"
          }
          pathname={"f/never_gunna_give_you_up_barbershop"}
        />
      </Section>

      {/* <Section title="Drew Nobile. Form as Harmony in Rock Music">
        <Example
          name={"2.1. Beethoven, Piano Sonata in F minor, Op. 2, No. 1"}
          pathname={"f/beethoven_sonata_in_f_minor_op_2_no_1_movement_i"}
        />
      </Section> */}

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

export default OldLandingPage;
