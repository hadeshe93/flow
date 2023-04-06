import { Injectable, Autowired } from '@opensumi/di';
import { Domain, BasicPlugin, InitiatorManager, CommandContribution, CommandRegistry } from '@/core';

@Domain(CommandContribution)
class CommandInitContribution implements CommandContribution {
  @Autowired(InitiatorManager)
  initiator: InitiatorManager;

  registerCommand(commandRegistry: CommandRegistry): void {
    commandRegistry.registerCommand({
      command: 'init',
      description: 'Init a application project from templates',
      fn: async () => {
        this.initiator.run();
      },
    });
  }
}

@Injectable()
export default class CommandInitPlugin extends BasicPlugin {
  providers = [CommandInitContribution];
}
