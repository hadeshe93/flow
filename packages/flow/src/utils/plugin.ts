import path from 'path';

export function getInternalPluginName(internalPluginAbsPath: string) {
  return `internal-${path.basename(internalPluginAbsPath)}`;
}
