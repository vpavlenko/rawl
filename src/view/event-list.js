import React, { Component } from "react"
import _ from "lodash"
import { controllerTypeString } from "../note-number-string"
import pureRender from "../hocs/pure-render"

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
    <td>{ props.tick }</td>
    <td>{ props.status }</td>
    <td>{ props.value }</td>
  </tr>
}

const PureEventListItem = pureRender(EventListItem)

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
        {props.events.map(e => <PureEventListItem 
          key={e.id} 
          tick={e.tick}
          status={e.status}
          value={e.value} />)}
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
    this.state = {}
  }
  
  render() {
    const events = this.props.track ? this.props.track.getEvents().map(e => {
      return _.extend(e, { 
        status: statusForEvent(e)
      })
    }) : []
    return <EventListContent {...this.props} events={events} />
  }
}
