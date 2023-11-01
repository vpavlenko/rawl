import * as React from "react";
import styled from "styled-components";

import { Analysis, tagToColor } from "./Analysis";
import { FormAndHarmony } from "./romanNumerals";
import { getAnalysisTags } from "./Search";

type BadgeProps = {
  backgroundColor?: string;
  color?: string;
};

const Badge = styled.span<BadgeProps>`
  border-radius: 0px;
  background-color: ${(props) => props.backgroundColor || "#ccc"};
  color: ${(props) => props.color || "black"};
  font-size: 20px;
  padding: 2px 5px;
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
  badges.push(<Badge>{index}</Badge>);
  if (analysis.comment) {
    badges.push(
      <Badge key="comment" backgroundColor="#cc4">
        {analysis.comment}
      </Badge>,
    );
  }
  if ((analysis.beatsPerMeasure ?? 4) !== 4) {
    badges.push(
      <Badge
        key="beats"
        backgroundColor="#99f"
      >{`${analysis.beatsPerMeasure}/4`}</Badge>,
    );
  }
  getAnalysisTags(analysis).map((tag) =>
    badges.push(
      <Badge key={`tag_${tag}`} backgroundColor={tagToColor(tag)} color="white">
        {tag.split(":").join(": ").replace(/_/g, " ")}
      </Badge>,
    ),
  );
  if (analysis.romanNumerals) {
    badges.push(<FormAndHarmony key="formAndHarmony" analysis={analysis} />);
  }
  if (analysis.basedOn) {
    badges.push(
      <Badge key="basedOn" backgroundColor="#cfc">
        {analysis.basedOn}
      </Badge>,
    );
  }
  if (modulations.length > 0) {
    badges.push(
      <Badge key="modulations" backgroundColor="#fcc">
        {"mod: " +
          modulations
            .map(([measure, newTonic]) =>
              formatModulation(newTonic, analysis.tonic),
            )
            .join(", ")}
      </Badge>,
    );
  }
  if (badges.length === 0) {
    badges.push(
      <Badge key="index" backgroundColor="white">
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
