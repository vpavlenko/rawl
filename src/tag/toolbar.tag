<toolbar>
  <div class="container">
    <input type="file" accept=".mid,.midi" onchange={onChangeFile}></input>
    <button onclick={onClickSave}>Save</button>
    <button onclick={onClickBackward}>←</button>
    <button onclick={onClickStop}>■</button>
    <button onclick={onClickPlay}>▶</button>
    <button onclick={onClickForward}>→</button>
    <button onclick={onClickPencil}>✎</button>
    <button onclick={onClickSelection}>□</button>
    <button onclick={onClickScaleUp}><img src="images/iconmonstr-magnifier-7-16.png"></button>
    <button onclick={onClickScaleDown}><img src="images/iconmonstr-magnifier-8-16.png"></button>
    <riot-select name="trackSelect" onselect={onSelectTrack}></riot-select>
    <riot-select name="quantizeSelect" onselect={onSelectQuantize}></riot-select>
  </div>

  <script type="text/javascript">
    "use strict"
    this.on("mount", () => {
      this.quantizeSelect._tag.update({options: quantizeOptions})
    })
    this.on("update", () => {
      if (this.song) {
        const trackOptions = this.song.getTracks().map((t, i) => { return {
          name: `${t.name}(${i})`,
          value: i,
          selected: i == 0
        }})
        this.trackSelect._tag.update({options: trackOptions})
      }
    })
    const quantizeOptions = [
      {
        name: "全音符",
        value: 1,
      },
      {
        name: "付点2分音符",
        value: 2 / 1.5,
      },
      {
        name: "2分音符",
        value: 2,
      },
      {
        name: "3連2分音符",
        value: 3,
      },
      {
        name: "付点4分音符",
        value: 4 / 1.5
      },
      {
        name: "4分音符",
        value: 4,
        selected: true
      },
      {
        name: "3連4分音符",
        value: 6,
      },
      {
        name: "付点8分音符",
        value: 8 / 1.5
      },
      {
        name: "8分音符",
        value: 8
      },
      {
        name: "3連8分音符",
        value: 12,
      },
      {
        name: "付点16分音符",
        value: 16 / 1.5
      },
      {
        name: "16分音符",
        value: 16
      },
      {
        name: "3連16分音符",
        value: 24,
      },
      {
        name: "付点32分音符",
        value: 32 / 1.5
      },
      {
        name: "32分音符",
        value: 32
      },
      {
        name: "3連16分音符",
        value: 48,
      },
      ]
  </script>
  <style scoped>
    .container {
      height: var(--header-height);
      box-sizing: border-box;
      border-bottom: 1px solid rgb(204, 204, 204);
      background: rgb(249, 249, 249);
      padding-top: 8px;
      padding-left: 1em;
    }

    .container button {
      width: 2em;
      height: 1.5em;
      padding: 0;
      vertical-align: top;
      font-size: 1.3em;
      -webkit-appearance: none;
      background: rgba(0, 0, 0, 0);
      border: none;
      cursor: pointer;
    }
    .container riot-select {
      margin-top: 2px;
      display: inline-block;
    }
  </style>
</toolbar>