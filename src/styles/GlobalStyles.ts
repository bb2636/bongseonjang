import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --color-primary: #3B9BD5;
    --color-primary-dark: #2A7AB0;
    --color-secondary: #6c757d;
    --color-success: #28a745;
    --color-danger: #dc3545;
    --color-warning: #ffc107;
    --color-info: #17a2b8;
    --color-light: #f8f9fa;
    --color-dark: #343a40;
    --color-white: #ffffff;
    --color-black: #000000;
    
    --color-text-primary: #212529;
    --color-text-secondary: #6c757d;
    --color-text-muted: #adb5bd;
    
    --color-background: #ffffff;
    --color-background-secondary: #f8f9fa;
    --color-border: #dee2e6;
    
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-size-base: 16px;
    --font-size-small: 14px;
    --font-size-large: 18px;
    
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    --border-radius: 4px;
    --border-radius-lg: 8px;
    
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    
    --transition-fast: 150ms ease-in-out;
    --transition-normal: 300ms ease-in-out;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: var(--font-size-base);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: var(--font-family-base);
    color: var(--color-text-primary);
    background-color: var(--color-background);
    line-height: 1.5;
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
    
    &:hover {
      color: var(--color-primary-dark);
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

export default GlobalStyles;
