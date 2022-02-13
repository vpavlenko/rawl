import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import { isEqual } from "lodash"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef, useState, VFC } from "react"
import { FixedSizeList, ListChildComponentProps } from "react-window"
import { localized } from "../../../common/localize/localizedString"
import { TrackEvent } from "../../../common/track"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { EventInputProp, getEventController } from "./EventController"

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
  padding-right: 14px;
`

const Row = styled.div`
  display: flex;
  outline: none;

  &:focus {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const Cell = styled.div`
  padding: 0.5rem;

  &:focus-within {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

type InputCellProps = EventInputProp & {
  style?: React.CSSProperties
  type: "number" | "text"
  onChange: (value: number | string) => void
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

const DisabledInputCell: VFC<{ style?: React.CSSProperties }> = ({ style }) => (
  <Cell style={style}>
    <StyledInput disabled={true} />
  </Cell>
)

const InputCell: FC<InputCellProps> = ({ value, type, style, onChange }) => {
  const [isFocus, setFocus] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const sendChange = useCallback(() => {
    switch (type) {
      case "number":
        const num = parseInt(inputValue)
        if (!Number.isNaN(num)) {
          onChange(num)
        }
        break
      case "text":
        onChange(inputValue)
        break
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
        type={type}
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

    const controller = getEventController(item)

    const onDelete = useCallback(
      (e: TrackEvent) => {
        rootStore.song.selectedTrack?.removeEvent(e.id)
      },
      [rootStore]
    )

    const onChangeGate = useCallback(
      (value: number | string) => {
        if (controller.gate === undefined) {
          return
        }
        const obj = controller.gate.update(value)
        rootStore.song.selectedTrack?.updateEvent(item.id, obj)
      },
      [rootStore, item]
    )

    const onChangeValue = useCallback(
      (value: number | string) => {
        if (controller.value === undefined) {
          return
        }
        const obj = controller.value.update(value)
        rootStore.song.selectedTrack?.updateEvent(item.id, obj)
      },
      [rootStore, item]
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
          {controller.name}
        </Cell>
        {controller.gate === undefined ? (
          <DisabledInputCell style={{ width: widthForCell(2) }} />
        ) : (
          <InputCell
            style={{ width: widthForCell(2) }}
            {...controller.gate}
            onChange={onChangeGate}
          />
        )}
        {controller.value === undefined ? (
          <DisabledInputCell style={{ width: widthForCell(3) }} />
        ) : (
          <InputCell
            style={{ width: widthForCell(3) }}
            {...controller.value}
            onChange={onChangeValue}
          />
        )}
      </Row>
    )
  },
  equalEventRowProps
)

export default EventList
