const fs = require('fs');
const path = require('path');

// 1. Create app/context and move LanguageContext.jsx
if (!fs.existsSync('./app/context')) {
  fs.mkdirSync('./app/context', { recursive: true });
}
fs.renameSync('./app/admin/context/LanguageContext.jsx', './app/context/LanguageContext.jsx');

// 2. Find all jsx/tsx files in app/admin and update imports
function updateImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      updateImports(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Calculate depth from app/admin to app/context
      const relativePath = path.relative(path.dirname(fullPath), './app/context/LanguageContext.jsx').replace(/\\/g, '/');
      const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      
      // Replace old import patterns
      const updatedContent = content
        .replace(/from\s+['"].*?\/context\/LanguageContext['"]/g, `from '${importPath.replace('.jsx', '')}'`);
        
      if (content !== updatedContent) {
        fs.writeFileSync(fullPath, updatedContent);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}
updateImports('./app/admin');
