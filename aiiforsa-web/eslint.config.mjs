import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: ['node_modules', 'dist', '.next'],
    },
    ...compat.extends(
        'next/core-web-vitals',
        'next/typescript',
        'prettier',
        'plugin:prettier/recommended',
    ),
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-console': 'warn',
            'react/no-unescaped-entities': 'warn',
            '@next/next/no-img-element': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    trailingComma: 'all',
                    tabWidth: 4,
                    semi: true,
                    printWidth: 80,
                    arrowParens: 'avoid',
                    endOfLine: 'auto',
                },
            ],
        },
    },
];

export default eslintConfig;
