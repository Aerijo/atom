const fs = require('fs-extra');
const CONFIG = require('../config');
const Task = require("./task")

class CleanOutputDirectory extends Task {
  constructor() {
    super("Clean output directory");
  }

  skip() {
    if (!fs.existsSync(CONFIG.buildOutputPath)) {
      return `Build output path (${CONFIG.buildOutputPath}) doesn't exist`;
    } else {
      return false;
    }
  }

  run() {
    this.subtask(`Cleaning ${CONFIG.buildOutputPath}`);
    fs.removeSync(CONFIG.buildOutputPath);
  }
}

module.exports = new CleanOutputDirectory();
