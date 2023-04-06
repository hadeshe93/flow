import { Flow } from './core/index';

const FLAG = 'FLOW_RUN';
if (process.env[FLAG]) {
  new Flow().run();
}

export { Flow };
