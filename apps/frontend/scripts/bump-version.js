#!/usr/bin/env node
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const buildGradlePath = join(__dirname, '..', 'android', 'app', 'build.gradle');

if (!existsSync(buildGradlePath)) {
  console.log('  ⚠ build.gradle not found, skipping version bump');
  process.exit(0);
}

let content = readFileSync(buildGradlePath, 'utf8');

const versionCodeMatch = content.match(/versionCode\s+(\d+)/);
const versionNameMatch = content.match(/versionName\s+"([^"]+)"/);

if (!versionCodeMatch) {
  console.error('  ✖ versionCode not found in build.gradle');
  process.exit(1);
}

const currentCode = parseInt(versionCodeMatch[1], 10);
const nextCode = currentCode + 1;

content = content.replace(/versionCode\s+\d+/, `versionCode ${nextCode}`);

if (versionNameMatch) {
  const currentName = versionNameMatch[1];
  const parts = currentName.split('.').map((part) => parseInt(part, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] = parts[2] + 1;
  const nextName = parts.join('.');
  content = content.replace(/versionName\s+"[^"]+"/, `versionName "${nextName}"`);
  console.log(`  ✔ versionCode ${currentCode} → ${nextCode}, versionName ${currentName} → ${nextName}`);
} else {
  console.log(`  ✔ versionCode ${currentCode} → ${nextCode}`);
}

writeFileSync(buildGradlePath, content, 'utf8');
