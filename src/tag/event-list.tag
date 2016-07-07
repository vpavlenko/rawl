<!--
opts = {
  events: [
    {
      measure: <Number>
      tick: <Number>
      step: <Number>
      status: <String>
      channel: <Number>
      number: <String>
      value: <Number>
    },
    ...
  ]
}
-->
<event-list>
  <table>
    <thead>
    <tr>
      <th>Tick</th>
      <th>Status</th>
      <th>Value</th>
    </tr>
    </thead>
    <tbody>
    <tr each={ events } no-reorder>
      <td>{ tick }</td>
      <td>{ subtype == "note" ? subtype + " " + duration : subtype }</td>
      <td>{ value }</td>
    </tr>
    </tbody>
  </table>

  <script type="text/javascript">
    this.on("update", () => {
      if (!this.track) {
        return
      }

      this.events = this.track.getEvents().map(e => {
        return e
      })
    })
  </script>

  <style scoped>
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    font-weight: normal;
    border: 1px solid rgb(204, 204, 204);
    border-right: none;
    border-left: none;
  }
  td {
    white-space: nowrap;
  }
  </style>
</event-list>