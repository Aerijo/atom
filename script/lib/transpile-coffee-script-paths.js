'use strict';

const CompileCache = require('../../src/compile-cache');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const CONFIG = require('../config');
const Task = require("./task");

class TranspileCS extends Task {
  constructor() {
    super("Transpile CoffeeScript");
  }

  run() {
    const paths = getPathsToTranspile();
    this.subtask(
      `Transpiling ${paths.length} CoffeeScript paths in ${CONFIG.intermediateAppPath}`
    );
    for (let path of paths) {
      this.transpileCoffeeScriptPath(path);
    }
  }

  transpileCoffeeScriptPath(coffeePath) {
    const jsPath = coffeePath.replace(/coffee$/g, 'js');
    fs.writeFileSync(
      jsPath,
      CompileCache.addPathToCache(coffeePath, CONFIG.atomHomeDirPath)
    );
    fs.unlinkSync(coffeePath);
  }
}

module.exports = new TranspileCS();

function getPathsToTranspile() {
  let paths = [];
  paths = paths.concat(
    glob.sync(path.join(CONFIG.intermediateAppPath, 'src', '**', '*.coffee'), {
      nodir: true
    })
  );
  paths = paths.concat(
    glob.sync(path.join(CONFIG.intermediateAppPath, 'spec', '*.coffee'), {
      nodir: true
    })
  );
  for (let packageName of Object.keys(CONFIG.appMetadata.packageDependencies)) {
    paths = paths.concat(
      glob.sync(
        path.join(
          CONFIG.intermediateAppPath,
          'node_modules',
          packageName,
          '**',
          '*.coffee'
        ),
        {
          ignore: path.join(
            CONFIG.intermediateAppPath,
            'node_modules',
            packageName,
            'spec',
            '**',
            '*.coffee'
          ),
          nodir: true
        }
      )
    );
  }
  return paths;
}
