import path from 'path';
import fsExtra from 'fs-extra';
import { debug } from '../../../../utils/debug';
import type { PatcherCtx } from '../../types/index';

const TEMPLATE_EXT = '.example';
const TEMPLATE_FILE_NAME = `prettier.config.js${TEMPLATE_EXT}`;

export default function (ctx: PatcherCtx) {
  const { targetPath } = ctx;
  const templateAbsPath = path.resolve(__dirname, TEMPLATE_FILE_NAME);
  const targetFilePath = path.resolve(targetPath, path.basename(templateAbsPath, TEMPLATE_EXT));

  debug('[Patcher - Prettier] templateAbsPath:', templateAbsPath);
  debug('[Patcher - Prettier] targetFilePath:', targetFilePath);
  fsExtra.copySync(templateAbsPath, targetFilePath);
}
