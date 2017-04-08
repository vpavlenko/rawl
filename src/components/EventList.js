import React, { Component } from "react"
import { Table, Column, Cell } from "fixed-data-table"
import Dimensions from "react-dimensions"
import _ from "lodash"
import { controllerTypeString } from "../helpers/noteNumberString"

import "./EventList.css"

const AutoSizingTable = Dimensions()(
  class extends Component {
    render() {
      const p = _.omit(this.props, ["containerWidth", "containerHeight"])
      return <Table
        {...p}
        width={this.props.containerWidth}
        height={this.props.containerHeight} />
    }
  })

function EventListContent(props) {
  const events = props.events
  return <div className="event-list">
    <AutoSizingTable
      rowHeight={24}
      rowsCount={events.length}
      headerHeight={24}>
      <Column
        header={<Cell>Tick</Cell>}
        cell={({rowIndex, ...props}) => (
          <Cell {...props}>
            {events[rowIndex].tick}
          </Cell>
        )}
        fixed={true}
        width={40}
      />
      <Column
        header={<Cell>Status</Cell>}
        cell={({rowIndex, ...props}) => (
          <Cell {...props}>
            {events[rowIndex].status}
          </Cell>
        )}
        flexGrow={2}
        width={40}
      />
      <Column
        header={<Cell>Value</Cell>}
        cell={({rowIndex, ...props}) => (
          <Cell {...props}>
            {events[rowIndex].value}
          </Cell>
        )}
        flexGrow={1}
        width={40}
      />
    </AutoSizingTable>
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
