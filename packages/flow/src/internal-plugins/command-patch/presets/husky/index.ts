import type { PatcherCtx, PatcherUtils } from '../../types/index';

export default function (ctx: PatcherCtx, utils: PatcherUtils) {
  const { logger } = utils;
  // 信息提示和指引
  logger.info('You need to follow instructions as below:');
  logger.info(' - Excute "pnpm dlx husky-init && pnpm install"');
}
