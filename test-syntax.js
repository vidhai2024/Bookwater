const fs = require('fs');
const path = require('path');

// Simple syntax check by trying to parse files
const checkFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Basic checks
    const hasUnclosedBraces = (content.match(/{/g) || []).length !== (content.match(/}/g) || []).length;
    const hasUnclosedParens = (content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length;
    const hasMergeConflicts = content.includes('<<<<<<<') || content.includes('=======') || content.includes('>>>>>>>');
    
    if (hasUnclosedBraces) console.log(`⚠️  ${filePath}: Unclosed braces`);
    if (hasUnclosedParens) console.log(`⚠️  ${filePath}: Unclosed parentheses`);
    if (hasMergeConflicts) console.log(`❌ ${filePath}: Merge conflicts found`);
    
    if (!hasUnclosedBraces && !hasUnclosedParens && !hasMergeConflicts) {
      console.log(`✅ ${filePath}`);
      return true;
    }
    return false;
  } catch (e) {
    console.log(`❌ ${filePath}: ${e.message}`);
    return false;
  }
};

const files = [
  'src/components/DeliveryList.tsx',
  'src/components/DeliveryCard.tsx',
  'src/components/Login.tsx',
  'src/App.tsx',
  'src/main.tsx',
  'index.html'
];

let allGood = true;
files.forEach(f => {
  if (!checkFile(f)) allGood = false;
});

console.log(allGood ? '\n✅ All files look good!' : '\n❌ Some files have issues');
process.exit(allGood ? 0 : 1);
