import type { Config } from 'tailwindcss';

const config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                buttonAccent: '#CF6318',
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                roboto: ['Roboto', 'sans-serif'],
                lato: ['Lato', 'sans-serif'],
                sourceSans: ['Source Sans Pro', 'sans-serif'],
            },
            fontSize: {
                'resume-name': [
                    '28px',
                    { lineHeight: '1.2', fontWeight: '700' },
                ],
                'resume-heading': [
                    '16px',
                    { lineHeight: '1.3', fontWeight: '600' },
                ],
                'resume-subheading': [
                    '14px',
                    { lineHeight: '1.3', fontWeight: '600' },
                ],
                'resume-body': ['11px', { lineHeight: '1.6' }],
            },
            width: {
                a4: '210mm',
            },
            minHeight: {
                a4: '297mm',
            },
            maxWidth: {
                a4: '210mm',
            },
        },
    },
    plugins: [],
} satisfies Config;

export default config;
