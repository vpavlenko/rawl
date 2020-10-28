import React from "react"
import ReactDOM from "react-dom"
import { TrackEvent } from "../../../common/track"
import Popup from "../Popup/Popup"
import "./EventEditor.css"
import EventList from "./EventList"

interface EventEditorContentProps {
  events: TrackEvent[]
  onClickOK: () => void
  onClickCancel: () => void
}

function EventEditorContent({
  events,
  onClickOK,
  onClickCancel,
}: EventEditorContentProps) {
  return (
    <div className="EventEditor">
      <div className="container">
        <EventList events={events} />
        <div className="footer">
          <button className="ok" onClick={onClickOK}>
            OK
          </button>
          <button className="cancel" onClick={onClickCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export type EventEditorProps = EventEditorContentProps

export default function EventEditor({
  onClickOK,
  onClickCancel,
  events,
}: EventEditorProps) {
  return (
    <EventEditorContent
      onClickOK={onClickOK}
      onClickCancel={onClickCancel}
      events={events}
    />
  )
}

export function show(events: TrackEvent[]) {
  const popup = new Popup()
  popup.show()

  ReactDOM.render(
    <EventEditor
      events={events}
      onClickCancel={() => {
        popup.close()
      }}
      onClickOK={() => {
        popup.close()
      }}
    />,
    popup.getContentElement()
  )
}
