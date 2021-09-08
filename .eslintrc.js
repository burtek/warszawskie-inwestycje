const rulesDirPlugin = require('eslint-plugin-rulesdir');

rulesDirPlugin.RULES_DIR = 'eslint-rules';

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    extends: 'next/core-web-vitals',
    plugins: ['rulesdir'],
    rules: {
        'react/jsx-no-undef': 'off'
    },
    overrides: [
        {
            files: ['src/data/index.ts'],
            rules: {
                'rulesdir/id-checker': 'error'
            }
        }
    ]
};
