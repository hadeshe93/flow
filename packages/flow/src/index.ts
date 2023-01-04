import { init as initProcess } from './utils/process';
import { Flow } from './core/index';
import { logger } from './core/logger';

initProcess(logger);
if (process.env['RUN']) {
  new Flow().run();
}

export { Flow };
