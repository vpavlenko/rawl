import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { ReactNode } from "react";
import styled from "styled-components";
import ChordStairs, { MODES } from "./ChordStairs";
import CorpusSearch from "./CorpusSearch";
import { InlinePianoLegend, PianoLegend } from "./PianoLegend";
import PathView from "./corpora/PathView";
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

const Footer = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 30px 0px;
  text-align: center;
  height: 3em;
`;

const FullWidthPathViewContainer = styled.div`
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  height: calc(100vh - 15px); // Compensate for the top bar
  margin-top: -20px; // Pull the container up to cover the top bar
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TopSection = styled.div`
  display: flex;
  width: 100%;
`;

const LandingPage = () => {
  return (
    <PageContainer>
      <TopSection>
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
          <div style={{ marginTop: 30, marginBottom: 100 }}>
            <FileDropBox />
          </div>

          <Footer>
            I'm{" "}
            <a
              href="mailto:cxielamiko@gmail.com"
              target="_blank"
              rel="noreferrer"
            >
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
            .
          </Footer>
        </Content>
        <RightSide sideImage={landingRightSideImage} />
      </TopSection>

      <FullWidthPathViewContainer>
        <PathView />
      </FullWidthPathViewContainer>
    </PageContainer>
  );
};

export default LandingPage;
