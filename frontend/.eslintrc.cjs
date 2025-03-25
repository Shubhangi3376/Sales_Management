/* eslint-env node */

module.exports = {
  env: { 
    browser: true, 
    es2020: true 
  },
  extends: [
    'eslint:recommended',                // Basic linting rules
    'plugin:react/recommended',          // React-specific linting rules
    'plugin:react-hooks/recommended',    // React hooks rules
    'plugin:react/jsx-runtime',          // JSX runtime support
    'plugin:prettier/recommended'        // Prettier integration
  ],
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module' 
  },
  settings: { 
    react: { version: '18.2' } 
  },
  plugins: ['react-refresh', 'prettier'],
  rules: {
    // React rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'react/prop-types': 'warn',               // Warn for missing PropTypes
    'react/jsx-uses-react': 'off',            // Disable React import for React 17+ JSX
    'react/react-in-jsx-scope': 'off',        // Disable React import requirement
    'react/jsx-filename-extension': [
      1, 
      { extensions: ['.jsx', '.js'] }
    ],

    // Hooks rules
    'react-hooks/rules-of-hooks': 'error',    // Ensure correct usage of hooks
    'react-hooks/exhaustive-deps': 'warn',    // Warn for missing dependencies in useEffect

    // Prettier rules
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,                    // Use single quotes
        trailingComma: 'all',                 // Add trailing commas
        printWidth: 80,                       // Line length limit
        semi: true                            // Use semicolons
      }
    ]
  }
};
