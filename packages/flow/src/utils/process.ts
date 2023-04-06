import { debug } from './debug';
import { Logger } from '@/types/core';

export function initProcess(logger: Pick<Logger, 'error'>) {
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
