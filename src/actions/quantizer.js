
export default (app) => {
  const { quantizer } = app

  return {
    "SET_QUANTIZE_DENOMINATOR": ({ denominator }) => {
      quantizer.denominator = denominator
    }
  }
}
