import path from 'path';
import glob from 'glob';
import { debug } from './debug';

interface ResolveGlobModulesOptions {
  entryFileName?: string;
  excludeInvalidModule?: boolean;
}

interface ResolvedModuleInfo {
  baseName: string;
  absolutePath: string;
}

/**
 * 批量解析模块路径
 *
 * @export
 * @param {string} globPath
 * @param {ResolveGlobModulesOptions} [rawOptions]
 * @returns {*}  {any[]}
 */
export function resolveGlobModules(globPath: string, rawOptions?: ResolveGlobModulesOptions): ResolvedModuleInfo[] {
  debug('[Patcher] resolveGlobModules:', globPath);
  const options = formatResolveGlobModuleOptions(rawOptions);
  const modulesPaths = glob.sync(globPath);
  const result = modulesPaths.map((modulePath) => {
    const entryPath = path.resolve(modulePath, options.entryFileName);
    const absolutePath = requireResolve(entryPath);
    return {
      baseName: path.basename(modulePath),
      absolutePath,
    };
  });
  if (options.excludeInvalidModule) {
    return result.filter((moduleInfo) => Boolean(moduleInfo.absolutePath));
  }
  return result;
}

/**
 * 格式化入参参数
 *
 * @param {Partial<ResolveGlobModulesOptions>} [options]
 * @returns {*}  {ResolveGlobModulesOptions}
 */
function formatResolveGlobModuleOptions(options?: Partial<ResolveGlobModulesOptions>): ResolveGlobModulesOptions {
  const { entryFileName = 'index', excludeInvalidModule = false } = options || {};
  return {
    entryFileName,
    excludeInvalidModule,
  };
}

/**
 * 封装 require.resolve
 *
 * @export
 * @param {*} modulePath
 * @returns {*}
 */
export function requireResolve(modulePath) {
  let absPath = '';
  try {
    absPath = require.resolve(modulePath);
  } catch (err) {
    // 不存在
  }
  return absPath;
}

/**
 * 获取定制化的 resolve 方法
 *
 * @export
 * @param {string} projectRootPath
 * @returns 定制化的 resolve 方法
 */
export function getResolve(projectRootPath: string): (...pathnameList: string[]) => string {
  return (...pathnameList: string[]) => path.resolve(projectRootPath, ...pathnameList);
}

/**
 * 获取本 flow 项目的根路径
 *
 * @export
 * @returns {*}
 */
export function getFlowRootDir() {
  return path.resolve(__dirname, '../../');
}
