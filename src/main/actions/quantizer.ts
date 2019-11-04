import RootStore from "../stores/RootStore"

export const SET_QUANTIZE_DENOMINATOR = Symbol()

export default ({ services: { quantizer } }: RootStore) => {
  return {
    [SET_QUANTIZE_DENOMINATOR]: (denominator: number) => {
      quantizer.denominator = denominator
    }
  }
}
