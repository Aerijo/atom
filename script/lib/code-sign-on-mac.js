const CONFIG = require('../config');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const spawnSync = require('./spawn-sync');
const osxSign = require('electron-osx-sign');
const macEntitlementsPath = path.join(
  CONFIG.repositoryRootPath,
  'resources',
  'mac',
  'entitlements.plist'
);
const Task = require("./task")

class CodeSignOnMac extends Task {
  constructor() {
    super("Code sign on mac");
  }

  skip() {
    if (
      !process.env.ATOM_MAC_CODE_SIGNING_CERT_DOWNLOAD_URL &&
      !process.env.ATOM_MAC_CODE_SIGNING_CERT_PATH
    ) {
      return 'Skipping code signing because the ATOM_MAC_CODE_SIGNING_CERT_DOWNLOAD_URL environment variable is not defined';
    }
  }

  async run(packagedAppPath) {
    let certPath = process.env.ATOM_MAC_CODE_SIGNING_CERT_PATH;
    if (!certPath) {
      this.info(`ATOM_MAC_CODE_SIGNING_CERT_PATH not defined, downloading from GitHub`);
      certPath = path.join(os.tmpdir(), 'mac.p12');
      this.child(require('./download-file-from-github'),
        process.env.ATOM_MAC_CODE_SIGNING_CERT_DOWNLOAD_URL,
        certPath
      );
    }
    try {
      this.subtask(
        `Ensuring keychain ${process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN} exists`
      );
      try {
        spawnSync(
          'security',
          ['show-keychain-info', process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN],
          { stdio: 'inherit' }
        );
      } catch (err) {
        this.subtask(
          `Creating keychain ${process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN}`
        );
        // The keychain doesn't exist, try to create it
        spawnSync(
          'security',
          [
            'create-keychain',
            '-p',
            process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN_PASSWORD,
            process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN
          ],
          { stdio: 'inherit' }
        );

        // List the keychain to "activate" it.  Somehow this seems
        // to be needed otherwise the signing operation fails
        spawnSync(
          'security',
          ['list-keychains', '-s', process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN],
          { stdio: 'inherit' }
        );

        // Make sure it doesn't time out before we use it
        spawnSync(
          'security',
          [
            'set-keychain-settings',
            '-t',
            '3600',
            '-u',
            process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN
          ],
          { stdio: 'inherit' }
        );
      }

      this.subtask(
        `Unlocking keychain ${process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN}`
      );
      const unlockArgs = ['unlock-keychain'];
      // For signing on local workstations, password could be entered interactively
      if (process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN_PASSWORD) {
        unlockArgs.push(
          '-p',
          process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN_PASSWORD
        );
      }
      unlockArgs.push(process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN);
      spawnSync('security', unlockArgs, { stdio: 'inherit' });

      this.subtask(
        `Importing certificate at ${certPath} into ${
          process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN
        } keychain`
      );
      spawnSync('security', [
        'import',
        certPath,
        '-P',
        process.env.ATOM_MAC_CODE_SIGNING_CERT_PASSWORD,
        '-k',
        process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN,
        '-T',
        '/usr/bin/codesign'
      ]);

      this.subtask(
        'Running incantation to suppress dialog when signing on macOS Sierra'
      );
      try {
        spawnSync('security', [
          'set-key-partition-list',
          '-S',
          'apple-tool:,apple:',
          '-s',
          '-k',
          process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN_PASSWORD,
          process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN
        ]);
      } catch (e) {
        this.error("Incantation failed... maybe this isn't Sierra?");
      }

      this.subtask(`Code-signing application at ${packagedAppPath}`);

      try {
        await osxSign.signAsync({
          app: packagedAppPath,
          entitlements: macEntitlementsPath,
          'entitlements-inherit': macEntitlementsPath,
          identity: 'Developer ID Application: GitHub',
          keychain: process.env.ATOM_MAC_CODE_SIGNING_KEYCHAIN,
          platform: 'darwin',
          hardenedRuntime: true
        });
        this.info('Application signing complete');
      } catch (err) {
        this.error('Applicaiton singing failed');
        this.error(err);
      }
    } finally {
      if (!process.env.ATOM_MAC_CODE_SIGNING_CERT_PATH) {
        this.subtask(`Deleting certificate at ${certPath}`);
        fs.removeSync(certPath);
      }
    }
  }
}

module.exports = new CodeSignOnMac();
