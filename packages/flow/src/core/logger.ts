import chalk from 'chalk';
import { format } from 'util';
import ora, { Ora } from 'ora';
import { Injectable } from '@opensumi/di';

import { Logger } from '@/types/core';

@Injectable()
export class LoggerImpl implements Logger {
  constructor() {
    // 分片日志相关
  }

  log(...args: any) {
    const msg = format.apply(format, args);
    console.log(' ', msg);
  }

  info(...args: any) {
    const msg = format.apply(format, args);
    console.log(chalk.cyan('ℹ'), chalk.cyan(msg));
  }

  warn(...args: any) {
    let message = args[0];
    if (message instanceof Error) message = message.message.trim();
    const msg = format.apply(format, args);
    console.warn(chalk.yellow('⚠'), chalk.yellow(msg));
  }

  error(...args: any) {
    let message = args[0];
    if (message instanceof Error) message = message.message.trim();
    const msg = format.apply(format, args);
    console.error(chalk.red('✖'), chalk.red(msg));
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
      try {
        const promise = func(sipnner);
        if (promise instanceof Promise) {
          return promise
            .then(() => sipnner.succeed())
            .catch((err) => {
              sipnner.fail();
              throw err;
            });
        } else {
          return sipnner.stop();
        }
      } catch (err) {
        return sipnner.fail();
      }
    } else {
      return sipnner;
    }
  }
}
