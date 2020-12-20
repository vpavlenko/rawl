import { AnyEvent } from "midifile-ts"
import { parseMessage } from "./parseMessage"

export const messageToEvent = (
  message: ReturnType<typeof parseMessage>
): AnyEvent => {
  return {
    ...message,
    deltaTime: 0,
    type: "channel",
  }
}
