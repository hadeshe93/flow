import path from 'path';

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
