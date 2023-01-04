import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    ctx.commander.register({
      command: 'init',
      description: 'Init a application project from templates',
      fn: async () => {
        await ctx.initiatorManager.run();
      },
    });
  },
});
