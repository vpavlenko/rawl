import { Mutator, Action } from "../createDispatcher"

// Actions

export interface SetQuantizeDenominator {
  type: "setQuantizeDenominator"
  denominator: number
}

export type QuantizerAction = SetQuantizeDenominator

// Action Creators

export const setQuantizeDenominator = (
  denominator: number
): SetQuantizeDenominator => ({
  type: "setQuantizeDenominator",
  denominator,
})

// Mutators

export default (action: Action): Mutator | null => {
  switch (action.type) {
    case "setQuantizeDenominator":
      return ({ services: { quantizer } }) => {
        quantizer.denominator = action.denominator
      }
  }
  return null
}
