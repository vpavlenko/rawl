import React, { Component } from "react"
import "./Form.css"

function SectionContent(props) {
  return <section className="Section">
    <header>
      <p className="title">{props.title}</p>
      {props.hidden ? 
        <button className="open" onClick={props.onClickOpen}>+</button> : 
        <button className="close" onClick={props.onClickClose}>-</button>
      }
    </header>
    {!props.hidden && 
      <div className="content">
        {props.children}
      </div>
    }
  </section>
}

export class Section extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hidden: false
    }
  }

  render() {
    const onClickOpen = () => {
      this.setState({hidden: false})
    }
    const onClickClose = () => {
      this.setState({hidden: true})
    }
    return <SectionContent {...this.props} 
      hidden={this.state.hidden}
      onClickOpen={onClickOpen}
      onClickClose={onClickClose}
    />
  }
}
