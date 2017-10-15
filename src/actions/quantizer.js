
export default ({ services: { quantizer } }) => {
  return {
    "SET_QUANTIZE_DENOMINATOR": ({ denominator }) => {
      quantizer.denominator = denominator
    }
  }
}
