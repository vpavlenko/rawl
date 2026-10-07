import styled from "styled-components";
import { Link } from "react-router-dom";
import { lakhEntryColor } from "./annotationStatus";

const LakhEntry = styled(Link)<{
  $annotated: boolean;
  $community?: boolean;
  $hasFewSections?: boolean;
  $folder: boolean;
  $version?: boolean;
  $hasAlbums?: boolean;
}>`
  display: inline;
  ${({ $hasAlbums }) => $hasAlbums && "font-size: 18px;"}
  line-height: 26px;
  overflow-wrap: anywhere;
  /* Keep annotation colors after navigation: global a:visited is more
     specific than a styled-component class on its own. */
  &,
  &:link,
  &:visited {
    color: ${({ $annotated, $community, $hasFewSections, $version }) =>
      lakhEntryColor({
        annotated: $annotated,
        community: $community,
        hasFewSections: $hasFewSections,
        version: $version,
      })};
  }
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
  &:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 3px;
  }
  mark {
    background: #ffe45c;
    color: #000;
  }
  small {
    margin-left: 4px;
    color: #999;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
`;

export default LakhEntry;
