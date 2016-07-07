<track-list>
  <ul>
    <li each={tracks} class={selected ? "selected" : ""}>
      <p class="name" onclick={onClick}>{name}</p>
      <p class="mute">{mute ? "&#xe618;" : "&#xe617;"}</p>
    </li>
  </ul>

  <script type="text/javascript">
    this.tracks = []
    this.selectedTrackId = 0
    this.emitter = {}
    riot.observable(this.emitter)

    this.onClick = e => {
      this.emitter.trigger("select-track", e.item.trackId)
    }

    this.on("update", () => {
      if (!this.song) {
        return
      }
      this.tracks = this.song.getTracks().map((t, i) => {
        return {
          name: `${i}. ${t.name || ""}`,
          mute: false,
          selected: i == this.selectedTrackId,
          trackId: i
        }
      })
    })
  </script>

  <style scoped>
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  li {
    border-bottom: 1px solid rgb(232, 232, 232);
    overflow: hidden;
  }

  li.selected {
    color: rgb(62, 78, 238);
  }

  .name {
    margin: 0;
    float: left;
    width: 70%;
    box-sizing: border-box;
    padding: 0.5em;
    cursor: pointer;
  }

  .mute {
    float: left;
    width: 30%;
    margin: 0;
    font-family: "Flat-UI-Icons";
    font-weight: normal;
    font-size: 110%;
    padding: 0.5em;
    box-sizing: border-box;
    text-align: center;
  }
  </style>
</track-list>