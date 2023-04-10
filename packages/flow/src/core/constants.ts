import os from 'os';
import path from 'path';
import { getPackageJSON } from '@/utils/package-json';

const FLOW_CONFIGURATION_NAME = getPackageJSON().name.replace(/@/g, '.').replace(/\//g, '-');

// flow 配置文件
export const FLOW_CONFIGURATION_PATH = path.resolve(os.homedir(), `${FLOW_CONFIGURATION_NAME}.config.json`);
