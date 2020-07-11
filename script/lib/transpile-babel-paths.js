'use strict';

const CompileCache = require('../../src/compile-cache');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const CONFIG = require('../config');
const Task = require("./task");

class TranspileBabelPaths extends Task {
  constructor() {
    super("Transpile Babel paths");
  }

  run() {
    const paths = getPathsToTranspile();
    this.subtask(`Transpiling ${paths.length} Babel paths in ${CONFIG.intermediateAppPath}`);
    for (let path of paths) {
      this.info(`transpiling ${path}`)
      this.transpileBabelPath(path);
    }
  }

  transpileBabelPath(path) {
    fs.writeFileSync(
      path,
      CompileCache.addPathToCache(path, CONFIG.atomHomeDirPath)
    );
  }
}

module.exports = new TranspileBabelPaths();

function getPathsToTranspile() {
  let paths = [];
  for (let packageName of Object.keys(CONFIG.appMetadata.packageDependencies)) {
    paths = paths.concat(
      glob.sync(
        path.join(
          CONFIG.intermediateAppPath,
          'node_modules',
          packageName,
          '**',
          '*.js'
        ),
        {
          ignore: path.join(
            CONFIG.intermediateAppPath,
            'node_modules',
            packageName,
            'spec',
            '**',
            '*.js'
          ),
          nodir: true
        }
      )
    );
  }
  return paths;
}
