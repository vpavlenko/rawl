import { useEffect, useRef } from "react"
import { IDValue, KeyedValue, recycleKeys } from "./recycleKeys"

export const useRecycle = <T extends IDValue>(items: T[]): KeyedValue<T>[] => {
  const ref = useRef<KeyedValue<T>[]>()
  const prevItems = ref.current ?? []
  const keyedValue = recycleKeys(prevItems, items)

  useEffect(() => {
    ref.current = keyedValue
  }, [keyedValue])

  return keyedValue
}
