import path from 'path';
import { jsonc } from 'jsonc';
import fsExtra from 'fs-extra';
import { questionList, necessaryDevDependencies } from './config';
import type { PatcherCtx, PatcherUtils } from '../../types/index';

const TEMPLATE_EXT = '.example';
const TEMPLATE_FILE_NAME_BASE = '.eslintrc.json';
const TEMPLATE_FILE_NAME = `${TEMPLATE_FILE_NAME_BASE}${TEMPLATE_EXT}`;
const TEMPLATE_ASSETS_PATH = path.resolve(__dirname, 'assets');
const TEMPLATE_ESLINT_CONFIG_PATH = path.resolve(TEMPLATE_ASSETS_PATH, TEMPLATE_FILE_NAME);

export default async function (ctx: PatcherCtx, utils: PatcherUtils) {
  const { debug, logger, enquirer } = utils;
  const answerMap = new Map();
  for (const question of questionList) {
    const { type: enquirerType, options } = question;
    const { name } = options;
    const prompt = new enquirer[enquirerType](options);
    const value = await prompt.run();
    answerMap.set(name, value);
  }
  const eslintJSON = jsonc.parse(fsExtra.readFileSync(TEMPLATE_ESLINT_CONFIG_PATH, 'utf-8'));

  // 处理 env
  const answerEnvs = answerMap.get('env');
  if (answerEnvs.length > 0) {
    eslintJSON.env = answerEnvs.reduce((envMap, envName) => {
      envMap[envName] = true;
      return envMap;
    }, {} as { [key: string]: boolean });
  }

  // 处理 parser
  const answerParser = answerMap.get('parser');
  if (answerParser === 'default') {
    delete eslintJSON.parser;
  } else {
    eslintJSON.parser = answerParser;
  }

  // 处理 overrides 中的 .ts 文件
  const answerShouldLintTypeScript = answerMap.get('shouldLintTypeScript');
  if (!answerShouldLintTypeScript) {
    const targetIndex = eslintJSON.overrides.findIndex((overrideItem) => overrideItem.files.includes('*.ts'));
    if (targetIndex >= 0) {
      eslintJSON.overrides.splice(targetIndex, 1);
    }
  }
  debug(`[Patcher - ${ctx.preset}] answers:%O`, [...answerMap.entries()]);
  debug(`[Patcher - ${ctx.preset}] eslintJSON:%O`, eslintJSON);

  // 将配置写到目的地
  const dest = path.resolve(ctx.targetPath, path.basename(TEMPLATE_ESLINT_CONFIG_PATH, TEMPLATE_EXT));
  utils.writeAsset(JSON.stringify(eslintJSON, null, 2), dest);

  // 收集所有需要安装的依赖项
  const devDependencies = questionList.reduce(
    (list, question) => {
      if (!question.devDependenciesMap) return list;
      const answer = answerMap.get(question.options.name);
      let devDepList = [];
      if (question.type === 'Confirm') {
        devDepList = question.devDependenciesMap[answer ? 'positive' : 'negative'] || [];
      } else {
        devDepList = question.devDependenciesMap[answer] || [];
      }
      list.push(...devDepList);
      return list;
    },
    [...necessaryDevDependencies] as string[],
  );

  // 信息提示和指引
  logger.info('According to the last eslint config, you may need to install these devDependencies:');
  devDependencies.forEach((devDep) => {
    logger.info(` - ${devDep}`);
  });
}
