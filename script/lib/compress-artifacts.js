'use strict';

const fs = require('fs-extra');
const path = require('path');
const spawnSync = require('./spawn-sync');
const { path7za } = require('7zip-bin');

const CONFIG = require('../config');
const Task = require("./task")

class CompressArtifacts extends Task {
  constructor() {
    super("Compress artifacts");
  }

  run(packagedAppPath) {
    const appArchivePath = path.join(CONFIG.buildOutputPath, getArchiveName());
    this.compress(packagedAppPath, appArchivePath);

    if (process.platform === 'darwin') {
      const symbolsArchivePath = path.join(
        CONFIG.buildOutputPath,
        'atom-mac-symbols.zip'
      );
      this.compress(CONFIG.symbolsPath, symbolsArchivePath);
    }
  }

  compress(inputDirPath, outputArchivePath) {
    if (fs.existsSync(outputArchivePath)) {
      this.subtask(`Deleting "${outputArchivePath}"`);
      fs.removeSync(outputArchivePath);
    }

    this.subtask(`Compressing "${inputDirPath}" to "${outputArchivePath}"`);
    let compressCommand, compressArguments;
    if (process.platform === 'darwin') {
      compressCommand = 'zip';
      compressArguments = ['-r', '--symlinks'];
    } else if (process.platform === 'win32') {
      compressCommand = path7za;
      compressArguments = ['a', '-r'];
    } else {
      compressCommand = 'tar';
      compressArguments = ['caf'];
    }
    compressArguments.push(outputArchivePath, path.basename(inputDirPath));
    spawnSync(compressCommand, compressArguments, {
      cwd: path.dirname(inputDirPath),
      maxBuffer: 2024 * 2024
    });
  }
}

module.exports = new CompressArtifacts();

function getArchiveName() {
  switch (process.platform) {
    case 'darwin':
      return 'atom-mac.zip';
    case 'win32':
      return `atom-${process.arch === 'x64' ? 'x64-' : ''}windows.zip`;
    default:
      return `atom-${getLinuxArchiveArch()}.tar.gz`;
  }
}

function getLinuxArchiveArch() {
  switch (process.arch) {
    case 'ia32':
      return 'i386';
    case 'x64':
      return 'amd64';
    default:
      return process.arch;
  }
}
