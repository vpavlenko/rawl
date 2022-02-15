import styled from "@emotion/styled"
import { ControllerEvent, ProgramChangeEvent } from "midifile-ts"
import { FC } from "react"
import { controllerTypeString as CCNames } from "../../../common/helpers/noteNumberString"
import { TrackEventRequired } from "../../../common/track"

export type DisplayEvent = TrackEventRequired &
  (ControllerEvent | ProgramChangeEvent)

function displayControlName(e: DisplayEvent): string {
  switch (e.subtype) {
    case "controller": {
      const name = CCNames(e.controllerType)
      return name || "Control"
    }
    case "programChange":
      return "Program Change"
    default:
      return "Control"
  }
}

interface ControlMarkProps {
  group: DisplayEvent[]
  pixelsPerTick: number
  onDoubleClick: () => void
}

const Container = styled.div`
  position: absolute;
  white-space: nowrap;
  opacity: 0.8;
  background: ${({ theme }) => theme.themeColor};
  color: ${({ theme }) => theme.backgroundColor};
  padding: 0.1em 0.3em;
  border-radius: 0 0.3em 0.3em 0;
  margin: 0.2em 0 0 0;
  box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.02);

  &:hover {
    opacity: 1;
  }
`

export const ControlMark: FC<ControlMarkProps> = ({
  group,
  pixelsPerTick,
  onDoubleClick,
}) => {
  const event = group[0]
  return (
    <Container
      style={{ left: event.tick * pixelsPerTick }}
      onDoubleClick={onDoubleClick}
    >
      {displayControlName(event)}
      {group.length > 1 ? ` +${group.length}` : ""}
    </Container>
  )
}
