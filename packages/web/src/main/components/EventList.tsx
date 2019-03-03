import React, { Component } from "react"
import { controllerTypeString } from "helpers/noteNumberString"

import "./EventList.css"

function Table({ items, headers, rowComponent }) {
  const Row = rowComponent
  return <table>
    <thead>
      <tr>
        {headers.map((header, i) => <th key={i}>{header}</th>)}
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => <Row item={item} key={i} />)}
    </tbody>
  </table>
}

function EventRow({ item }) {
  return <tr>
    <td>{item.tick}</td>
    <td>{statusForEvent(item)}</td>
    <td>{item.value}</td>
  </tr>
}

function statusForEvent(e) {
  switch (e.subtype) {
    case "controller":
      return controllerTypeString(e.controllerType)
    case "note":
      return `${e.subtype} ${e.duration}`
    default:
      return e.subtype
  }
}

export default function EventList({ events }) {
  return <div className="EventList">
    <Table items={events} rowComponent={EventRow} headers={["Tick", "Status", "Value"]} />
  </div>
}
