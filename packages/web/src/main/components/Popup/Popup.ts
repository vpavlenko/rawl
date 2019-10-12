import "./Popup.css"

export default class Popup {
  elm: Element

  constructor() {
    this.elm = Popup.renderElement()

    this.elm.addEventListener("click", e => {
      if (e.target === this.elm) {
        this.close()
      }
    })
  }

  show() {
    const body = document.querySelector("body")
    body && body.appendChild(this.elm)
  }

  close() {
    const node = this.elm.parentNode
    node && node.removeChild(this.elm)
  }

  getContentElement() {
    return this.elm.querySelector(".content")
  }

  static render() {
    return `
      <div class="Popup">
        <div class="content">
        </div>
      </div>
    `
  }

  static renderElement() {
    const template = document.createElement("template")
    template.innerHTML = this.render()
    const elm = template.content.firstElementChild
    if (elm === null) {
      throw new Error("Failed to render popup elements")
    }
    return elm
  }
}
