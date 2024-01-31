import localization from "./localization"

export type Language = "en" | "ja" | "zh" | "tw"

export function localized(
  key: string,
  defaultValue: string,
  language?: Language,
): string
export function localized(
  key: string,
  defaultValue?: string,
  language?: Language,
): string | undefined {
  // ja-JP or ja -> ja

  const locale = language ?? getBrowserLanguage()

  if (
    key !== null &&
    localization[locale] !== undefined &&
    localization[locale][key] !== undefined
  ) {
    return localization[locale][key]
  }
  return defaultValue
}

function getBrowserLanguage() {
  // Use URL parameter ?lang=ja or navigator.language
  // zh-CN, zh-TW を分別するために、こちらはhardcode以外今まだいい方法が浮かべません。
  const navigatorLanguage = navigator.language.split("-")[1].toLowerCase() === 'tw'
    ? 'tw'
    : navigator.language.split("-")[0]
  const langParam = new URL(location.href).searchParams.get("lang")
  return langParam ?? navigatorLanguage
}
