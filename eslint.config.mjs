import next from 'eslint-config-next';

const eslintConfig = [
  ...next,
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**'],
  },
];

export default eslintConfig;
