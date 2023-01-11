import path from 'path';
import fsExtra from 'fs-extra';
import { debug } from '../../../../utils/debug';
import type { PatcherCtx } from '../../types/index';

const TEMPLATE_EXT = '.example';
const TEMPLATE_FILE_NAME_BASE = 'commitlint.config.js';
const TEMPLATE_FILE_NAME = `${TEMPLATE_FILE_NAME_BASE}${TEMPLATE_EXT}`;
const TEMPLATE_ASSETS_PATH = path.resolve(__dirname, 'assets');
const TEMPLATE_PRETTIER_CONFIG_PATH = path.resolve(TEMPLATE_ASSETS_PATH, TEMPLATE_FILE_NAME);

export default function (ctx: PatcherCtx) {
  const { targetPath, logger } = ctx;
  const targetFilePath = path.resolve(targetPath, path.basename(TEMPLATE_PRETTIER_CONFIG_PATH, TEMPLATE_EXT));

  // 拷贝 commitlint 文件到目的地
  debug('[Patcher - CommitLint] TEMPLATE_PRETTIER_CONFIG_PATH:', TEMPLATE_PRETTIER_CONFIG_PATH);
  debug('[Patcher - CommitLint] targetFilePath:', targetFilePath);
  fsExtra.copySync(TEMPLATE_PRETTIER_CONFIG_PATH, targetFilePath);

  // 信息提示和指引
  logger.success(`[Patch] Inject "TEMPLATE_FILE_NAME_BASE" successfully`);
  logger.info('You need to follow instructions as below:');
  logger.info(' - Install "@commitlint/cli" and "@commitlint/config-conventional" as devDependencies');
  logger.info(' - Install "husky" as devDependencies');
  logger.info(` - Put lint script into husky's "commit-msg" hook just like "pnpm commitlint --edit $1"`);
}
