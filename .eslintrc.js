module.exports = {
  env: {
      node: true, // 启用node中全局变量
      commonjs: true,
      browser: true, // 启用浏览器中全局变量
      es6: true
  },
  extends: [
      'eslint:recommended',
      'airbnb-typescript',
  ],
  // 解析器配置参数
  parserOptions: {
    babelOptions: {
      presets: [
        // 解决页面报错问题
        ["babel-preset-react-app", false],
        "babel-preset-react-app/prod",
      ],
    },
      ecmaFeatures: {
          jsx: true,
          tsx: true,
          modules: true,
      },
      // es 版本号，默认为 5，也可以是用年份
      ecmaVersion: 2021,
      sourceType: 'module',
      tsconfigRootDir: __dirname,
      project: 'tsconfig.json',
  },
  // 解析器类型
  // espima(默认), babel-eslint, @typescript-eslint/parse
  parser: '@typescript-eslint/parser',
  plugins: [
   "react",
   "@typescript-eslint",
   "react-hooks",
   "import" // 解决动态导入
  ],
  settings: {
      'import/resolver': {
          alias: { map: [['@', 'src/']] },
          node: {
              extensions: ['.js', '.jsx', '.ts', '.tsx'],
          },
          typescript: { tsconfigRootDir: __dirname, project: 'tsconfig.json' },
      },
  },
  rules: {
      'import/prefer-default-export': 0,
      "import/no-webpack-loader-syntax": "off",
      // 可以启用console控制台
      'no-console': 0,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      //最大长度的验证
      "max-len": ["off", { "code": 120 }],
      // "quotes": ["error", "single"],
      // 禁止对对象字面量进行类型断言（断言成any是允许的）
      "typescript/no-object-literal-type-assertion": "off",
      // 阴影变量
      'no-shadow': 0,
      "no-var": "error",
      // 箭头函数的参数必须有小括号
      "arrow-parens": "off",
      // 可以留多余的空白
      "no-multiple-empty-lines": "off",
      // 取消对文件扩展名的验证
      'import/extensions': [
          0,
          'ignorePackages',
          {
              js: 'never',
              ts: 'never',
              jsx: 'never',
              tsx: 'never',
          },
      ],
      // 一行限制一个表达式
      'react/jsx-one-expression-per-line': 0,
      'react/state-in-constructor': 0,
      // 'react/prefer-stateless-function': 0,
      // 'react/static-property-placement': 0,
      // 限制每个文件的类的数量
      // 'max-classes-per-file': 0,
      // 'react/sort-comp': 0,
      'jsx-a11y/no-noninteractive-element-interactions': 0,
      'jsx-a11y/click-events-have-key-events': 0,
      'jsx-a11y/control-has-associated-label': 0,
      'jsx-a11y/anchor-has-content': 0,
      // 'react/no-unused-state': 0,
      // 'jsx-a11y/anchor-is-valid': 0,
      // 一元++和--运算符
      'no-plusplus': 0,
      'jsx-a11y/no-static-element-interactions': 0,
      // 'jsx-a11y/alt-text': 0,
      'class-methods-use-this': 0,
      // 'react/jsx-props-no-spreading': 0,
      // 'no-param-reassign': 0,
      'jsx-a11y/media-has-caption': 0,
      "object-curly-newline": 0,
      'import/no-unresolved': 0,
      'padded-blocks': 0,
      'react/jsx-props-no-spreading': 0,
      'arrow-body-style': 0,
      'import/no-named-as-default': 0,
      'react/prop-types': 0,
      '@typescript-eslint/semi': 0,
      '@typescript-eslint/quotes': 0,
      '@typescript-eslint/naming-convention': 0,
      'no-underscore-dangle': 0,
      "@typescript-eslint/space-before-function-paren": 0,
      "@typescript-eslint/ban-types": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/explicit-module-boundary-types": 0,
      "no-useless-return": 0,
      "consistent-return": 0,
      "no-debugger": 0,
      "@typescript-eslint/no-unused-expressions": 0,
      "react/jsx-wrap-multilines": 0,
      "jsx-a11y/anchor-is-valid": 0,
      "no-script-url": 0,
      "no-param-reassign": 0,
      "@typescript-eslint/ban-ts-comment": 0,
      "import/no-cycle": 0,
      "linebreak-style": [0, "error", "windows"],
      "jsx-a11y/mouse-events-have-key-events": 0,
      "react/self-closing-comp": 0,
      "@typescript-eslint/comma-dangle": 0,
      "@typescript-eslint/comma-spacing": 0,
      "eol-last": 0,
      "react/require-default-props": 0,
      "import/order": 0,
      "@typescript-eslint/indent":0,
      "react/jsx-closing-tag-location":0,
      "no-trailing-spaces":0,
      "@typescript-eslint/no-unused-vars": 0,
      "import/no-extraneous-dependencies": 0
  },
};
