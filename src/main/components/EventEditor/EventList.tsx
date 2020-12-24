import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core"
import React, { FC } from "react"
import { controllerTypeString } from "../../../common/helpers/noteNumberString"
import { TrackEvent } from "../../../common/track"

interface EventTableProps {
  items: TrackEvent[]
  headers: string[]
}

const EventTable: FC<EventTableProps> = ({ items, headers }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, i) => (
            <TableCell key={i}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, i) => (
          <EventRow item={item} key={i} />
        ))}
      </TableBody>
    </Table>
  )
}

interface EventRowProps {
  item: TrackEvent
}

const EventRow: FC<EventRowProps> = ({ item }) => {
  return (
    <TableRow>
      <TableCell>{item.tick}</TableCell>
      <TableCell>{statusForEvent(item)}</TableCell>
      <TableCell>{"value" in item ? item.value : ""}</TableCell>
    </TableRow>
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

const EventList: FC<EventListProps> = ({ events }) => {
  return (
    <div className="EventList">
      <EventTable items={events} headers={["Tick", "Status", "Value"]} />
    </div>
  )
}

export default EventList
