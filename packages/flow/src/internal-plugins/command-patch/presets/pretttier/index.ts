import path from 'path';
import fsExtra from 'fs-extra';
import { debug } from '../../../../utils/debug';
import type { PatcherCtx } from '../../types/index';

const TEMPLATE_EXT = '.example';
const TEMPLATE_FILE_NAME = `prettier.config.js${TEMPLATE_EXT}`;
const TEMPLATE_ASSETS_PATH = path.resolve(__dirname, 'assets');
const TEMPLATE_PRETTIER_CONFIG_PATH = path.resolve(TEMPLATE_ASSETS_PATH, TEMPLATE_FILE_NAME);

export default function (ctx: PatcherCtx) {
  const { targetPath } = ctx;
  const targetFilePath = path.resolve(targetPath, path.basename(TEMPLATE_PRETTIER_CONFIG_PATH, TEMPLATE_EXT));

  debug('[Patcher - Prettier] TEMPLATE_PRETTIER_CONFIG_PATH:', TEMPLATE_PRETTIER_CONFIG_PATH);
  debug('[Patcher - Prettier] targetFilePath:', targetFilePath);
  fsExtra.copySync(TEMPLATE_PRETTIER_CONFIG_PATH, targetFilePath);
}
