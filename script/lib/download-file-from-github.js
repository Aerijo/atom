'use strict';

const fs = require('fs-extra');
const path = require('path');
const syncRequest = require('sync-request');

const Task = require("./task");

class DownloadFromGithub extends Task {
  constructor() {
    super("Download from GitHub");
  }

  run(downloadURL, destinationPath) {
    this.subtask(`Downloading file from GitHub Repository to ${destinationPath}`);
    const response = syncRequest('GET', downloadURL, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        'User-Agent': 'Atom Build'
      }
    });

    if (response.statusCode === 200) {
      fs.mkdirpSync(path.dirname(destinationPath));
      fs.writeFileSync(destinationPath, response.body);
      this.info(`Download to ${destinationPath} finished`);
    } else {
      throw new Error(
        'Error downloading file. HTTP Status ' + response.statusCode + '.'
      );
    }
  }
}

module.exports = new DownloadFromGithub();
