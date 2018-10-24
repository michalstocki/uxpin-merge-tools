import pMapSeries = require('p-map-series');
import { ComponentCategoryInfo } from '../steps/discovery/component/category/ComponentCategoryInfo';
import { getComponentCategoryInfos } from '../steps/discovery/component/category/getComponentCategoryInfos';
import { getDesignSystemMetadata } from '../steps/serialization/getDesignSystemMetadata';
import { printLine } from '../utils/console/printLine';
import { tapPromise } from '../utils/promise/tapPromise';
import { getProgramArgs } from './args/getProgramArgs';
import { ProgramArgs, RawProgramArgs } from './args/ProgramArgs';
import { getProjectPaths } from './args/providers/paths/getProjectPaths';
import { getSteps } from './command/getSteps';
import { getStepsForWatcher } from './command/getStepsForWatcher';
import { Step } from './command/Step';
import { DSMetadata } from './DSMeta';
import { setupWatcher } from './watcher/setupWatcher';

export async function runProgram(program:RawProgramArgs):Promise<any> {
  try {
    const programArgs:ProgramArgs = getProgramArgs(program);
    await runCommand(programArgs);
    setupProjectWatcher(programArgs);
  } catch (error) {
    logError(error);
  }
}

async function runCommand(programArgs:ProgramArgs):Promise<any> {
  await executeCommandSteps(programArgs, getSteps(programArgs));
}

function setupProjectWatcher(programArgs:ProgramArgs):void {
  if (!isWatchCommand(programArgs)) {
    return;
  }

  setupWatcher(programArgs, thunkRunCommandWhenFilesChanged(programArgs));
}

function thunkRunCommandWhenFilesChanged(programArgs:ProgramArgs):(path:string) => void {
  return async () => {
    try {
      await executeCommandSteps(programArgs, getStepsForWatcher(programArgs));
    } catch (error) {
      logError(error);
    }
  };
}

async function executeCommandSteps(programArgs:ProgramArgs, steps:Step[]):Promise<void> {
  const stepFunctions:StepExecutor[] = steps
    .filter((step) => step.shouldRun)
    .map((step) => tapPromise(step.exec));
  const infos:ComponentCategoryInfo[] = await getComponentCategoryInfos(getProjectPaths(programArgs));
  const designSystem:DSMetadata = await getDesignSystemMetadata(infos);
  await pMapSeries(stepFunctions, (step) => step(designSystem));
}

function isWatchCommand(programArgs:ProgramArgs):boolean {
  return programArgs.command === 'experiment';
}

function logError(errorMessage:string):void {
  printLine(`\nERROR:\n${errorMessage}`);
}

type StepExecutor = (designSystem:DSMetadata) => Promise<DSMetadata>;
