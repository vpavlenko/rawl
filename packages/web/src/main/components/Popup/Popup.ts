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
    document.querySelector("body").appendChild(this.elm)
  }

  close() {
    this.elm.parentNode.removeChild(this.elm)
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
    return template.content.firstElementChild
  }
}
