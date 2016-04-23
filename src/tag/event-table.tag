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
<event-table>
  <table>
    <thead>
    <tr>
      <th>Measure</th>
      <th>Tick</th>
      <th>Step</th>
      <th>Status</th>
      <th>Channel</th>
      <th>Number</th>
      <th>Value</th>
    </tr>
    </thead>
    <tbody>
    <tr each={ events } no-reorder>
      <td>{ measure }</td>
      <td>{ tick }</td>
      <td>{ time }</td>
      <td>{ subtype + " " + duration }</td>
      <td>{ channel }</td>
      <td>{ noteNumber }</td>
      <td>{ velocity }</td>
    </tr>
    </tbody>
  </table>

  <script type="text/javascript">
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
  </style>
</event-table>