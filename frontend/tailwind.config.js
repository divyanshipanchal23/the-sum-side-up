/** @type {import('tailwindcss').Config} */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  content: [
    resolve(__dirname, './index.html'),
    resolve(__dirname, './src/**/*.{vue,js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        secondary: '#06D6A0',
        accent: {
          yellow: '#FFD166',
          red: '#EF476F',
          purple: '#BDADEA',
        },
        background: {
          soft: '#F9F7FF',
          secondary: '#F0EBFF',
        }
      }
    },
  },
  plugins: [],
} 