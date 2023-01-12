export const necessaryDevDependencies = ['eslint', 'prettier', 'eslint-config-prettier', 'eslint-plugin-prettier'];

export const questionList = [
  // 项目需要运行在什么环境
  {
    type: 'MultiSelect',
    options: {
      name: 'env',
      message: 'Select enviroments that your project need (muti select):',
      limit: 5,
      choices: [
        { name: 'browser' },
        { name: 'node' },
        { name: 'es6' },
        { name: 'mocha' },
        { name: 'jest' },
        { name: 'jquery' },
      ],
    },
  },
  // 项目需要什么基础的 parser
  {
    type: 'Select',
    options: {
      name: 'parser',
      message: 'Select the parser you want:',
      choices: [{ name: 'default' }, { name: '@babel/eslint-parser' }],
    },
    devDependenciesMap: {
      '@babel/eslint-parser': ['@babel/eslint-parser'],
    },
  },
  // 项目是否需要 @typescript-eslint/parser 来 lint 其中的 .ts 文件
  {
    type: 'Confirm',
    options: {
      name: 'shouldLintTypeScript',
      message: 'Do you need to lint *.ts files:',
      initial: true,
    },
    devDependenciesMap: {
      positive: ['@typescript-eslint/parser', '@typescript-eslint/eslint-plugin', 'eslint-plugin-tsdoc'],
    },
  },
];
