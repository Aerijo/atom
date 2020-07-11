'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

const CONFIG = require('../config');
const Task = require("./task");

class DumpSymbols extends Task {
  constructor() {
    super("Dump symbols");
  }

  skip() {
    if (process.platform === 'win32') {
      return 'minidump is not supported on Windows';
    }
  }

  run() {
    this.subtask(`Dumping symbols in ${CONFIG.symbolsPath}`);
    const binaryPaths = glob.sync(
      path.join(CONFIG.intermediateAppPath, 'node_modules', '**', '*.node')
    );
    return Promise.all(binaryPaths.map(this.dumpSymbol));
  }

  dumpSymbol(binaryPath) {
    const minidump = require('minidump');

    return new Promise(resolve => {
      minidump.dumpSymbol(binaryPath, (error, content) => {
        if (error) {
          this.error(error);
          throw new Error(error);
        } else {
          const moduleLine = /MODULE [^ ]+ [^ ]+ ([0-9A-F]+) (.*)\n/.exec(
            content
          );
          if (moduleLine.length !== 3) {
            const errorMessage = `Invalid output when dumping symbol for ${binaryPath}`;
            this.error(errorMessage);
            throw new Error(errorMessage);
          } else {
            const filename = moduleLine[2];
            const symbolDirPath = path.join(
              CONFIG.symbolsPath,
              filename,
              moduleLine[1]
            );
            const symbolFilePath = path.join(symbolDirPath, `${filename}.sym`);
            fs.mkdirpSync(symbolDirPath);
            fs.writeFileSync(symbolFilePath, content);
            resolve();
          }
        }
      });
    });
  }
}

module.exports = new DumpSymbols();
