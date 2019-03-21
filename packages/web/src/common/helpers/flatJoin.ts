export default function flatJoin(...classes: string[]) {
  return classes.filter(c => c).join(" ")
}
