const electron = require("electron")
const { app, BrowserWindow, ipcMain } = electron

const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer")

let mainWindow

function installDevTools() {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension: ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
}

function createWindow() {
  installDevTools()

  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  mainWindow.loadURL("http://localhost:3000")

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

app.commandLine.appendSwitch("disable-renderer-backgrounding")
app.on("ready", createWindow)

app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", function () {
  // On OS X it"fs common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

/**

  メインウィンドウからシンセのウィンドウにメッセージを送るために
  ipcMain を経由する

*/
let synthWindow

app.on("browser-window-created", (e, win) => {
  if (win.getTitle() === "synth") {
    synthWindow = win
  }
})

ipcMain.on("midi", (e, message) => {
  if (!synthWindow) {
    return
  }
  synthWindow.webContents.send("midi", message)
})

ipcMain.on("create-synth-window", () => {
  // シンセのウィンドウを作成済みでなければ作る
  if (synthWindow) {
    return
  }
  const url = "http://localhost:3000/#synth"
  const win = new BrowserWindow({
    title: "synth",
    width: 375,
    height: 600,
    frame: false
  })
  win.loadURL(url)
  win.webContents.openDevTools()

  synthWindow = win
  win.on("closed", function () {
    synthWindow = null
  })
})
