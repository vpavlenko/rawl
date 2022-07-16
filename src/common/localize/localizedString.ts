import localization from "./localization"

export function localized(key: string): string
export function localized(key: string, defaultValue: string): string
export function localized(
  key: string,
  defaultValue?: string
): string | undefined {
  // ja-JP or ja -> ja

  // Use URL parameter ?lang=ja or navigator.language
  const navigatorLanguage = navigator.language.split("-")[0]
  const langParam = new URL(location.href).searchParams.get("lang")
  const locale = langParam ?? navigatorLanguage

  if (
    key !== null &&
    localization[locale] !== undefined &&
    localization[locale][key] !== undefined
  ) {
    return localization[locale][key]
  }
  return defaultValue
}
