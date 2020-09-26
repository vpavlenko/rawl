import localization from "./localization"

export function localized(key: string): string
export function localized(key: string, defaultValue: string): string
export function localized(
  key: string,
  defaultValue?: string
): string | undefined {
  const locale = navigator.language
  if (
    key !== null &&
    localization[locale] !== undefined &&
    localization[locale][key] !== undefined
  ) {
    return localization[locale][key]
  }
  return defaultValue
}
