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
  onTick: (tick: number) => void
}

export default compose<Inner, Outer>(
  withState("mbtTime", "updateMBTTime", 0),
  withHandlers<Inner & { updateMBTTime: (time: string) => void }, {}>({
    onTick: props => (tick: number) =>
      props.updateMBTTime(
        props.measureList.getMBTString(tick, props.player.timebase)
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
