const { app } = require('electron')
const path = require('path')
const glob = require('glob')

// import logger from './logger'

let instance = null

class Settings {
  constructor() {
    if (!instance) {
      instance = this
    }

    return instance
  }

  init() {
    // const logLevel = { logLevel: 'info' }
    // const logFolder = { logFolder: path.join(this.userDataPath, 'logs') }
    // const loggerOptions = Object.assign('info', logLevel, logFolder)
    // logger.setup(loggerOptions)
  }

  get userDataPath() {
    return app.getPath('userData')
  }

  get appDataPath() {
    // Application Support/
    return app.getPath('appData')
  }

  get userHomePath() {
    return app.getPath('home')
  }

  get kuskdPath() {
    return process.env.DEV?
      path.join(__dirname, '../kuskd/kuskd-darwin_amd64'):
      glob.sync( path.join(__dirname, '../../kuskd/kuskd*'))
  }

  get kuskdDataPath(){
    let kuskdDataPath
    switch (process.platform){
      case 'win32':
        kuskdDataPath = `${app.getPath('appData')}/Kusk-2`
        break
      case 'darwin':
        kuskdDataPath = `${app.getPath('home')}/Library/Application Support/Kusk-2`
        break
      case 'linux':
        kuskdDataPath = `${app.getPath('home')}/.kusk-2`
    }
    return kuskdDataPath
  }

  constructUserDataPath(filePath) {
    return path.join(this.userDataPath, filePath)
  }
}

module.exports = new Settings()
