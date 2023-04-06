import { Injector, Injectable, Autowired } from '@opensumi/di';

import { PatcherImpl, Patcher } from './patcher';
import { Domain, Logger, Configuration, BasicPlugin, CommandContribution, CommandRegistry } from '@/core';

@Domain(CommandContribution)
class CommandPatchContribution implements CommandContribution {
  injector = new Injector();

  @Autowired(Logger)
  logger: Logger;

  @Autowired(Configuration)
  configuration: Configuration;

  constructor() {
    this.injector.addProviders(
      {
        token: Logger,
        useValue: this.logger,
      },
      {
        token: Patcher,
        useClass: PatcherImpl,
      },
    );
  }

  registerCommand(commandRegistry: CommandRegistry): void {
    commandRegistry.registerCommand({
      command: 'patch',
      description: 'Patch project with preset resources',
      optionMap: {
        cwd: {
          description: 'Specify current working directory',
          valueName: 'path',
        },
        preset: {
          description: 'Specify a preset to patch with',
          valueName: 'preset',
        },
      },
      fn: async (options) => {
        const patcher = this.injector.get(Patcher);
        await patcher.run(options);
      },
    });
  }
}

@Injectable()
export default class CommandPatchPlugin extends BasicPlugin {
  providers = [CommandPatchContribution];
}
