import styled from "@emotion/styled"
import { Button, MenuItem, Select } from "@mui/material"
import { range } from "lodash"
import { useEffect, useState, VFC } from "react"
import { localized } from "../../../common/localize/localizedString"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../Dialog/Dialog"

export interface TimeSignatureDialogProps {
  initialNumerator?: number
  initialDenominator?: number
  open: boolean
  onClose: () => void
  onClickOK: (timeSignature: { numerator: number; denominator: number }) => void
}

const NumberInput = styled.input`
  background: transparent;
  -webkit-appearance: none;
  outline: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  width: 3em;
  text-align: center;
  font-family: "Roboto Mono", monospace;
  font-size: 1rem;
  padding: 0.2rem 0;
  border: 1px solid ${({ theme }) => theme.dividerColor};
  border-radius: 0.2rem;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme }) => theme.themeColor};
    border-width: 2px;
  }

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

export const TimeSignatureDialog: VFC<TimeSignatureDialogProps> = ({
  initialNumerator = 4,
  initialDenominator = 4,
  open,
  onClose,
  onClickOK,
}) => {
  const [numerator, setNumerator] = useState(initialNumerator)
  const [denominator, setDenominator] = useState(initialDenominator)

  useEffect(() => {
    // reset values when opening the dialog
    if (open) {
      setNumerator(initialNumerator)
      setDenominator(initialDenominator)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle>{localized("time-signature", "Time Signature")}</DialogTitle>
      <DialogContent>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
          }}
        >
          <NumberInput
            value={numerator}
            type="number"
            min={1}
            max={32}
            onChange={(e) => setNumerator(parseInt(e.target.value))}
            onBlur={() => setNumerator(Math.max(1, Math.min(32, numerator)))}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
          />
          <span
            style={{
              width: "3em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            /
          </span>
          <Select
            style={{
              minWidth: "5em",
            }}
            value={denominator.toString()}
            onChange={(e) => setDenominator(parseInt(e.target.value as string))}
          >
            {range(0, 6)
              .map((v) => Math.pow(2, v))
              .map((v) => (
                <MenuItem key={v} value={v.toString()}>
                  {v}
                </MenuItem>
              ))}
          </Select>
        </div>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          {localized("cancel", "Cancel")}
        </Button>
        <Button
          onClick={() => {
            onClickOK({ numerator, denominator })
            onClose()
          }}
          disabled={isNaN(numerator) && numerator <= 32 && numerator > 0}
        >
          {localized("ok", "OK")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
