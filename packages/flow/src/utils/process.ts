import { debug } from './debug';

interface Logger {
  log: (...args: any[]) => any;
  error: (...args: any[]) => any;
}

export function init(logger: Logger = console) {
  // process.on('beforeExit', (code) => {
  //   debug(`Code before process's exiting is ${code}`);
  // });
  process.on('exit', (code) => {
    if (code === 0) return;
    debug(`Process exit code is ${code}`);
  });
  process.on('uncaughtException', (err: any) => {
    logger.error('[Uncaught exception] Error', err);
  });
  process.on('unhandledRejection', (reason: any) => {
    logger.error('[Unhandled rejection] Reason: ', reason || 'Unknown');
  });
}
