import localization from "./localization"

export function localized(key: string): string
export function localized(key: string, defaultValue: string): string
export function localized(
  key: string,
  defaultValue?: string
): string | undefined {
  // ja-JP or ja -> ja
  const locale = navigator.language.split("-")[0]

  if (
    key !== null &&
    localization[locale] !== undefined &&
    localization[locale][key] !== undefined
  ) {
    return localization[locale][key]
  }
  return defaultValue
}
