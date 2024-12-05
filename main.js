require('babel-register')
require('events').EventEmitter.defaultMaxListeners = 100
const {app, BrowserWindow, ipcMain, shell} = require('electron')
const spawn = require('child_process').spawn
const glob = require('glob')
const url = require('url')
const path = require('path')
const fs = require('fs')
const logger = require('./modules/logger')
const log = logger.create('main')
const kuskdLog = logger.create('kuskd')
const Settings = require('./modules/settings')

const tcpPortUsed = require('tcp-port-used');

let win, kuskdInit, kuskdNode

global.fileExist = false
global.mining = {isMining: false}
let startnode = false

Settings.init()

function initialize () {

  function createWindow() {
    // Create browser Window

    const icon_path = path.join(__dirname, '/static/images/app-icon/png/app.png')
    win = new BrowserWindow({
      width: 1024 + 238,
      height: 768,
      minHeight: 768,
      minWidth: 1024,
      titleBarStyle: 'hidden',
      'webPreferences': {
        'webSecurity': !process.env.DEV_URL,
        'preload': path.join(__dirname, '/modules/preload.js')
      },
      icon: icon_path
    })

    const startUrl = process.env.DEV_URL ||
      url.format({
        pathname: path.join(__dirname, '/public/index.html'),
        protocol: 'file:',
        slashes: true
      })
    win.loadURL(startUrl)

    if(process.env.DEV){
      win.webContents.openDevTools()
    }

    win.webContents.on('new-window', function(e, url) {
      e.preventDefault()
      shell.openExternal(url)
    })

    win.webContents.on('did-finish-load', function () {
      if(startnode){
        win.webContents.send('ConfiguredNetwork', 'startNode')
      }
    })

    win.on('closed', () => {
      win = null
      app.quit()
    })
  }

  app.on('ready', () => {

    loadMenu()

    setupConfigure()

    kuskd()

    createWindow()
  })

//All window Closed
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  })

  app.on('before-quit', () => {
    if(kuskdInit){
      kuskdInit.kill('SIGINT')
      log.info('Kill kuskd Init command...')
    }
    if(kuskdNode){
      kuskdNode.kill('SIGINT')
      const killTimeout = setTimeout(() => {
        kuskdNode.kill('SIGKILL')
      }, 8000 /* 8 seconds */)

      kuskdNode.once('close', () => {
        clearTimeout(killTimeout)
        kuskdNode = null
      })

      log.info('Kill kuskd Mining command...')
    }
  })
}

function setKuskNode(event) {
  kuskdNode = spawn( `${Settings.kuskdPath}`, ['node', '--web.closed', '--home', Settings.kuskdDataPath] )

  kuskdNode.stdout.on('data', function(data) {
    kuskdLog.info(`kuskd node: ${data}`)
  })

  kuskdNode.stderr.on('data', function(data) {
    kuskdNode.on('exit', function (code) {
      kuskdLog.info('kusk Node exited with code ' + code)
      app.quit()
    })
  })

  tcpPortUsed.waitUntilUsed(9888, 500, 20000)
    .then(function() {
      if (event) {
        event.sender.send('ConfiguredNetwork', 'startNode')
      }
      else {
        startnode = true
        win.webContents.send('ConfiguredNetwork', 'startNode')
      }
    }, function(err) {
      kuskdLog.info('Error:', err.message);
    });
}

function setKuskInit(event, kuskNetwork) {
  // Init kuskd
  kuskdInit = spawn(`${Settings.kuskdPath}`, ['init', '--chain_id',  `${kuskNetwork}`, '--home', Settings.kuskdDataPath] )

  kuskdInit.stdout.on('data', function(data) {
    kuskdLog.info(`kuskd init: ${data}`)
  })

  kuskdInit.stderr.on('data', function(data) {
    kuskdLog.info(`kuskd init: ${data}`)
  })

  kuskdInit.on('exit', function (code) {
    event.sender.send('ConfiguredNetwork','init')
    setKuskNode(event)
    kuskdLog.info('kusk init exited with code ' + code)
  })

  kuskdInit.once('close', () => {
    kuskdInit = null
  })
}

function kuskd(){
  const filePath = path.join(`${Settings.kuskdDataPath}/config.toml`)
  if (fs.existsSync(filePath)) {
    log.info('Kuskd Network has been inited')
    global.fileExist = true
    setKuskNode()
  }else {
    log.info('Init Kuskd Network...')
    ipcMain.on('kuskdInitNetwork', (event, arg) => {
      setKuskInit( event,  arg )
    })
  }
}

// Require each JS file in the main-process dir
function loadMenu () {
  const files = glob.sync(path.join(__dirname, 'modules/menus/*.js'))
  files.forEach((file) => { require(file) })
}

function setupConfigure(){
  const logFolder = {logFolder: path.join(app.getPath('userData'), 'logs')}
  const loggerOptions = Object.assign(logFolder)
  logger.setup(loggerOptions)
}


// Handle Squirrel on Windows startup events
switch (process.argv[1]) {
  case '--squirrel-install':
  case '--squirrel-uninstall':
  case '--squirrel-obsolete':
  case '--squirrel-updated':
    app.quit()
    break
  default:
    initialize()
}

