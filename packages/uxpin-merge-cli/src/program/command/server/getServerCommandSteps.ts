import { join } from 'path';
import { startDebugServer } from '../../../debug/server/startDebugServer';
import { BuildOptions } from '../../../steps/building/BuildOptions';
import { TEMP_DIR_PATH } from '../../../steps/building/config/getConfig';
import { getAllComponentsFromCategories } from '../../../steps/serialization/component/categories/getAllComponentsFromCategories';
import { DSMetadata } from '../../DSMeta';
import { ServerProgramArgs } from '../../ProgramArgs';
import { thunkBuildComponentsLibrary } from '../../utils/thunkBuildComponentsLibrary';
import { Step } from '../Step';

export function getServerCommandSteps(buildOptions:BuildOptions, args:ServerProgramArgs):Step[] {
  return [
    { exec: thunkBuildComponentsLibrary(buildOptions), shouldRun: true },
    { exec: thunkStartServer(buildOptions, args.port), shouldRun: true },
  ];
}

function thunkStartServer(buildOptions:BuildOptions, port:number):(ds:DSMetadata) => Promise<any> {
  return ({ result: { categorizedComponents } }) => {
    return startDebugServer(getAllComponentsFromCategories(categorizedComponents), {
      port,
      root: join(buildOptions.projectRoot, TEMP_DIR_PATH),
    });
  };
}
