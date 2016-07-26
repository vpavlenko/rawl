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
    <tr each={ events } no-reorder onclick={onClick}>
      <td>{ tick }</td>
      <td>{ status }</td>
      <td>{ value }</td>
    </tr>
    </tbody>
  </table>

  <script type="text/javascript">
    function statusForEvent(e) {
      switch(e.subtype) {
        case "controller":
          return controllerTypeString(e.controllerType)
        case "note":
          return `${e.subtype} ${e.duration}`
        default:
          return e.subtype
      }
    }

    this.onClick = (e) => {
      console.log(e)
    }

    this.on("update", () => {
      if (!this.track) {
        return
      }

      this.events = this.track.getEvents().map(e => {
        return _.extend(e, { status: statusForEvent(e) })
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
    border: 1px solid var(--divider-color);
    border-right: none;
    border-left: none;
  }
  td {
    white-space: nowrap;
  }
  </style>
</event-list>