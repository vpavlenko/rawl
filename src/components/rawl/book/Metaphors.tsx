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
    white,
    #007000,
    #00fb47,
    rgb(120, 120, 120)
  );
`;

const GradientCool = styled(GradientText)`
  background: linear-gradient(
    to right,
    #9500b3,
    #ea7eff,
    #0000ff,
    #03b9d5,
    #007000,
    #00fb47
  );
`;

const GradientWarm = styled(GradientText)`
  background: linear-gradient(to right, #ff0, #ff7328, red, #9500b3);
`;

const GradientBright = styled(GradientText)`
  background: linear-gradient(to right, #00fb47, #03b9d5, #ff0);
`;

const GradientDark = styled(GradientText)`
  background: linear-gradient(to right, #007000, #0000ff, #ff7328);
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
