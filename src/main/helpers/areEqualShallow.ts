// https://stackoverflow.com/a/22266891/1567777
export function areEqualShallow<T>(a: T, b: T): boolean {
  for (var key in a) {
    if (a[key] !== b[key]) {
      return false
    }
  }
  return true
}
