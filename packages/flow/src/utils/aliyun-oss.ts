import glob from 'glob';
import path from 'path';
import AliOss, { PutObjectResult } from 'ali-oss';
import { debug } from '@/utils/debug';

interface OptionsForAliyunOssOper {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
}

interface BaseOptionsForUpload {
  localFilePath: string;
  destFilePath: string;
}

interface OptionsForUpload {
  localDirPath: string;
  destDirPath: string;
  beforeUpload?: (optionList: BaseOptionsForUpload[]) => Promise<BaseOptionsForUpload[]>;
}

interface ReturnForUpload {
  successList: PutObjectResult[];
  failedList: PutObjectResult[];
}

export const cachedOperMap = new Map<string, AliyunOssOper>();

export class AliyunOssOper {
  client: AliOss;
  options: OptionsForAliyunOssOper;

  constructor(options: OptionsForAliyunOssOper) {
    this.options = options;
    const { accessKeyId, accessKeySecret, bucket, region } = options;
    // 实例化客户端
    this.client = new AliOss({
      accessKeyId,
      accessKeySecret,
      bucket,
      region,
    });
  }

  async upload(options: OptionsForUpload): Promise<ReturnForUpload> {
    const { localDirPath, destDirPath, beforeUpload } = options;
    const files = glob.sync('**/*.*', { cwd: path.resolve(localDirPath) });
    debug(`files: ${JSON.stringify(files, null, 2)}`);
    let baseOptionList: BaseOptionsForUpload[] = files.map((file) => {
      const destFilePath = path.resolve(destDirPath, file);
      const localFilePath = path.resolve(localDirPath, file);
      return { destFilePath, localFilePath };
    });
    baseOptionList = beforeUpload ? await beforeUpload(baseOptionList) : baseOptionList;
    const promiseList = baseOptionList.map((baseOptions) => {
      return this.client.put(baseOptions.destFilePath, baseOptions.localFilePath);
    });
    const responses = await Promise.all(promiseList);
    const failedList = responses.filter((response) => response.res.status !== 200);
    const successList = responses.filter((response) => response.res.status === 200);
    return {
      failedList,
      successList,
    };
  }
}

export function getAliyunOssOper(options: OptionsForAliyunOssOper): AliyunOssOper {
  const key = JSON.stringify(options);
  let oper = cachedOperMap.get(key);
  if (!oper) {
    oper = new AliyunOssOper(options);
    cachedOperMap.set(key, oper);
  }
  return oper;
}
