const path = require('path');

const CONFIG = require('../config');

module.exports = async function() {
  // We can't require fs-extra or glob if `script/bootstrap` has never been run,
  // because they are third party modules. This is okay because cleaning
  // dependencies only makes sense if dependencies have been installed at least
  // once.
  const fs = require('fs-extra');
  const glob = require('glob');

  const removePath = async p => {
    console.log(`Cleaning ${p}`);
    await fs.remove(p);
    console.log(`Cleaned ${p}`);
  }

  const apmDependenciesPath = path.join(CONFIG.apmRootPath, 'node_modules');
  const atomDependenciesPath = path.join(
    CONFIG.repositoryRootPath,
    'node_modules'
  );
  const scriptDependenciesPath = path.join(
    CONFIG.scriptRootPath,
    'node_modules'
  );

  await Promise.all([
    removePath(apmDependenciesPath),
    removePath(atomDependenciesPath),
    removePath(scriptDependenciesPath),
    (async () => {
      const bundledPackageDependenciesPaths = path.join(
        CONFIG.repositoryRootPath,
        'packages',
        '**',
        'node_modules'
      );

      const paths = glob.sync(
        bundledPackageDependenciesPaths
      );

      console.log(`Cleaning ${bundledPackageDependenciesPaths}`);
      await Promise.all(paths.map(p => fs.remove(p)));
      console.log(`Cleaned ${bundledPackageDependenciesPaths}`);
    })()
  ]);
};
