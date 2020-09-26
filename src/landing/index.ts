import localization from "./localization"

const localize = () => {
  document.querySelectorAll("*[data-i18n]").forEach((e) => {
    const key = e.getAttribute("data-i18n")
    const locale = navigator.language
    if (
      key !== null &&
      localization[locale] !== undefined &&
      localization[locale][key] !== undefined
    ) {
      e.textContent = localization[locale][key]
    }
  })
}

window.addEventListener("DOMContentLoaded", (e) => {
  console.log("DOM fully loaded and parsed")
  localize()
})
