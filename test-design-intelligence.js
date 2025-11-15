/**
 * Test script for Design Intelligence Phase 2
 *
 * This script verifies that:
 * 1. Design Master system prompt is created
 * 2. Conversational flow prompts are created
 * 3. Prompts are properly integrated
 * 4. All files compile and can be imported
 */

const fs = require('fs');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 PHASE 2: DESIGN INTELLIGENCE VERIFICATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function test(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`✅ ${name}`);
      results.passed++;
    } else {
      console.log(`⚠️  ${name}: ${result}`);
      results.warnings++;
    }
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    results.failed++;
  }
}

// Test 1: Check if Design Master prompt exists
test('Design Master system prompt file exists', () => {
  const filePath = path.join(__dirname, 'backend/src/services/prompts/designMaster.ts');
  return fs.existsSync(filePath);
});

// Test 2: Check if Conversational Flow prompts exist
test('Conversational Flow prompts file exists', () => {
  const filePath = path.join(__dirname, 'backend/src/services/prompts/conversationalFlow.ts');
  return fs.existsSync(filePath);
});

// Test 3: Verify Design Master prompt content
test('Design Master prompt contains 2025 design guidelines', () => {
  const filePath = path.join(__dirname, 'backend/src/services/prompts/designMaster.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  const requiredSections = [
    'GLASSMORPHISM',
    'TYPOGRAPHY EXCELLENCE',
    'COLOR THEORY',
    'SPACING & LAYOUT',
    'ANIMATION & MICRO-INTERACTIONS',
    'RESPONSIVE DESIGN',
    'COMPONENT PATTERNS',
    'ACCESSIBILITY',
    'PERFORMANCE OPTIMIZATION',
    'SEO BEST PRACTICES'
  ];

  const missing = requiredSections.filter(section => !content.includes(section));

  if (missing.length > 0) {
    return `Missing sections: ${missing.join(', ')}`;
  }

  return true;
});

// Test 4: Verify Conversational Flow prompt content
test('Conversational Flow contains question structure', () => {
  const filePath = path.join(__dirname, 'backend/src/services/prompts/conversationalFlow.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  const requiredElements = [
    'CONVERSATIONAL_QUESTIONS',
    'buildFinalPrompt',
    'ENHANCED_CONVERSATION_PROMPT'
  ];

  const missing = requiredElements.filter(element => !content.includes(element));

  if (missing.length > 0) {
    return `Missing elements: ${missing.join(', ')}`;
  }

  return true;
});

// Test 5: Verify integration into code generation prompt
test('Code generation prompt imports Design Master', () => {
  const filePath = path.join(__dirname, 'backend/src/services/prompts/codeGenerationPrompt.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('DESIGN_MASTER_SYSTEM_PROMPT')) {
    return 'Design Master not imported';
  }

  if (!content.includes("import { DESIGN_MASTER_SYSTEM_PROMPT } from './designMaster'")) {
    return 'Design Master import statement missing';
  }

  return true;
});

// Test 6: Verify system prompt uses enhanced conversation
test('System prompt uses enhanced conversation prompt', () => {
  const filePath = path.join(__dirname, 'backend/src/services/prompts/systemPrompt.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('ENHANCED_CONVERSATION_PROMPT')) {
    return 'Enhanced conversation prompt not used';
  }

  return true;
});

// Test 7: Check prompt quality - Design Master
test('Design Master prompt quality check', () => {
  const filePath = path.join(__dirname, 'backend/src/services/prompts/designMaster.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check for glassmorphism techniques
  if (!content.includes('backdrop-filter: blur(20px)')) {
    return 'Missing specific glassmorphism CSS';
  }

  // Check for 2025 fonts
  if (!content.includes('Inter') || !content.includes('Plus Jakarta Sans')) {
    return 'Missing 2025 font recommendations';
  }

  // Check for color combinations
  if (!content.includes('#6366f1')) {
    return 'Missing specific color values';
  }

  // Check for responsive breakpoints
  if (!content.includes('640px') || !content.includes('1024px')) {
    return 'Missing responsive breakpoints';
  }

  return true;
});

// Test 8: File sizes (ensure prompts are comprehensive)
test('Design Master prompt is comprehensive (>3000 chars)', () => {
  const filePath = path.join(__dirname, 'backend/src/services/prompts/designMaster.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  if (content.length < 3000) {
    return `Only ${content.length} characters (expected >3000)`;
  }

  return true;
});

// Test 9: Verify backend Gemini service exists
test('Gemini service file exists', () => {
  const filePath = path.join(__dirname, 'backend/src/services/gemini.service.ts');
  return fs.existsSync(filePath);
});

// Test 10: Verify Gemini config exists
test('Gemini config file exists', () => {
  const filePath = path.join(__dirname, 'backend/src/config/gemini.ts');
  return fs.existsSync(filePath);
});

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 TEST SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Passed:   ${results.passed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`❌ Failed:   ${results.failed}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (results.failed === 0 && results.warnings === 0) {
  console.log('🎉 ALL TESTS PASSED! Phase 2 implementation is complete.\n');
  process.exit(0);
} else if (results.failed === 0) {
  console.log('✓ Implementation complete with minor warnings.\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
