'use strict';

const childProcess = require('child_process');

const CONFIG = require('../config');
const Task = require("./task");

class RunApmInstall extends Task {
  constructor() {
    super("Run apm install");
  }

  run(packagePath, ci, stdioOptions) {
    const installEnv = Object.assign({}, process.env);
    // Set resource path so that apm can load metadata related to Atom.
    installEnv.ATOM_RESOURCE_PATH = CONFIG.repositoryRootPath;
    this.info(`Set ATOM_RESOURCE_PATH to ${installEnv.ATOM_RESOURCE_PATH}`);

    // Set our target (Electron) version so that node-pre-gyp can download the
    // proper binaries.
    installEnv.npm_config_target = CONFIG.appMetadata.electronVersion;
    this.info(`Set npm_config_target to ${installEnv.npm_config_target}`);

    childProcess.execFileSync(CONFIG.getApmBinPath(), [ci ? 'ci' : 'install'], {
      env: installEnv,
      cwd: packagePath,
      stdio: stdioOptions || 'inherit'
    });
  }
}

module.exports = new RunApmInstall();
