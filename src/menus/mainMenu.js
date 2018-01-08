const { remote } = window.require("electron")
const { Menu, dialog, process, app } = remote

export default function mainMenu(song, dispatch) {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New",
          click: () => {
            dispatch("CREATE_SONG")
          }
        },
        {
          label: "Open",
          click: () => {
            dialog.showOpenDialog({
              filters: [{
                name: "Standard MIDI File",
                extensions: ["mid", "midi"]
              }]
            }, files => {
              if (files) {
                dispatch("OPEN_SONG", { filepath: files[0] })
              }
            })
          }
        },
        {
          label: "Save",
          click: () => {
            dispatch("SAVE_SONG", { filepath: song.filepath })
          }
        },
        {
          label: "Save As",
          click: () => {
            dialog.showSaveDialog({
              defaultPath: song.filepath,
              filters: [{
                name: "Standard MIDI File",
                extensions: ["mid", "midi"]
              }]
            }, filepath => {
              dispatch("SAVE_SONG", { filepath })
            })
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          click: () => dispatch("UNDO")
        },
        {
          label: "Redo",
          click: () => dispatch("REDO")
        }
      ]
    }
  ]

  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: "about"},
        {type: "separator"},
        {role: "services", submenu: []},
        {type: "separator"},
        {role: "hide"},
        {role: "hideothers"},
        {role: "unhide"},
        {type: "separator"},
        {role: "quit"}
      ]
    })

    // Window menu
    template.push({
      label: "Window",
      submenu: [
        {role: "close"},
        {role: "minimize"},
        {role: "zoom"},
        {type: "separator"},
        {role: "front"}
      ]
    })
  }
  return Menu.buildFromTemplate(template)
}