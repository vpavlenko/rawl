// variable-length quantity

export function toVLQ(intNum: number): number[] {
  let v = intNum
  const r = [v & 0x7f]
  while (true) {
    v >>= 7
    if (v === 0) {
      break
    }
    r.unshift(0x80 + (v & 0x7f))
  }
  return r
}

export const fromVLQ = (vlq: number[]): number => {
  let result = 0
  for (;;) {
    const b = vlq.shift()
    if (b === undefined) {
      throw new Error("invalid vlq bytes")
    }
    if (b & 0x80) {
      result += b & 0x7f
      result <<= 7
    } else {
      /* b is the last byte */
      return result + b
    }
  }
}
