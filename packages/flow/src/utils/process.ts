interface Logger {
  log: (...args: any[]) => any;
  error: (...args: any[]) => any;
}

export function init(logger: Logger = console) {
  process.on('beforeExit', (code) => {
    logger.log(`Code before process's exiting is ${code}`);
  });
  process.on('exit', (code) => {
    if (code === 0) return;
    logger.log(`'Process exit code is ${code}`);
  });
  process.on('uncaughtException', (err: any) => {
    logger.error('Uncaught exception:', err);
  });
  process.on('unhandledRejection', (reason: any, promise: any) => {
    logger.error('Unhandled rejection: ', promise, 'reason: ', reason);
  });
}
