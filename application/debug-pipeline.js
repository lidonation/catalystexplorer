#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Pipeline Debug Information ===');
console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);
console.log('Node version:', process.version);

// Check if critical files exist
const filesToCheck = [
    'tsconfig.json',
    'resources/js/Hooks/useLanguageDetection.ts',
    'resources/js/Pages/Workflows/CatalystDrepSignup/Step5.tsx',
    'resources/js/Pages/Workflows/CatalystDrepSignup/partials/DrepSignupForm.tsx'
];

console.log('\n=== File Existence Check ===');
filesToCheck.forEach(file => {
    const fullPath = path.resolve(__dirname, file);
    const exists = fs.existsSync(fullPath);
    console.log(`${file}: ${exists ? 'EXISTS' : 'MISSING'} (${fullPath})`);
});

// Check tsconfig.json content
console.log('\n=== TypeScript Configuration ===');
try {
    const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    console.log('tsconfig.json is valid JSON');
    console.log('Paths config:', JSON.stringify(tsconfig.compilerOptions?.paths, null, 2));
    console.log('moduleResolution:', tsconfig.compilerOptions?.moduleResolution);
    console.log('allowImportingTsExtensions:', tsconfig.compilerOptions?.allowImportingTsExtensions);
} catch (err) {
    console.log('Error reading tsconfig.json:', err.message);
}

// Check import statements
console.log('\n=== Import Statement Check ===');
const importFiles = [
    'resources/js/Pages/Workflows/CatalystDrepSignup/Step5.tsx',
    'resources/js/Pages/Workflows/CatalystDrepSignup/partials/DrepSignupForm.tsx'
];

importFiles.forEach(file => {
    try {
        const fullPath = path.resolve(__dirname, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        const importMatch = content.match(/import.*useLanguageDetection.*from.*['"](.*)['"]/);
        if (importMatch) {
            console.log(`${file}: imports from "${importMatch[1]}"`);
        } else {
            console.log(`${file}: useLanguageDetection import not found`);
        }
    } catch (err) {
        console.log(`${file}: Error reading - ${err.message}`);
    }
});

// Check directory structure
console.log('\n=== Hooks Directory Structure ===');
try {
    const hooksDir = path.resolve(__dirname, 'resources/js/Hooks');
    const files = fs.readdirSync(hooksDir);
    console.log('Files in Hooks directory:');
    files.forEach(file => console.log(`  - ${file}`));
} catch (err) {
    console.log('Error reading Hooks directory:', err.message);
}

console.log('\n=== Case Sensitivity Check ===');
// Check if filesystem is case sensitive by creating temp files
try {
    const testDir = path.resolve(__dirname, 'temp-case-test');
    fs.mkdirSync(testDir, { recursive: true });
    
    fs.writeFileSync(path.join(testDir, 'Test.txt'), 'test');
    const lowerExists = fs.existsSync(path.join(testDir, 'test.txt'));
    
    fs.rmSync(testDir, { recursive: true });
    console.log('Filesystem is case-sensitive:', !lowerExists);
} catch (err) {
    console.log('Could not determine case sensitivity:', err.message);
}

console.log('\n=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CI:', process.env.CI);
