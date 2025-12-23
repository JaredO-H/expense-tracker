/**
 * Style Migration Script
 * Removes inline StyleSheet.create() from all screens and components
 * Updates imports to use centralized stylesheet
 */

const fs = require('fs');
const path = require('path');

// Files and their style mapping
const fileMappings = {
  // Screens - use screenStyles
  'src/screens/HomeScreen.tsx': 'screenStyles',
  'src/screens/ProcessingStatusScreen.tsx': 'screenStyles',
  'src/screens/CameraScreen.tsx': 'componentStyles',
  'src/screens/verification/ReceiptVerificationScreen.tsx': 'screenStyles',
  'src/screens/trips/TripsScreen.tsx': 'screenStyles',
  'src/screens/trips/TripDetailScreen.tsx': 'screenStyles',
  'src/screens/trips/CreateTripScreen.tsx': 'screenStyles',
  'src/screens/expenses/ExpensesScreen.tsx': 'screenStyles',
  'src/screens/expenses/ExpenseDetailScreen.tsx': 'screenStyles',
  'src/screens/expenses/CreateExpenseScreen.tsx': 'screenStyles',
  'src/screens/settings/SettingsScreen.tsx': 'screenStyles',
  'src/screens/settings/GeneralSettingsScreen.tsx': 'screenStyles',
  'src/screens/settings/AIServiceSettings.tsx': 'screenStyles',
  'src/screens/settings/AIServiceHelp.tsx': 'screenStyles',
  'src/screens/exports/ExportScreen.tsx': 'screenStyles',

  // Components - use componentStyles
  'src/components/camera/CameraCapture.tsx': 'componentStyles',
  'src/components/camera/ImagePreview.tsx': 'componentStyles',
  'src/components/forms/ExpenseForm.tsx': 'componentStyles',
  'src/components/forms/TripForm.tsx': 'componentStyles',
  'src/components/ocr/ProcessingOptionsDialog.tsx': 'componentStyles',
  'src/components/verification/ReceiptImageViewer.tsx': 'componentStyles',
  'src/components/verification/SlidingDrawer.tsx': 'componentStyles',
  'src/components/verification/VerificationForm.tsx': 'componentStyles',
};

function migrateFile(filePath, styleType) {
  const fullPath = path.join(__dirname, 'ExpenseTracker', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Step 1: Remove StyleSheet from imports if it exists
  if (content.includes('StyleSheet')) {
    content = content.replace(
      /import\s*\{([^}]*),\s*StyleSheet\s*,([^}]*)\}\s*from\s*'react-native';/g,
      "import {$1,$2} from 'react-native';"
    );
    content = content.replace(
      /import\s*\{([^}]*)StyleSheet\s*,([^}]*)\}\s*from\s*'react-native';/g,
      "import {$1$2} from 'react-native';"
    );
    content = content.replace(
      /import\s*\{\s*StyleSheet\s*,([^}]*)\}\s*from\s*'react-native';/g,
      "import {$1} from 'react-native';"
    );
    modified = true;
  }

  // Step 2: Update style imports
  const styleImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]\.\.\/\.\.\/styles['"]/;
  const match = content.match(styleImportRegex);

  if (match) {
    const currentImports = match[1].split(',').map(s => s.trim()).filter(s => s);

    // Add styleType if not already present
    if (!currentImports.includes(styleType) && !currentImports.some(imp => imp.includes(styleType))) {
      currentImports.unshift(styleType);
    }

    // Ensure commonStyles is included if using inline styles
    if (content.includes('...commonStyles') && !currentImports.includes('commonStyles')) {
      currentImports.push('commonStyles');
    }

    const newImport = `import { ${currentImports.join(', ')} } from '../../styles';`;
    content = content.replace(styleImportRegex, newImport);
    modified = true;
  }

  // Step 3: Add style reference at top of component if using styleType
  if (!content.includes(`const styles = ${styleType}`)) {
    // Find the interface or export line after imports
    const componentRegex = /((?:interface|type|export)\s+\w+)/;
    const componentMatch = content.match(componentRegex);

    if (componentMatch) {
      const insertPos = content.indexOf(componentMatch[0]);
      const beforeComponent = content.substring(0, insertPos);
      const afterComponent = content.substring(insertPos);

      content = beforeComponent + `\nconst styles = ${styleType};\n\n` + afterComponent;
      modified = true;
    }
  }

  // Step 4: Remove StyleSheet.create() blocks
  const styleSheetRegex = /const\s+styles\s*=\s*StyleSheet\.create\(\{[\s\S]*?\}\);?\s*\n/g;
  if (content.match(styleSheetRegex)) {
    content = content.replace(styleSheetRegex, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Migrated: ${filePath}`);
  } else {
    console.log(`⏭️  Skipped (no changes): ${filePath}`);
  }
}

// Run migration
console.log('🚀 Starting style migration...\n');

Object.entries(fileMappings).forEach(([filePath, styleType]) => {
  migrateFile(filePath, styleType);
});

console.log('\n✨ Migration complete!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm run type-check');
console.log('2. Review any remaining errors');
console.log('3. Delete old style files: colors.ts, spacing.ts, typography.ts, common.ts, MergedStylesheet.ts');
console.log('4. Test the app!');
