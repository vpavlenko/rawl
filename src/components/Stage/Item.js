// Stage に描画される要素
export default class Item {
  // get id: Any
  // get bounds: Rect

  render(ctx) {
    throw new Error("subclass must implement")
  }
}
