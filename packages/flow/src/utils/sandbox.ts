type ProxiedPropertyMap<T, K extends keyof T, O> = {
  [P in K]: T[P] extends (...args: any[]) => any
    ? (instance: T, extraOptions: O, ...args: Parameters<T[P]>) => any
    : T[P];
};

/**
 * 创建一个 Proxy 沙箱，用以仅允许外界访问预设的属性或方法
 *
 * @export
 * @template InstanceClass
 * @template R
 * @template ExtraOptions
 * @param {ProxiedPropertyMap<InstanceClass, R, ExtraOptions>} proxiedProperties
 * @returns {*} 
 */
export function createSandboxInstanceCreator<InstanceClass, R extends keyof InstanceClass, ExtraOptions>(
  proxiedProperties: ProxiedPropertyMap<InstanceClass, R, ExtraOptions>,
) {
  return (instance: InstanceClass, extraOptions: ExtraOptions) => {
    return new Proxy<Pick<typeof instance, keyof typeof proxiedProperties>>(instance, {
      get(target, key: string) {
        if (!Object.prototype.hasOwnProperty.call(proxiedProperties, key)) return undefined;
        const value = proxiedProperties[key];
        if (typeof value === 'function') {
          return value.bind(null, target, extraOptions);
        }
        return value;
      },
    });
  };
}
