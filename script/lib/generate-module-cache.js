'use strict';

const fs = require('fs');
const path = require('path');
const ModuleCache = require('../../src/module-cache');

const CONFIG = require('../config');
const Task = require("./task")

class GenerateModuleCache extends Task {
  constructor() {
    super("Generate module cache")
  }

  run() {
    const packageNames = Object.keys(CONFIG.appMetadata.packageDependencies);
    this.subtask(`Generating module cache for ${packageNames.length} packages in ${CONFIG.intermediateAppPath}`);
    for (let packageName of packageNames) {
      ModuleCache.create(
        path.join(CONFIG.intermediateAppPath, 'node_modules', packageName)
      );
    }
    ModuleCache.create(CONFIG.intermediateAppPath);
    const newMetadata = JSON.parse(
      fs.readFileSync(path.join(CONFIG.intermediateAppPath, 'package.json'))
    );
    for (let folder of newMetadata._atomModuleCache.folders) {
      if (folder.paths.indexOf('') !== -1) {
        folder.paths = [
          '',
          'exports',
          'spec',
          'src',
          'src/main-process',
          'static',
          'vendor'
        ];
      }
    }
    CONFIG.appMetadata = newMetadata;
    fs.writeFileSync(
      path.join(CONFIG.intermediateAppPath, 'package.json'),
      JSON.stringify(CONFIG.appMetadata)
    );
  }
}

module.exports = new GenerateModuleCache();
