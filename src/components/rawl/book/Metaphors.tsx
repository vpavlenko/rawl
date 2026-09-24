import { pitchColor } from "../colors";
import React from "react";
import styled from "styled-components";

const GradientText = styled.span`
  font-weight: 900;
  display: inline-block;
  background-clip: text !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
`;

const GradientGreen = styled(GradientText)`
  background: linear-gradient(
    to right,
    ${pitchColor(0)},
    ${pitchColor(3)},
    ${pitchColor(4)},
    ${pitchColor(7)}
  );
`;

const GradientCool = styled(GradientText)`
  background: linear-gradient(
    to right,
    ${pitchColor(5)},
    ${pitchColor(6)},
    ${pitchColor(8)},
    ${pitchColor(9)},
    ${pitchColor(3)},
    ${pitchColor(4)}
  );
`;

const GradientWarm = styled(GradientText)`
  background: linear-gradient(to right, ${pitchColor(11)}, ${pitchColor(10)}, ${pitchColor(2)}, ${pitchColor(5)});
`;

const GradientBright = styled(GradientText)`
  background: linear-gradient(to right, ${pitchColor(4)}, ${pitchColor(9)}, ${pitchColor(11)});
`;

const GradientDark = styled(GradientText)`
  background: linear-gradient(to right, ${pitchColor(3)}, ${pitchColor(8)}, ${pitchColor(10)});
`;

const Container = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const TextLine = styled.span`
  font-weight: 900;
`;

const Metaphors = () => {
  return (
    <Container>
      <span>
        <TextLine>the tonic note is always white</TextLine>
      </span>
      <span>
        <GradientGreen>tonic chords have a green pitch</GradientGreen>
      </span>
      <span>
        <GradientCool>predominants are in cool colors</GradientCool>
      </span>
      <span>
        <GradientWarm>dominants are in warm colors</GradientWarm>
      </span>
      <span>
        <GradientBright>major mode is brighter</GradientBright>
      </span>
      <span>
        <GradientDark>minor mode is darker</GradientDark>
      </span>
    </Container>
  );
};

export default Metaphors;
