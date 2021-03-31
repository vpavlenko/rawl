import { observer } from "mobx-react-lite"
import React from "react"
import { useStores } from "../../hooks/useStores"
import EventList from "../EventEditor/EventList"

export const EventListPane = observer(() => {
  const rootStore = useStores()
  const events = rootStore.song.selectedTrack?.events ?? []

  return <EventList events={events} />
})
