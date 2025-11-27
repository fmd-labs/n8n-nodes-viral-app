// Flat config wrapper to keep using the existing .eslintrc.js with ESLint 9
// https://eslint.org/docs/latest/use/configure/migration-guide

const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
	baseDirectory: __dirname,
	resolvePluginsRelativeTo: __dirname,
});

module.exports = [
	{ ignores: ['dist/**', 'node_modules/**'] },
	...compat.extends('./.eslintrc.js'),
];
