const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const Task = require("./task");

class CodeSignOnWindows extends Task {
  constructor() {
    super("Code sign on Windows");
  }

  skip() {
    if (
      !process.env.ATOM_WIN_CODE_SIGNING_CERT_DOWNLOAD_URL &&
      !process.env.ATOM_WIN_CODE_SIGNING_CERT_PATH
    ) {
      return 'Skipping code signing because the ATOM_WIN_CODE_SIGNING_CERT_DOWNLOAD_URL environment variable is not defined';
    }
  }

  run(filesToSign) {
    let certPath = process.env.ATOM_WIN_CODE_SIGNING_CERT_PATH;
    if (!certPath) {
      certPath = path.join(os.tmpdir(), 'win.p12');
      this.subtask("Downloading cert files");
      this.child(require('./download-file-from-github'),
        process.env.ATOM_WIN_CODE_SIGNING_CERT_DOWNLOAD_URL,
        certPath
      );
    }
    try {
      for (const fileToSign of filesToSign) {
        this.info(`Code-signing executable at ${fileToSign}`);
        signFile(fileToSign);
      }
    } finally {
      if (!process.env.ATOM_WIN_CODE_SIGNING_CERT_PATH) {
        fs.removeSync(certPath);
      }
    }

    function signFile(fileToSign) {
      const signCommand = path.resolve(
        __dirname,
        '..',
        'node_modules',
        '@atom',
        'electron-winstaller',
        'vendor',
        'signtool.exe'
      );
      const args = [
        'sign',
        `/f ${certPath}`, // Signing cert file
        `/p ${process.env.ATOM_WIN_CODE_SIGNING_CERT_PASSWORD}`, // Signing cert password
        '/fd sha256', // File digest algorithm
        '/tr http://timestamp.digicert.com', // Time stamp server
        '/td sha256', // Times stamp algorithm
        `"${fileToSign}"`
      ];
      const result = spawnSync(signCommand, args, {
        stdio: 'inherit',
        shell: true
      });
      if (result.status !== 0) {
        // Ensure we do not dump the signing password into the logs if something goes wrong
        throw new Error(
          `Command ${signCommand} ${args
            .map(a =>
              a.replace(process.env.ATOM_WIN_CODE_SIGNING_CERT_PASSWORD, '******')
            )
            .join(' ')} exited with code ${result.status}`
        );
      }
    }
  }
}

module.exports = new CodeSignOnWindows();
