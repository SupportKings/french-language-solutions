import { spawn } from 'child_process';

const asciiArt = `
  __  ____  ____  __ _  __  __ _   ___  ____ 
 /  \(  _ \/ ___)(  / )(  )(  ( \ / __)/ ___)
(  O )) __/\___ \ )  (  )( /    /( (_ \\___ \
 \__/(__)  (____/(__\_)(__)\_)__) \___/(____/
`;

// Colors for console output
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
} as const;

// Simple splash screen
function showSplash() {
  console.log(colors.cyan + asciiArt + colors.reset);
  console.log('');
  console.log(colors.bright + colors.yellow + '   "The details are not the details. They make the design."' + colors.reset);
  console.log(colors.magenta + '                                        — Charles Eames' + colors.reset);
  console.log('');
  console.log('');
}

// Show splash immediately
showSplash();

// Start Next.js dev server
const nextProcess = spawn('bun', ['run', 'next', 'dev', '--port=3001'], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (error) => {
  console.error('Failed to start Next.js dev server:', error);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  process.exit(code ?? 0);
}); 