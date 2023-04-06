import { Injectable, Autowired } from '@opensumi/di';
import { Domain, Logger, Configuration, BasicPlugin, CommandContribution, CommandRegistry } from '@/core';

@Domain(CommandContribution)
class CommandLsContribution implements CommandContribution {
  @Autowired(Logger)
  logger: Logger;

  @Autowired(Configuration)
  configuration: Configuration;

  registerCommand(commandRegistry: CommandRegistry): void {
    commandRegistry.registerCommand({
      command: 'ls',
      description: 'List all configs of flow',
      fn: () => {
        this.logger.success('Configs of Flow:\r\n', JSON.stringify(this.configuration.data, null, 2));
      },
    });
  }
}

@Injectable()
export default class CommandLsPlugin extends BasicPlugin {
  providers = [CommandLsContribution];
}
