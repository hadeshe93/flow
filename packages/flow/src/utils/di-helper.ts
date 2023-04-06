import { markInjectable, getInjectableOpts, Domain, ConstructorOf } from '@opensumi/di';

/**
 * 修饰一个 Class 是某个特定的 DI 分组的装饰器
 *
 * @export
 * @param {...Domain[]} domains
 * @returns {*}
 */
export function Domain(...domains: Domain[]) {
  return (target: ConstructorOf<any>) => {
    const opts = getInjectableOpts(target) || {};
    opts.domain = domains;
    markInjectable(target, opts);
  };
}
