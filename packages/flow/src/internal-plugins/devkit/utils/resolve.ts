import path from 'path';
import { PAGES_RELATIVE_PATH } from '../constants/configs';

export function resolveProjectPagesPath(projectRootPath: string) {
  return path.resolve(projectRootPath, PAGES_RELATIVE_PATH);
}

export function resolveProjectDistPath(projectRootPath: string) {
  return path.resolve(projectRootPath, 'dist');
}
