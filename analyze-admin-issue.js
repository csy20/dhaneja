#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 ANALYZING ADMIN DASHBOARD ISSUE...\n');

const adminPath = '/workspaces/dhaneja/src/app/admin/page.tsx';
const content = fs.readFileSync(adminPath, 'utf8');

console.log('📊 ANALYSIS RESULTS:');
console.log('='.repeat(50));

// Check for potential issues
const issues = [];

// 1. Check dropzone import
if (content.includes('react-dropzone')) {
  console.log('🔍 Found react-dropzone import');
  
  // Check if dropzone is properly configured
  if (!content.includes('useDropzone')) {
    issues.push('useDropzone hook not found');
  }
  
  if (!content.includes('getRootProps')) {
    issues.push('getRootProps not used properly');
  }
  
  if (!content.includes('getInputProps')) {
    issues.push('getInputProps not used properly');
  }
}

// 2. Check form submission
if (!content.includes('handleSubmit')) {
  issues.push('handleSubmit function not found');
} else {
  console.log('✅ handleSubmit function found');
}

if (!content.includes('onSubmit={handleSubmit}')) {
  issues.push('form onSubmit handler not properly connected');
} else {
  console.log('✅ form onSubmit handler connected');
}

// 3. Check preventDefault
if (!content.includes('preventDefault()')) {
  issues.push('preventDefault() not found - could cause page reload');
} else {
  console.log('✅ preventDefault() found');
}

// 4. Check for potential conflicts
const problematicPatterns = [
  { name: 'Multiple onDrop functions', pattern: /onDrop.*=.*onDrop/g },
  { name: 'Async issues in form submission', pattern: /await.*onDrop/g },
  { name: 'Conflicting event handlers', pattern: /onChange.*onDrop/g }
];

problematicPatterns.forEach(({ name, pattern }) => {
  const matches = content.match(pattern);
  if (matches && matches.length > 0) {
    console.log(`⚠️  Potential issue: ${name} (${matches.length} matches)`);
    issues.push(name);
  }
});

// 5. Check for specific dropzone issues
if (content.includes('onDrop') && content.includes('<form')) {
  console.log('⚠️  Dropzone and form both present - potential conflict');
  issues.push('Dropzone and form conflict');
}

// 6. Look for useCallback dependencies
const useCallbackMatches = content.match(/useCallback\([^,]+,\s*\[(.*?)\]/gs);
if (useCallbackMatches) {
  console.log(`📋 Found ${useCallbackMatches.length} useCallback dependencies`);
  useCallbackMatches.forEach((match, index) => {
    console.log(`   ${index + 1}: ${match.substring(0, 100)}...`);
  });
}

console.log('\n🔍 ISSUES FOUND:');
if (issues.length === 0) {
  console.log('✅ No obvious issues detected in code structure');
} else {
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ❌ ${issue}`);
  });
}

console.log('\n💡 RECOMMENDATIONS:');
console.log('1. Test with simplified admin dashboard (/admin-fixed) first');
console.log('2. If fixed version works, the issue is with dropzone complexity');
console.log('3. Check browser console for JavaScript runtime errors');
console.log('4. Verify that form submission isn\'t being blocked by dropzone');

console.log('\n🔧 POTENTIAL FIXES:');
console.log('1. Disable dropzone temporarily in original admin');
console.log('2. Move image upload outside of form');
console.log('3. Use traditional file input instead of dropzone');
console.log('4. Add form submission state management');

// Create a simple fix
console.log('\n📝 CREATING QUICK FIX...');

const quickFix = `
// Quick fix for admin dashboard form submission
// Add this before the form submission:

const [isFormSubmitting, setIsFormSubmitting] = useState(false);

// Modify handleSubmit to:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (isFormSubmitting) {
    console.log('Form already submitting, ignoring...');
    return;
  }
  
  setIsFormSubmitting(true);
  
  try {
    // ... existing form submission logic ...
  } finally {
    setIsFormSubmitting(false);
  }
};

// And disable form elements during submission:
<button 
  type="submit" 
  disabled={isFormSubmitting}
  className={isFormSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
>
  {isFormSubmitting ? 'Adding...' : 'Add Product'}
</button>
`;

fs.writeFileSync('/workspaces/dhaneja/ADMIN_FIX_SUGGESTIONS.md', quickFix);
console.log('✅ Fix suggestions written to ADMIN_FIX_SUGGESTIONS.md');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Test /admin-fixed page to confirm it works');
console.log('2. If it works, apply the same fixes to original admin page');
console.log('3. Check browser developer tools for any JavaScript errors');
console.log('4. Test product creation end-to-end');
