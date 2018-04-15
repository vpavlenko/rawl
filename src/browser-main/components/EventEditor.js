import React, { Component } from "react"
import ReactDOM from "react-dom"

import Popup from "components/Popup"
import EventList from "components/EventList"

import "./EventEditor.css"

function EventEditorContent({
  events,
  onClickOK,
  onClickCancel,
}) {
  return <div className="EventEditor">
    <div className="container">
      <EventList events={events} />
      <div className="footer">
        <button className="ok" onClick={onClickOK}>OK</button>
        <button className="cancel" onClick={onClickCancel}>Cancel</button>
      </div>
    </div>
  </div>
}

export default class EventEditor extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    const onClickOK = () => {
      this.props.onClickOK({
      })
    }

    return <EventEditorContent
      onClickOK={onClickOK}
      onClickCancel={this.props.onClickCancel}
      events={this.props.events}
      {...this.state}
    />
  }
}

export function show(events) {
  const popup = new Popup()
  popup.show()

  ReactDOM.render(<EventEditor
    events={events}
    onClickCancel={() => {
      popup.close()
    }}
    onClickOK={() => {
      popup.close()
    }}
  />, popup.getContentElement())
}