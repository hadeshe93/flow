import { Injectable, Autowired } from '@opensumi/di';
import { Domain, Plugger, BasicPlugin, CommandContribution, CommandRegistry } from '@/core';

@Domain(CommandContribution)
class CommandInstallContribution implements CommandContribution {
  @Autowired(Plugger)
  plugger: Plugger;

  registerCommand(commandRegistry: CommandRegistry): void {
    commandRegistry.registerCommand({
      command: 'install',
      description: 'Install plugin for flow',
      argumentList: [['pluginName', { required: true, description: 'Plugin name' }]],
      fn: async (params) => {
        await this.plugger.install(params.pluginName);
      },
    });
  }
}

@Injectable()
export default class CommandInstallPlugin extends BasicPlugin {
  providers = [CommandInstallContribution];
}
