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
  const deletedItems = items.filter(
    (i) => nextItems.find((i2) => i.value.id === i2.id) === undefined
  )
  const reusableKeys = deletedItems.map((i) => i.key)
  const usedKeys: number[] = []
  let maxKey = 0

  return nextItems.map((i) => {
    const existingItem = items.find((i2) => i.id === i2.value.id)
    let key: number

    if (existingItem !== undefined) {
      // keep the key
      key = existingItem.key
    } else if (reusableKeys.length > 0) {
      // reuse ye key
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      key = reusableKeys.pop()!
    } else if (!usedKeys.includes(i.id)) {
      // use id as key
      key = i.id
    } else {
      // create new key
      key = maxKey + 1
    }

    usedKeys.push(key)
    maxKey = Math.max(maxKey, key)

    return {
      key,
      value: i,
    }
  })
}
