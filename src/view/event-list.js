import React, { Component } from "react"
import _ from "lodash"
import { controllerTypeString } from "../note-number-string"

/*
opts = {
  events: [
    {
      measure: <Number>
      tick: <Number>
      step: <Number>
      status: <String>
      channel: <Number>
      number: <String>
      value: <Number>
    },
    ...
  ]
}
*/
function EventListItem(props) {
  return <tr>
    <td>{ props.event.tick }</td>
    <td>{ props.event.status }</td>
    <td>{ props.event.value }</td>
  </tr>
}

function EventListContent(props) {
  return <div className="event-list">
    <table>
      <thead>
      <tr>
        <th>Tick</th>
        <th>Status</th>
        <th>Value</th>
      </tr>
      </thead>
      <tbody>
        {props.events.map(e => <EventListItem key={e.id} event={e} />)}
      </tbody>
    </table>
  </div>
}

function statusForEvent(e) {
  switch(e.subtype) {
    case "controller":
      return controllerTypeString(e.controllerType)
    case "note":
      return `${e.subtype} ${e.duration}`
    default:
      return e.subtype
  }
}

export default class EventList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      events: []
    }
  }
  
  render() {
    const events = this.state.track ? this.state.track.getEvents().map(e => {
      return _.extend(e, { 
        status: statusForEvent(e)
      })
    }) : []
    return <EventListContent {...this.props} events={events} />
  }
}
