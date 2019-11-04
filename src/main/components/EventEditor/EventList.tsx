import React, { SFC } from "react"
import { controllerTypeString } from "helpers/noteNumberString"

import "./EventList.css"
import { TrackEvent, TrackEventRequired } from "common/track"
import { ControllerEvent } from "midifile-ts"

interface TableProps {
  items: TrackEvent[]
  headers: string[]
}

const Table: SFC<TableProps> = ({ items, headers }) => {
  return (
    <table>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={i}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <EventRow item={item} key={i} />
        ))}
      </tbody>
    </table>
  )
}

interface EventRowProps {
  item: TrackEvent
}

const EventRow: SFC<EventRowProps> = ({ item }) => {
  return (
    <tr>
      <td>{item.tick}</td>
      <td>{statusForEvent(item)}</td>
      <td>{"value" in item ? item.value : ""}</td>
    </tr>
  )
}

function statusForEvent(e: any) {
  switch (e.subtype) {
    case "controller":
      return controllerTypeString(e.controllerType)
    case "note":
      return `${e.subtype} ${e.duration}`
    default:
      return e.subtype
  }
}

export interface EventListProps {
  events: TrackEvent[]
}

const EventList: SFC<EventListProps> = ({ events }) => {
  return (
    <div className="EventList">
      <Table items={events} headers={["Tick", "Status", "Value"]} />
    </div>
  )
}

export default EventList
