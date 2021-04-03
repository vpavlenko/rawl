import useComponentSize from "@rehooks/component-size"
import { isEqual } from "lodash"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef, useState } from "react"
import { FixedSizeList, ListChildComponentProps } from "react-window"
import styled from "styled-components"
import { controllerTypeString } from "../../../common/helpers/noteNumberString"
import { localized } from "../../../common/localize/localizedString"
import { TrackEvent } from "../../../common/track"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const EventList: FC = observer(() => {
  const rootStore = useStores()

  const events = [...(rootStore.song.selectedTrack?.events ?? [])]
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([])

  const ref = useRef<HTMLDivElement>(null)
  const size = useComponentSize(ref)

  return (
    <Container ref={ref}>
      <Header>
        <Row>
          <Cell style={{ width: widthForCell(0) }}>Tick</Cell>
          <Cell style={{ width: widthForCell(1), flexGrow: 1 }}>
            {localized("event", "Event")}
          </Cell>
          <Cell style={{ width: widthForCell(2) }}>
            {localized("duration", "Duration")}
          </Cell>
          <Cell style={{ width: widthForCell(3) }}>Value</Cell>
        </Row>
      </Header>
      <FixedSizeList
        height={size.height - Layout.rulerHeight}
        itemCount={events.length}
        itemSize={35}
        width={size.width}
        itemData={{ events, selectedEventIds, setSelectedEventIds }}
        itemKey={(index) => events[index].id}
      >
        {ItemRenderer}
      </FixedSizeList>
    </Container>
  )
})

const ItemRenderer = ({ index, style, data }: ListChildComponentProps) => {
  const { events, selectedEventIds, setSelectedEventIds } = data
  const e = events[index]

  const onClickRow = useCallback((e: React.MouseEvent, ev: TrackEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedEventIds((ids: number[]) => [...ids, ev.id])
    } else {
      setSelectedEventIds([ev.id])
    }
  }, [])

  return (
    <EventRow
      style={style}
      item={e}
      key={e.id}
      isSelected={selectedEventIds.includes(e.id)}
      onClick={onClickRow}
    />
  )
}

const widthForCell = (index: number) => ["5em", "6em", "4em", "4em"][index]

const Header = styled.div`
  height: ${Layout.rulerHeight};
  border-bottom: 1px solid ${({ theme }) => theme.dividerColor};
  /* scroll bar width */
  margin-right: 14px;
`

const Row = styled.div`
  display: flex;
  outline: none;

  &:focus {
    background: var(--secondary-background-color);
  }
`

const Cell = styled.div`
  padding: 0.5rem;

  &:focus-within {
    background: var(--secondary-background-color);
  }
`

interface InputCellProps {
  value: number | string | null
  style?: React.CSSProperties
  onChange: (value: number) => void
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

const InputCell: FC<InputCellProps> = ({ value, style, onChange }) => {
  const [isFocus, setFocus] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const sendChange = useCallback(() => {
    const num = parseInt(inputValue)
    if (!Number.isNaN(num)) {
      onChange(num)
    }
  }, [inputValue])

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === "Enter") {
        const inputs = Array.from(
          e.currentTarget?.parentElement?.parentElement?.parentElement?.querySelectorAll(
            "input"
          ) ?? []
        ).filter((e) => !e.disabled)
        const index = inputs.indexOf(e.currentTarget)
        const elm = inputs[index + 1]
        elm?.focus()
        elm?.select()
        e.preventDefault()
      }

      if (e.key === "Escape") {
        // TODO: Reset inputValue to value
        e.currentTarget.blur()
      }

      if (e.key === "Enter" || e.key === "Tab") {
        sendChange()
      }
    },
    [sendChange, value]
  )

  return (
    <Cell style={style}>
      <StyledInput
        type="number"
        value={isFocus ? inputValue : value?.toString()}
        onFocus={useCallback(() => {
          setFocus(true)
          setInputValue(value?.toString() ?? "")
        }, [value])}
        onBlur={useCallback(() => {
          setFocus(false)
          sendChange()
        }, [sendChange])}
        onChange={useCallback(
          (e: React.ChangeEvent<HTMLInputElement>) => {
            if (isFocus) {
              setInputValue(e.target.value)
            }
          },
          [isFocus]
        )}
        disabled={value === null}
        onKeyDown={onKeyDown}
      />
    </Cell>
  )
}

interface EventRowProps {
  item: TrackEvent
  isSelected: boolean
  style?: React.CSSProperties
  onClick: (e: React.MouseEvent, ev: TrackEvent) => void
}

const equalEventRowProps = (a: EventRowProps, b: EventRowProps) =>
  isEqual(a.item, b.item) &&
  a.isSelected === b.isSelected &&
  isEqual(a.style, b.style) &&
  a.onClick === b.onClick

const EventRow: FC<EventRowProps> = React.memo(
  ({ item, isSelected, style, onClick }) => {
    const rootStore = useStores()

    const onDelete = useCallback(
      (e: TrackEvent) => {
        rootStore.song.selectedTrack?.removeEvent(e.id)
      },
      [rootStore]
    )

    const onChangeGate = useCallback(
      (e: TrackEvent, value: number) => {
        const obj = updateGate(e, value)
        if (obj !== null) {
          rootStore.song.selectedTrack?.updateEvent(e.id, obj)
        }
      },
      [rootStore]
    )

    const onChangeValue = useCallback(
      (e: TrackEvent, value: number) => {
        const obj = updateValue(e, value)
        if (obj !== null) {
          rootStore.song.selectedTrack?.updateEvent(e.id, obj)
        }
      },
      [rootStore]
    )

    return (
      <Row
        style={style}
        onClick={useCallback((e: React.MouseEvent) => onClick(e, item), [item])}
        onKeyDown={useCallback(
          (e: React.KeyboardEvent) => {
            if (
              e.target === e.currentTarget &&
              (e.key === "Delete" || e.key === "Backspace")
            ) {
              onDelete(item)
              e.stopPropagation()
            }
          },
          [item]
        )}
        tabIndex={-1}
      >
        <Cell style={{ width: widthForCell(0) }}>{item.tick}</Cell>
        <Cell
          style={{
            width: widthForCell(1),
            flexGrow: 1,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {getEventName(item)}
        </Cell>
        <InputCell
          style={{ width: widthForCell(2) }}
          value={getGate(item)}
          onChange={useCallback((value: number) => onChangeGate(item, value), [
            item,
          ])}
        />
        <InputCell
          style={{ width: widthForCell(3) }}
          value={getValue(item)}
          onChange={useCallback((value: number) => onChangeValue(item, value), [
            item,
          ])}
        />
      </Row>
    )
  },
  equalEventRowProps
)

function updateValue(e: TrackEvent, value: number | string) {
  switch (e.type) {
    case "channel":
      switch (e.subtype) {
        case "controller":
          return { value }
        case "note":
          return { velocity: value }
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

function updateGate(e: TrackEvent, value: number) {
  switch (e.type) {
    case "channel":
      switch (e.subtype) {
        case "controller":
          return null
        case "note":
          return { duration: value }
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
      switch (e.subtype) {
        default:
          return null
      }
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

export default EventList
