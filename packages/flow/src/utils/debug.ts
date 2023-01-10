import createDebug from 'debug';
import { getPackageJSON } from './package-json';

export const debug = createDebug(getPackageJSON().name);
