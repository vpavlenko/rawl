export const toggled = <T>(set: Set<T>, value: T, include: boolean) => {
  if (include) {
    return new Set([...Array.from(set.values()), value])
  } else {
    return new Set(Array.from(set.values()).filter((v) => v !== value))
  }
}
