import ora, { Ora } from 'ora';
import chalk from 'chalk';

import { format } from 'util';

export class Logger {
  constructor() {
    // 分片日志相关
  }

  log(...args: any) {
    const msg = format.apply(format, args);
    console.log(chalk.white(' '), msg);
  }

  error(...args: any) {
    let message = args[0];
    if (message instanceof Error) message = message.message.trim();
    const msg = format.apply(format, args);
    console.error(chalk.red('✖'), chalk.red(msg));
  }

  warn(...args: any) {
    let message = args[0];
    if (message instanceof Error) message = message.message.trim();
    const msg = format.apply(format, args);
    console.warn(chalk.yellow('⚠'), chalk.yellow(msg));
  }

  success(...args: any) {
    const msg = format.apply(format, args);
    console.log(chalk.green('✔︎'), chalk.green(msg));
  }

  ing(msg, func?): Ora | Promise<Ora> {
    const sipnner = ora({
      text: msg,
      color: 'cyan',
    }).start();
    if (func instanceof Function) {
      const promise = func(sipnner);
      if (promise instanceof Promise) {
        return promise.then(() => sipnner.stop()).catch(() => sipnner.stop());
      } else {
        return sipnner.stop();
      }
    } else {
      return sipnner;
    }
  }
}

export const logger = new Logger();
