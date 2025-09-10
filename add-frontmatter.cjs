const fs = require('fs');
const path = require('path');

function addFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has frontmatter
  if (content.startsWith('---')) {
    return;
  }
  
  // Extract title from filename
  const filename = path.basename(filePath, '.md');
  const title = filename.replace(/HeyZack_/g, '').replace(/_/g, ' ');
  
  // Add frontmatter
  const frontmatter = `---\ntitle: ${title}\ndescription: ${title}\n---\n\n`;
  const newContent = frontmatter + content;
  
  fs.writeFileSync(filePath, newContent);
  console.log(`Added frontmatter to: ${filePath}`);
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.md')) {
      addFrontmatter(fullPath);
    }
  });
}

// Process all markdown files in src/content/docs
processDirectory('./src/content/docs');
console.log('Frontmatter addition complete!');