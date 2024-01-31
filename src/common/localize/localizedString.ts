import localization from "./localization"

export type Language = "en" | "ja" | "zh-Hans" | "zh-Hant"

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

  const locale = language ?? getLanguage()

  if (
    key !== null &&
    locale !== undefined &&
    localization[locale] !== undefined &&
    localization[locale][key] !== undefined
  ) {
    return localization[locale][key]
  }
  return defaultValue
}

const languageAliases = {
  "zh-TW": "zh-Hant",
  "zh-HK": "zh-Hant",
  "zh-MO": "zh-Hant",
  zh: "zh-Hans",
  "zh-CN": "zh-Hans",
  "zh-SG": "zh-Hans",
} as { [key: string]: Language }

function getLanguageAlias(language: string): Language {
  if (language.startsWith("zh-Hans")) {
    return "zh-Hans"
  }
  if (language.startsWith("zh-Hant")) {
    return "zh-Hant"
  }
  return languageAliases[language] ?? language
}

function getBrowserLanguage() {
  // Use URL parameter ?lang=ja or navigator.language
  const navigatorLanguage = navigator.language
  const langParam = new URL(location.href).searchParams.get("lang")
  return langParam ?? navigatorLanguage
}

export function getLanguage(): Language | undefined {
  const lang = getLanguageAlias(getBrowserLanguage())
  if (localization[lang] !== undefined) {
    return lang
  }
  return undefined
}
