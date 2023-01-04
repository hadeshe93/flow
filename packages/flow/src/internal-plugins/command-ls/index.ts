import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    ctx.commander.register({
      command: 'ls',
      description: 'List all configs of flow',
      fn: async () => {
        ctx.logger.success('Configs of Flow:\r\n', JSON.stringify(ctx.configuration.data, null, 2));
      },
    });
  },
});
