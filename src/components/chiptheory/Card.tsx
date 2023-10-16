import * as React from "react";
import styled from "styled-components";

import { Analysis } from "./Analysis";
import { FormAndHarmony } from "./romanNumerals";

const Badge = styled.span`
  border-radius: 0px;
  background-color: ${(props) => props.color || "#ccc"};
  color: black;
  font-family: Helvetica, sans-serif;
  font-size: 12pt;
  padding: 0px 5px;
  max-width: 400px;
`;

const formatModulation = (newTonic, base) => {
  const diff = (newTonic - base + 12) % 12;
  return diff > 6 ? `-${12 - diff}st` : `+${diff}st`;
};

const Card: React.FC<{ analysis: Analysis; index: number }> = ({
  analysis,
  index,
}) => {
  const modulations = Object.entries(analysis.modulations || {});
  const badges = [];
  if (analysis.comment) {
    badges.push(
      <Badge key="comment" color="#cc4">
        {analysis.comment}
      </Badge>,
    );
  }
  if ((analysis.beatsPerMeasure ?? 4) !== 4) {
    badges.push(
      <Badge key="beats" color="#99f">{`${analysis.beatsPerMeasure}/4`}</Badge>,
    );
  }
  if (analysis.tags && analysis.tags.length > 0) {
    analysis.tags.map((tag) =>
      badges.push(
        <Badge key={`tag_${tag}`}>
          {tag.split(":").join(": ").replace(/_/g, " ")}
        </Badge>,
      ),
    );
  }
  if (analysis.romanNumerals) {
    badges.push(<FormAndHarmony key="formAndHarmony" analysis={analysis} />);
  }
  if (analysis.basedOn) {
    badges.push(
      <Badge key="basedOn" color="#cfc">
        {analysis.basedOn}
      </Badge>,
    );
  }
  // if (modulations.length > 0) {
  //   badges.push(
  //     <Badge key="modulations" color="#fcc">
  //       {"mod: " +
  //         modulations
  //           .map(([measure, newTonic]) =>
  //             formatModulation(newTonic, analysis.tonic),
  //           )
  //           .join(", ")}
  //     </Badge>,
  //   );
  // }
  if (badges.length === 0) {
    badges.push(
      <Badge key="index" color="white">
        {index}
      </Badge>,
    );
  }

  return (
    <div
      style={{
        display: "inline-block",
        backgroundColor: "transparent",
        margin: "5px 20px 20px 0px",
        padding: "0px",
        fontFamily: "Helvetica, sans-serif",
        fontSize: "12pt",
        color: "white",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {badges}
      </div>
    </div>
  );
};

export default Card;
