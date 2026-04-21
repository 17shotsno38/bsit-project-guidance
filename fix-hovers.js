const fs = require('fs');
const path = require('path');

function processCssFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Simple regex to find blocks with :hover, ignoring already wrapped ones
    // This is a naive regex but works for well-formatted css.
    // E.g. .class:hover { ... }
    
    // We'll replace it with @media (hover: hover) { .class:hover { ... } }
    let modified = content;
    
    const hoverRegex = /([^{}]*:hover[^{}]*\{[^}]+\})/g;
    
    modified = modified.replace(hoverRegex, (match, p1) => {
        // If it's already inside a media query or we already wrapped it, skip it
        if (content.substring(Math.max(0, content.indexOf(match) - 30), content.indexOf(match)).includes('@media')) {
            return match;
        }
        return `@media (hover: hover) {\n  ${p1}\n}`;
    });

    if (modified !== content) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`Fixed hovers in ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.css')) {
            processCssFile(fullPath);
        }
    }
}

traverseDir(path.join(__dirname, 'src/app'));
console.log('Done fixing hover states!');
