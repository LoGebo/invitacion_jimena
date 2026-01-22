#!/bin/bash
# Script to install Windows native binaries for Vite/Tailwind on Windows (Git Bash/MINGW)
# Run this after npm install if you get native module errors

echo "Installing Windows native binaries..."

cd node_modules

# Get versions
ROLLUP_VERSION=$(cat rollup/package.json | grep '"version"' | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
LIGHTNINGCSS_VERSION=$(cat lightningcss/package.json | grep '"version"' | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
OXIDE_VERSION=$(cat @tailwindcss/oxide/package.json | grep '"version"' | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')

echo "Rollup version: $ROLLUP_VERSION"
echo "LightningCSS version: $LIGHTNINGCSS_VERSION"
echo "Tailwind Oxide version: $OXIDE_VERSION"

# Install rollup win32 binary
mkdir -p @rollup
cd @rollup
rm -rf rollup-win32-x64-msvc 2>/dev/null
curl -sL "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-${ROLLUP_VERSION}.tgz" -o rollup.tgz
tar -xzf rollup.tgz && mv package rollup-win32-x64-msvc && rm rollup.tgz
cd ..

# Install lightningcss win32 binary
rm -rf lightningcss-win32-x64-msvc 2>/dev/null
curl -sL "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-${LIGHTNINGCSS_VERSION}.tgz" -o lc.tgz
tar -xzf lc.tgz && mv package lightningcss-win32-x64-msvc && rm lc.tgz

# Install tailwind oxide win32 binary
cd @tailwindcss
rm -rf oxide-win32-x64-msvc 2>/dev/null
curl -sL "https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-${OXIDE_VERSION}.tgz" -o oxide.tgz
tar -xzf oxide.tgz && mv package oxide-win32-x64-msvc && rm oxide.tgz
cd ../..

echo "Done! Windows binaries installed."
echo "You can now run: npm run build"
