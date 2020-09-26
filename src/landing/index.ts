import { localized } from "../common/localize/localizedString"

const localize = () => {
  document.querySelectorAll("*[data-i18n]").forEach((e) => {
    const key = e.getAttribute("data-i18n")
    if (key !== null) {
      const text = localized(key)
      if (text !== undefined) {
        e.textContent = text
      }
    }
  })
}

window.addEventListener("DOMContentLoaded", (e) => {
  console.log("DOM fully loaded and parsed")
  localize()
})
