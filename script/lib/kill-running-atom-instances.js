const childProcess = require('child_process');

const CONFIG = require('../config.js');
const Task = require("./task")

class KillRunningAtomInstances extends Task {
  constructor() {
    super("Kill running Atom instances");
  }

  run() {
    if (process.platform === 'win32') {
      // Use START as a way to ignore error if Atom.exe isnt running
      childProcess.execSync(`START taskkill /F /IM ${CONFIG.executableName}`);
    } else {
      childProcess.execSync(`pkill -9 ${CONFIG.appMetadata.productName} || true`);
    }
  }
}

module.exports = new KillRunningAtomInstances();
