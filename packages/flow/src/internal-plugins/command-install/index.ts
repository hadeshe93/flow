import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    ctx.commander.register({
      command: 'install',
      description: 'Install plugin for flow',
      argumentList: [['pluginName', { required: true, description: 'Plugin name' }]],
      fn: async (params) => {
        await ctx.plugger.install(params.pluginName);
      },
    });
  },
});
