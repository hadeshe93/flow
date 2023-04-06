import Enquirer from 'enquirer';
import { Injectable, Autowired } from '@opensumi/di';

import {
  Logger,
  ContributionProvider,
  InitiatorMap,
  InitiatorDetail,
  InitiatorManager,
  InitiatorManagerContribution,
  InitiatorManagerRegistry,
} from '@/types/core';
// import { createSandboxInstanceCreator } from '@/utils/sandbox';

@Injectable()
export class InitiatorManagerRegistryImpl implements InitiatorManagerRegistry {
  initiatorMap: InitiatorMap = new Map();

  @Autowired(Logger)
  logger: Logger;

  @Autowired(InitiatorManagerContribution)
  protected readonly contributionProvider: ContributionProvider<InitiatorManagerContribution>;

  /**
   * 初始化
   *
   * @memberof InitiatorManagerRegistryImpl
   */
  initialize() {
    const contributions = this.contributionProvider.getContributions();
    for (const contribution of contributions) {
      contribution.registerInitiator(this);
    }
  }

  /**
   * 注册一个脚手架模板
   *
   * @param {InitiatorDetail} initiatorDetail
   * @returns {*}
   * @memberof InitiatorManagerRegistryImpl
   */
  registerInitiator(initiatorDetail: InitiatorDetail) {
    const existedDetail = this.initiatorMap.get(initiatorDetail.templateName);
    if (existedDetail) {
      this.logger.error(
        `Initiator '${initiatorDetail.templateName}' cannot be registered by ${initiatorDetail.pluginName} because of ${existedDetail.pluginName}`,
      );
      return;
    }
    this.initiatorMap.set(initiatorDetail.templateName, initiatorDetail);
  }
}

/**
 * 项目脚手架模板初始化类
 *
 * @export
 * @class InitiatorManager
 */
@Injectable()
export class InitiatorManagerImpl implements InitiatorManager {
  enquirer = Enquirer;

  @Autowired(Logger)
  logger: Logger;

  @Autowired(InitiatorManagerRegistry)
  private initiatorManagerRegistry: InitiatorManagerRegistry;

  /**
   * 运行
   *
   * @memberof InitiatorManager
   */
  async run() {
    const details = [...this.initiatorManagerRegistry.initiatorMap.values()];
    const choices = details.map((detail) => detail.templateName);
    const question = {
      name: 'templateName',
      message: 'Please pick a initiator',
      limit: 10,
      initial: 0,
      choices,
    };
    const prompt = new Enquirer['AutoComplete'](question);
    const targetTemplateName = await prompt.run();
    const targetDetail = details.find((detail) => detail.templateName === targetTemplateName);
    if (!targetDetail) {
      this.logger.error(`Cannot find the initiator corresponded to template name: '${targetTemplateName}'`);
      process.exit(1);
    }
    const initiator = await targetDetail.fn();
    await initiator.run();
  }
}

// export const getSandboxInitiatorManager = createSandboxInstanceCreator<
//   InitiatorManager,
//   'register' | 'run',
//   { pluginName: string }
// >({
//   register(managerIns, extraOptions, detail) {
//     const { pluginName } = extraOptions || {};
//     managerIns.register({
//       pluginName,
//       ...detail,
//     });
//   },
//   run(managerIns) {
//     managerIns.run();
//   },
// });
