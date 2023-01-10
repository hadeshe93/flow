import path from 'path';
import fsExtra from 'fs-extra';
import { getResolve } from './path';

const packageJSONMap = new Map();
/**
 * 读取 package.json 文件
 *
 * @export
 * @param {string} [rawJsonFilePath='']
 * @returns {*}
 */
export function getPackageJSON(rawJsonFilePath = ''): Record<string, string> {
  let jsonFilePath = rawJsonFilePath;
  if (!jsonFilePath) {
    const rootResolve = getResolve(path.resolve(__dirname, '../../'));
    jsonFilePath = rootResolve('package.json');
  }
  // 如果有缓存，则可以直接返回
  const existedPackageJSON = packageJSONMap.get(jsonFilePath);
  if (existedPackageJSON) return existedPackageJSON;

  // 无缓存，则读取并设置缓存
  const packageJson = fsExtra.readJsonSync(jsonFilePath);
  packageJSONMap.set(jsonFilePath, packageJson);
  return packageJson;
}
