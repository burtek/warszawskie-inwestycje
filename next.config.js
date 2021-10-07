const removeImports = require('next-remove-imports')();

/** @type {import('next').NextConfig} */
module.exports = removeImports({
    reactStrictMode: true,
    images: {
        imageSizes: [100, 150, 200, 250, 300]
    }
});
