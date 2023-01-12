import path from 'path';
import type { PatcherCtx, PatcherUtils } from '../../types/index';

const TEMPLATE_EXT = '.example';
const TEMPLATE_FILE_NAME_BASE = 'commitlint.config.js';
const TEMPLATE_FILE_NAME = `${TEMPLATE_FILE_NAME_BASE}${TEMPLATE_EXT}`;
const TEMPLATE_ASSETS_PATH = path.resolve(__dirname, 'assets');
const TEMPLATE_PRETTIER_CONFIG_PATH = path.resolve(TEMPLATE_ASSETS_PATH, TEMPLATE_FILE_NAME);

export default function (ctx: PatcherCtx, utils: PatcherUtils) {
  const { targetPath } = ctx;
  const { logger } = utils;

  const ASSETS_TO_COPY = [
    {
      src: TEMPLATE_PRETTIER_CONFIG_PATH,
      dest: path.resolve(targetPath, path.basename(TEMPLATE_PRETTIER_CONFIG_PATH, TEMPLATE_EXT)),
    },
  ];

  // 拷贝
  ASSETS_TO_COPY.forEach((info) => {
    utils.copyAsset(info.src, info.dest);
  });

  // 信息提示和指引
  logger.info('You need to follow instructions as below:');
  logger.info(' 1. Install "@commitlint/cli" and "@commitlint/config-conventional" as devDependencies');
  logger.info(
    ' 2. Ensure "husky" has been installed as devDependencies. For example: excute "pnpm dlx husky-init && pnpm install"',
  );
  logger.info(` 3. Excute "pnpm dlx husky add .husky/commit-msg 'pnpm commitlint --edit $1'"`);
}
