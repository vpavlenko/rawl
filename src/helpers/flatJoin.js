export default function flatJoin(...classes) {
  return classes.filter(c => c).join(" ")
}
