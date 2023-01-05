import { init as initProcess } from './utils/process';
import { Flow } from './core/index';
import { logger } from './core/logger';

initProcess(logger);
const FLAG = 'FLOW_RUN';
if (process.env[FLAG]) {
  logger.info(`[Index] Enviroment variable '${FLAG}' has been set`);
  new Flow().run();
}

export { Flow };
