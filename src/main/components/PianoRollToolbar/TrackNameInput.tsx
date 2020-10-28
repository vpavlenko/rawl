import { useStores } from "main/hooks/useStores"
import { useObserver } from "mobx-react-lite"
import React, { FC, useState } from "react"
import styled from "styled-components"

const TrackName = styled.span`
  font-weight: bold;
  margin-right: 2em;
  font-size: 1rem;
`

const Input = styled.input`
  font-size: inherit;
  font-family: inherit;
  border: var(--divider-color) 1px solid;
  color: inherit;
  height: 2rem;
  padding: 0 0.5rem;
  box-sizing: border-box;
  border-radius: 4px;
  margin-right: 1em;
  background: #00000017;
  outline: none;
`

export const TrackNameInput: FC = () => {
  const { rootStore } = useStores()
  const { trackName } = useObserver(() => ({
    trackName: rootStore.song.selectedTrack?.displayName ?? "",
  }))
  const [isEditing, setEditing] = useState(false)
  return (
    <>
      {isEditing ? (
        <Input
          defaultValue={rootStore.song.selectedTrack?.name ?? ""}
          ref={(c) => c?.focus()}
          // to support IME we use onKeyPress instead of onKeyDown for capture Enter
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              rootStore.song.selectedTrack?.setName(e.currentTarget.value)
              setEditing(false)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditing(false)
            }
          }}
        />
      ) : (
        <TrackName onDoubleClick={() => setEditing(true)}>
          {trackName}
        </TrackName>
      )}
    </>
  )
}
