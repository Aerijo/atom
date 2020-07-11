'use strict';

const CompileCache = require('../../src/compile-cache');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const CONFIG = require('../config');
const Task = require("./task")

class TranspileCSON extends Task {
  constructor() {
    super("Transpile CSON path");
  }

  run() {
    const paths = getPathsToTranspile();
    this.subtask(`Transpiling ${paths.length} CSON paths in ${CONFIG.intermediateAppPath}`);
    for (let path of paths) {
      this.transpileCsonPath(path);
    }
  }

  transpileCsonPath(csonPath) {
    const jsonPath = csonPath.replace(/cson$/g, 'json');
    fs.writeFileSync(
      jsonPath,
      JSON.stringify(
        CompileCache.addPathToCache(csonPath, CONFIG.atomHomeDirPath)
      )
    );
    fs.unlinkSync(csonPath);
  }
}

module.exports = new TranspileCSON();

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
          '*.cson'
        ),
        {
          ignore: path.join(
            CONFIG.intermediateAppPath,
            'node_modules',
            packageName,
            'spec',
            '**',
            '*.cson'
          ),
          nodir: true
        }
      )
    );
  }
  return paths;
}
