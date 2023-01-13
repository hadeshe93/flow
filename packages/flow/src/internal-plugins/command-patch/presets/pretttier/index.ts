import path from 'path';
import type { PatcherCtx, PatcherUtils } from '../../types/index';

const TEMPLATE_EXT = '.example';
const TEMPLATE_FILE_NAME = `prettier.config.js${TEMPLATE_EXT}`;
const TEMPLATE_ASSETS_PATH = path.resolve(__dirname, 'assets');
const TEMPLATE_PRETTIER_CONFIG_PATH = path.resolve(TEMPLATE_ASSETS_PATH, TEMPLATE_FILE_NAME);

export default function (ctx: PatcherCtx, utils: PatcherUtils) {
  const { targetPath } = ctx;
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
  utils.logger.info('At last, please ensure you have installed "prettier" as devDependencies');
}
