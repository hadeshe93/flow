import type { PatcherCtx, PatcherUtils } from '../../types/index';

export default async function (ctx: PatcherCtx, utils: PatcherUtils) {
  const { logger } = utils;
  // 信息提示和指引
  logger.info('Commands show as below are about to excute');
  logger.info(' - Excute "pnpm dlx husky-init && pnpm install"');

  // const execaOptions = { stdio: 'inherit' } as any;
  const execaOptions = {} as any;
  await logger.ing('Patching husky ...', async () => {
    await utils.execa('pnpm', ['dlx', 'husky-init'], execaOptions);
    await utils.execa('pnpm', ['install'], execaOptions);
    await utils.execa('pnpm', ['dlx', 'husky', 'add', '.husky/pre-commit', `npx lint-staged`], execaOptions);
    await utils.execa(
      'pnpm',
      ['dlx', 'husky', 'add', '.husky/commit-msg', 'npx --no -- commitlint --edit ${1}'],
      execaOptions,
    );
  });
}
