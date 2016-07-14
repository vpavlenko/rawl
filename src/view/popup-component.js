class PopupComponent {
  constructor() {
    this.elm = PopupComponent.renderElement()

    this.elm.addEventListener("click", () => {
      this.close()
    })

    this.getContentElement().addEventListener("click", e => {
      e.stopPropagation()
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
      <div class="popup-container">
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

