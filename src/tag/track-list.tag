<track-list>
  <ul>
    <li each={tracks} class={selected ? "selected" : ""}>
      <p class="name" onclick={onClick}>{name}</p>
      <p class="mute" onclick={onClickMute}>{mute ? "&#xe618;" : "&#xe617;"}</p>
    </li>
  </ul>
  <p class="add-track" onclick={onClickAddTrack}><span class="icon">&#xe608;</span> Add Track</p>

  <script type="text/javascript">
    this.tracks = []
    this.selectedTrackId = 0
    this.emitter = {}
    riot.observable(this.emitter)

    this.onClickMute = e => {
      this.emitter.trigger("mute-track", e.item.trackId)
    }

    this.onClick = e => {
      this.emitter.trigger("select-track", e.item.trackId)
    }

    this.onClickAddTrack = e => {
      this.emitter.trigger("add-track")
    }

    SharedService.player.on("change-mute", () => {
      this.update()
    })

    this.on("update", () => {
      if (!this.song) {
        return
      }
      this.tracks = this.song.getTracks().map((t, i) => {
        return {
          name: `${i}. ${t.name || ""}`,
          mute: SharedService.player.isChannelMuted(t.channel),
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

  .add-track {
    padding: 0.5em;
    margin: 0;
    color: rgb(183, 183, 183);
    cursor: pointer;
  }

  .add-track:hover {
    color: black;
  }

  .add-track .icon {
    margin-right: 0.5em;
    font-size: 80%;
    font-family: "Flat-UI-Icons";
    font-weight: normal;
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