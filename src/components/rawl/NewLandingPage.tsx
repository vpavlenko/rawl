import * as React from "react";
import styled from "styled-components";
import ChordStairs, { MODES } from "./ChordStairs";
import CorpusSearch from "./CorpusSearch";
import { PianoLegend } from "./PianoLegend";
import landingLeftSideImage from "./landing_left_side.png";
import landingRightSideImage from "./landing_right_side.png";

const TopSection = styled.div`
  display: flex;
  width: 100%;
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
  font-size: 16px;
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

const NewLandingPage: React.FC = () => {
  return (
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

        <CorpusSearch />
      </Content>
      <RightSide sideImage={landingRightSideImage} />
    </TopSection>
  );
};

export default NewLandingPage;
