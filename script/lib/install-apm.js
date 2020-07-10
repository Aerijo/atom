'use strict';

const childProcess = require('child_process');

const CONFIG = require('../config');
const Task = require("./task")

class InstallApm extends Task {
  constructor() {
    super("Install apm");
  }

  run(_ci) {
    this.subtask('Installing apm');
    // npm ci leaves apm with a bunch of unmet dependencies
    childProcess.execFileSync(
      CONFIG.getNpmBinPath(),
      ['--global-style', '--loglevel=error', 'install'],
      { env: process.env, cwd: CONFIG.apmRootPath, stdio: "inherit" }
    );

    this.info("Installed apm, printing versions:")

    childProcess.execFileSync(
      CONFIG.getApmBinPath(),
      ['--version'],
      {stdio: 'inherit'}
    );
  }
}

module.exports = new InstallApm();
