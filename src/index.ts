import * as core from '@actions/core';
import findUp from 'find-up';
import * as installer from './installer';
import addMatchers from './matchers';

async function run(): Promise<void> {
  try {
    const voltaVersion = core.getInput('volta-version', { required: false });

    await installer.getVolta(voltaVersion);

    const hasPackageJSON = await findUp('package.json');
    const nodeVersion = core.getInput('node-version', { required: false });
    if (nodeVersion !== '') {
      core.info(`installing Node ${nodeVersion === 'true' ? '' : nodeVersion}`);
      await installer.installNode(nodeVersion);

      if (hasPackageJSON) {
        await installer.pinNode(nodeVersion);
      }
    }

    const yarnVersion = core.getInput('yarn-version', { required: false });
    if (yarnVersion !== '') {
      core.info(`installing Yarn ${yarnVersion === 'true' ? '' : yarnVersion}`);
      await installer.installYarn(yarnVersion);

      // cannot pin `yarn` when `node` is not pinned as well
      if (nodeVersion !== '' && hasPackageJSON) {
        await installer.pinYarn(yarnVersion);
      }
    }

    await addMatchers();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
