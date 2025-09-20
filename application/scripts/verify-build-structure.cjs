#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Verify that critical files exist before building
 * This helps debug CI issues where files might be missing
 */

const criticalFiles = [
    'resources/js/Hooks/useGlobalErrorHandler.ts',
    'resources/js/Components/GlobalErrorProvider.tsx',
    'vite.config.js',
    'tsconfig.json',
    'package.json'
];

console.log('🔍 Verifying build structure...');
console.log(`Working directory: ${process.cwd()}`);
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);

let allFilesExist = true;

for (const file of criticalFiles) {
    const filePath = path.resolve(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
}

// Check Hooks directory contents
const hooksDir = path.resolve(process.cwd(), 'resources/js/Hooks');
if (fs.existsSync(hooksDir)) {
    const hooksFiles = fs.readdirSync(hooksDir);
    console.log(`📂 Hooks directory contains ${hooksFiles.length} files:`);
    hooksFiles.forEach(file => {
        console.log(`   - ${file}`);
    });
} else {
    console.log('❌ Hooks directory not found');
    allFilesExist = false;
}

// Check if alias would resolve correctly
const aliasTarget = path.resolve(process.cwd(), 'resources/js/Hooks/useGlobalErrorHandler.ts');
const aliasExists = fs.existsSync(aliasTarget);
console.log(`🔗 Alias @/Hooks/useGlobalErrorHandler.ts -> ${aliasExists ? '✅' : '❌'}`);

if (!allFilesExist) {
    console.log('\n❌ Some critical files are missing. Build will likely fail.');
    process.exit(1);
} else {
    console.log('\n✅ All critical files verified. Proceeding with build...');
    process.exit(0);
}