const fs = require('fs')
const url = require('url')
const path = require('path')
const { app, ipc, BrowserWindow } = require('electron')

console.log('start tau app ...')
const PORT = process.env.PORT || 3000

function createWindow() {
  /*
  let fileurl = url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
  })
  */
  let fileurl = `http://localhost:${PORT}`
  win = new BrowserWindow(fileurl, "Mist running in Tau", 800, 600)
  // and load the index.html of the app.
  win.loadUrl('index.html')
}

app.on('ready', createWindow)