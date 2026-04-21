const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { search: /#2563eb/gi, replace: '#8a1538' }, // primary maroon
  { search: /#1d4ed8/gi, replace: '#7a1230' }, // hover darker maroon
  { search: /#1e40af/gi, replace: '#600e26' }, // active darker maroon
  { search: /#3b82f6/gi, replace: '#d4af37' }, // light blue to gold (for highlights/borders)
  { search: /#60a5fa/gi, replace: '#fde047' }, // lighter blue to yellow gold
  { search: /#eff6ff/gi, replace: '#fdf8ea' }, // light blue bg to cream/gold bg
  { search: /#bfdbfe/gi, replace: '#fde68a' }, // blue border to gold border
  { search: /#dbeafe/gi, replace: '#fef3c7' }, // pale blue to pale gold
  { search: /rgba\(37,\s*99,\s*235/gi, replace: 'rgba(138, 21, 56' }, // gradient center maroon
  { search: /rgba\(59,\s*130,\s*246/gi, replace: 'rgba(212, 175, 55' }, // gradient gold
  { search: /rgba\(16,\s*57,\s*150/gi, replace: 'rgba(90, 10, 30' }, // dark maroon start
  { search: /rgba\(56,\s*139,\s*253/gi, replace: 'rgba(212, 175, 55' } // gold end gradient
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.html') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const req of replacements) {
        if (req.search.test(content)) {
          content = content.replace(req.search, req.replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log("Done!");
