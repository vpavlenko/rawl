import { compose, withState, lifecycle, withHandlers } from "recompose"
import Player from "common/player/Player"
import { MeasureList } from "common/measure"

interface Inner {
  player: Player
  measureList: MeasureList
}

interface Outer extends Inner {
  playerPosition: number
}

interface Props extends Outer {
  onTick: (number) => void
}

export default compose<Inner, Outer>(
  withState("mbtTime", "updateMBTTime", 0),
  withHandlers<Inner & { updateMBTTime: (number) => void }, {}>({
    onTick: props => tick => props.updateMBTTime(props.measureList.getMBTString(tick, props.player.timebase)),
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
