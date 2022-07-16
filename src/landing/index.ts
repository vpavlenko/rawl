import { localized } from "../common/localize/localizedString"

const localizeElement = (e: Element) => {
  const key = e.getAttribute("data-i18n")
  if (key !== null) {
    const text = localized(key)
    if (text !== undefined) {
      e.textContent = text
    }
  }
}

const localize = () => {
  document.querySelectorAll("*[data-i18n]").forEach(localizeElement)

  const title = document.getElementsByTagName("title")[0]
  if (title) {
    localizeElement(title)
  }
}

window.addEventListener("DOMContentLoaded", (e) => {
  console.log("DOM fully loaded and parsed")
  localize()
})
