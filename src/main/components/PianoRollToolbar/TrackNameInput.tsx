import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { useStores } from "../../hooks/useStores"

const TrackName = styled.span`
  font-weight: bold;
  margin-right: 2em;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 14rem;
  min-width: 3em;
`

const Input = styled.input`
  font-size: inherit;
  font-family: inherit;
  border: ${({ theme }) => theme.dividerColor} 1px solid;
  color: inherit;
  height: 2rem;
  padding: 0 0.5rem;
  box-sizing: border-box;
  border-radius: 4px;
  margin-right: 1em;
  background: #00000017;
  outline: none;
`

export const TrackNameInput: FC = observer(() => {
  const rootStore = useStores()
  const trackName = rootStore.song.selectedTrack?.displayName ?? ""

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
          onBlur={() => setEditing(false)}
        />
      ) : (
        <TrackName onDoubleClick={() => setEditing(true)}>
          {trackName}
        </TrackName>
      )}
    </>
  )
})
