module.exports = {
  '*.{ts,tsx,js,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml,css,html}': ['prettier --write'],
  '{.prettierrc,.eslintrc,.lintstagedrc,.gitmessage}': ['prettier --write'],
};
