import { definePluigin } from '../../core';
import { Patcher } from './patcher';

export default definePluigin({
  apply(ctx) {
    ctx.commander.register({
      command: 'patch',
      description: 'Patch project with preset resources',
      optionMap: {
        cwd: {
          description: 'Specify current working directory',
          valueName: 'path',
        },
        preset: {
          description: 'Specify a preset to patch with',
          valueName: 'preset',
        },
      },
      fn: async (options) => {
        const patcher = new Patcher();
        await patcher.run(options);
      },
    });
  },
});
