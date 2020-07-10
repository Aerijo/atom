const path = require('path');

const CONFIG = require('../config');
const Task = require('./task')

class CleanDependencies extends Task {
  constructor() {
    super("Clean dependencies");
  }

  run() {
    const fs = require('fs-extra');
    const glob = require('glob');

    const apmDependenciesPath = path.join(CONFIG.apmRootPath, 'node_modules');
    this.subtask(`Cleaning ${apmDependenciesPath}`);
    fs.removeSync(apmDependenciesPath);

    const atomDependenciesPath = path.join(
      CONFIG.repositoryRootPath,
      'node_modules'
    );
    this.subtask(`Cleaning ${atomDependenciesPath}`);
    fs.removeSync(atomDependenciesPath);

    const scriptDependenciesPath = path.join(
      CONFIG.scriptRootPath,
      'node_modules'
    );
    this.subtask(`Cleaning ${scriptDependenciesPath}`);
    fs.removeSync(scriptDependenciesPath);

    const bundledPackageDependenciesPaths = path.join(
      CONFIG.repositoryRootPath,
      'packages',
      '**',
      'node_modules'
    );
    this.subtask(`Cleaning ${bundledPackageDependenciesPaths}`);
    for (const bundledPackageDependencyPath of glob.sync(
      bundledPackageDependenciesPaths
    )) {
      fs.removeSync(bundledPackageDependencyPath);
    }
  }
}


module.exports = new CleanDependencies();
