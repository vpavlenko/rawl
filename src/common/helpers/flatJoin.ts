import { isNotNullOrUndefined } from "./array"

export default function flatJoin(...classes: (string | undefined | null)[]) {
  return classes.filter(isNotNullOrUndefined).join(" ")
}
