export interface KeyedValue<T> {
  key: number
  value: T
}

export interface IDValue {
  id: number
}

export const recycleKeys = <T extends IDValue>(
  items: KeyedValue<T>[],
  nextItems: T[]
): KeyedValue<T>[] => {
  const reusable = [...items]
  const addedItems = [...nextItems]
  const result: KeyedValue<T>[] = []

  // first: reuse keys with same item
  for (let i = addedItems.length - 1; i >= 0; i--) {
    const item = addedItems[i]
    const index = reusable.findIndex((i2) => item.id === i2.value.id)
    if (index >= 0) {
      result.unshift({ key: reusable[index].key, value: item })
      reusable.splice(index, 1)
      addedItems.splice(i, 1)
    }
  }

  // second: reuse keys with new items
  for (let i = addedItems.length - 1; i >= 0; i--) {
    const item = addedItems[i]
    const index = reusable.findIndex((i2) => item.id === i2.value.id)
    if (index >= 0) {
      // use id as key
      result.push({
        key: item.id,
        value: item,
      })
      reusable.splice(index, 1)
      addedItems.splice(i, 1)
    }
  }

  // third: reuse rest keys or create new one
  let maxKey =
    items.length === 0
      ? -1
      : items.map((e) => e.key).reduce((a, b) => Math.max(a, b), 0)
  result.push(
    ...addedItems.map((item) => ({
      key: reusable.pop()?.key ?? ++maxKey,
      value: item,
    }))
  )

  return result
}
