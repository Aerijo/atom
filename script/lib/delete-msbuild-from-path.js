'use strict';

const fs = require('fs');
const path = require('path');

const Task = require("./task")

class DeleteMsbuild extends Task {
  constructor() {
    super("Delete MS Build from path");
  }

  run() {
    process.env['PATH'] = process.env['PATH']
      .split(';')
      .filter(function(p) {
        if (fs.existsSync(path.join(p, 'msbuild.exe'))) {
          this.info(
            'Excluding "' +
              p +
              '" from PATH to avoid msbuild.exe mismatch that causes errors during module installation'
          );
          return false;
        } else {
          return true;
        }
      })
      .join(';');
  }
}

module.exports = new DeleteMsbuild();
