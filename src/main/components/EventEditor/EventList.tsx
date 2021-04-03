import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core"
import useComponentSize from "@rehooks/component-size"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef, useState } from "react"
import { FixedSizeList, ListChildComponentProps } from "react-window"
import styled from "styled-components"
import { controllerTypeString } from "../../../common/helpers/noteNumberString"
import { localized } from "../../../common/localize/localizedString"
import { TrackEvent } from "../../../common/track"
import { useStores } from "../../hooks/useStores"

const Row = styled.div`
  &.selected {
    background: var(--secondary-background-color);
  }
`

const Cell = styled(TableCell)`
  padding: 0.5rem;

  &:focus-within {
    background: var(--secondary-background-color);
  }
`

interface InputCellProps {
  value: number | null
}

const StyledInput = styled.input`
  width: 100%;
  display: block;
  background: transparent;
  border: none;
  color: inherit;
  -webkit-appearance: none;
  font-size: inherit;
  font-family: inherit;
  outline: none;

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const InputCell: FC<InputCellProps> = ({ value }) => {
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === "Enter") {
        const inputs = Array.from(
          e.currentTarget?.parentElement?.parentElement?.parentElement?.querySelectorAll(
            "input"
          ) ?? []
        ).filter((e) => !e.disabled)
        const index = inputs.indexOf(e.currentTarget)
        inputs[index + 1]?.focus()
        e.preventDefault()
      }
    },
    []
  )
  return (
    <Cell component="div">
      <StyledInput
        type="number"
        value={value ?? ""}
        disabled={value === null}
        onKeyDown={onKeyDown}
      />
    </Cell>
  )
}

interface EventRowProps {
  item: TrackEvent
  isSelected: boolean
  onClick: (e: React.MouseEvent, ev: TrackEvent) => void
  onDelete: (e: TrackEvent) => void
}

const EventRow: FC<EventRowProps> = ({
  item,
  isSelected,
  onClick,
  onDelete,
}) => {
  return (
    <Row
      onClick={useCallback((e: React.MouseEvent) => onClick(e, item), [item])}
      className={isSelected ? "selected" : undefined}
      onKeyDown={useCallback(
        (e: React.KeyboardEvent) => {
          if (e.key === "Delete" || e.key === "Backspace") {
            onDelete(item)
            e.stopPropagation()
          }
        },
        [item]
      )}
      tabIndex={-1}
    >
      <Cell component="div">{item.tick}</Cell>
      <Cell component="div">{getEventName(item)}</Cell>
      <InputCell value={getGate(item)} />
      <InputCell value={getValue(item)} />
    </Row>
  )
}

function getValue(e: TrackEvent) {
  switch (e.type) {
    case "channel":
      switch (e.subtype) {
        case "controller":
          return e.value
        case "note":
          return e.velocity
        default:
          return null
      }
    case "dividedSysEx":
      return null
    case "meta":
      return null
    case "sysEx":
      return null
  }
}

function getGate(e: TrackEvent) {
  switch (e.type) {
    case "channel":
      switch (e.subtype) {
        case "controller":
          return null
        case "note":
          return e.duration
        default:
          return null
      }
    case "dividedSysEx":
      return null
    case "meta":
      return null
    case "sysEx":
      return null
  }
}

function getEventName(e: TrackEvent) {
  switch (e.type) {
    case "channel":
      switch (e.subtype) {
        case "controller":
          return controllerTypeString(e.controllerType)
        default:
          return e.subtype
      }
    case "meta":
      return e.subtype
    case "dividedSysEx":
    case "sysEx":
      return e.type
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const EventList: FC = observer(() => {
  const { song } = useStores()
  const track = song.selectedTrack
  const events = [...(track?.events ?? [])]
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([])

  const onClickRow = useCallback(
    (e: React.MouseEvent, ev: TrackEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setSelectedEventIds((ids) => [...ids, ev.id])
      } else {
        setSelectedEventIds([ev.id])
      }
    },
    [setSelectedEventIds]
  )

  const onDeleteRow = useCallback(
    (e: TrackEvent) => {
      track?.removeEvent(e.id)
    },
    [track]
  )

  const headers = [
    "Tick",
    localized("event", "Event"),
    localized("duration", "Duration"),
    "Value",
  ]

  const ref = useRef<HTMLDivElement>(null)
  const size = useComponentSize(ref)

  return (
    <Container ref={ref}>
      <Table>
        <TableHead component="div">
          <TableRow component="div">
            {headers.map((header, i) => (
              <Cell component="div" key={i}>
                {header}
              </Cell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody component="div">
          <FixedSizeList
            height={size.height}
            itemCount={events.length}
            itemSize={35}
            width={size.width}
          >
            {({ index }: ListChildComponentProps) => {
              const e = events[index]
              return (
                <EventRow
                  item={e}
                  key={e.id}
                  onClick={onClickRow}
                  onDelete={onDeleteRow}
                  isSelected={selectedEventIds.includes(e.id)}
                />
              )
            }}
          </FixedSizeList>
        </TableBody>
      </Table>
    </Container>
  )
})

export default EventList
