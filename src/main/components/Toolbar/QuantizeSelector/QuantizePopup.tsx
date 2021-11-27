import { makeStyles, Popover } from "@material-ui/core"
import React from "react"
import styled from "styled-components"
import { localized } from "../../../../common/localize/localizedString"
import { NumberPicker } from "./NumberPicker"

export interface QuantizePopupProps {
  value: number
  values: number[]
  triplet: boolean
  dotted: boolean
  isOpen: boolean
  onClose: () => void
  anchorEl: Element | null
  onChangeValue: (value: number) => void
  onChangeTriplet: (value: boolean) => void
  onChangeDotted: (value: boolean) => void
}

const useStyles = makeStyles((theme) => ({
  popover: {
    "& .MuiPopover-paper": {
      overflow: "visible",
      marginTop: "1em",
    },
  },
}))

const Container = styled.div`
  padding: 0 1em;
  border-radius: 0.4em;
  display: flex;
  top: 3em;
  left: -3em;

  &::before {
    content: "";
    width: 1em;
    height: 1em;
    background: var(--background-color);
    position: absolute;
    top: -0.5em;
    left: calc(50% - 1em);
    transform: rotate(45deg);
  }

  .button-up {
    margin-bottom: -0.4em;
  }

  .button-down {
    margin-top: -0.1em;
  }

  .field {
    white-space: nowrap;
  }
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 0.5em;
`

export function QuantizePopup({
  value = 8,
  values,
  triplet,
  dotted,
  isOpen,
  onClose,
  onChangeValue,
  onChangeTriplet,
  onChangeDotted,
  anchorEl,
}: QuantizePopupProps) {
  const prevValue = () => {
    const index = Math.max(values.indexOf(value) - 1, 0)
    return values[index]
  }
  const nextValue = () => {
    const index = Math.min(values.indexOf(value) + 1, values.length - 1)
    return values[index]
  }
  const classes = useStyles({})
  return (
    <Popover
      className={classes.popover}
      open={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Container>
        <NumberPicker
          value={value}
          prevValue={prevValue}
          nextValue={nextValue}
          onChange={onChangeValue}
        />
        <Right>
          <div className="field">
            <input
              type="checkbox"
              onChange={(e) => onChangeTriplet(e.target.checked)}
              checked={triplet}
              id="QuantizePopupInputTriplet"
            />
            <label htmlFor="QuantizePopupInputTriplet">
              {localized("triplet", "Triplet")}
            </label>
          </div>
          <div className="field">
            <input
              type="checkbox"
              onChange={(e) => onChangeDotted(e.target.checked)}
              checked={dotted}
              id="QuantizePopupInputDotted"
            />
            <label htmlFor="QuantizePopupInputDotted">
              {localized("dotted", "Dotted")}
            </label>
          </div>
        </Right>
      </Container>
    </Popover>
  )
}
