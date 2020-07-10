'use strict';

const childProcess = require('child_process');

const CONFIG = require('../config');
const Task = require("./task")

process.env.ELECTRON_CUSTOM_VERSION = CONFIG.appMetadata.electronVersion;

class InstallScriptDeps extends Task {
  constructor() {
    super("Install script dependencies");
  }

  run(ci) {
    this.subtask('Installing script dependencies');
    childProcess.execFileSync(
      CONFIG.getNpmBinPath(ci),
      ['--loglevel=error', ci ? 'ci' : 'install'],
      { env: process.env, cwd: CONFIG.scriptRootPath, stdio: "inherit" }
    );
  };
}

module.exports = new InstallScriptDeps();
