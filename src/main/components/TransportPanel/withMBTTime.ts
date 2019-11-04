import { compose, withState, lifecycle, withHandlers } from "recompose"
import Player from "common/player/Player"
import { getMBTString } from "common/measure/mbt"
import Measure from "common/measure"

interface Inner {
  player: Player
  measures: Measure[]
}

interface Outer extends Inner {
  playerPosition: number
}

interface Props extends Outer {
  onTick: (tick: number) => void
}

export default compose<Inner, Outer>(
  withState("mbtTime", "updateMBTTime", 0),
  withHandlers<Inner & { updateMBTTime: (time: string) => void }, {}>({
    onTick: props => (tick: number) =>
      props.updateMBTTime(
        getMBTString(props.measures, tick, props.player.timebase)
      )
  }),
  lifecycle<Props, {}>({
    componentDidMount() {
      this.props.player.on("change-position", this.props.onTick)
    },
    componentWillUnmount() {
      this.props.player.on("change-position", this.props.onTick)
    }
  })
)
