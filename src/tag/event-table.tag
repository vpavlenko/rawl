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
    <tr>
      <th>Measure</th>
      <th>Tick</th>
      <th>Step</th>
      <th>Status</th>
      <th>Channel</th>
      <th>Number</th>
      <th>Value</th>
    </tr>
    <tr each={ opts.events }>
      <td>{ measure }</td>
      <td>{ tick }</td>
      <td>{ step }</td>
      <td>{ status }</td>
      <td>{ channel }</td>
      <td>{ number }</td>
      <td>{ value }</td>
    </tr>
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