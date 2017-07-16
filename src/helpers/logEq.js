export default function logEq(x, y, propName, compare = (a, b) => a === b) {
  return compare(x[propName], y[propName])
}
