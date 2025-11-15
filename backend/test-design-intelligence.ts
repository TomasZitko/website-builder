/**
 * Test Design Intelligence System
 * Verifies that the enhanced 2025 design prompts work correctly
 */

import { generateWebsiteCode } from './src/services/gemini.service';
import { ConversationState } from './src/services/conversationTracker';
import * as fs from 'fs';
import * as path from 'path';

async function testDesignIntelligence() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎨 TESTING DESIGN INTELLIGENCE - Phase 2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test conversation state
  const testState: ConversationState = {
    websiteType: 'hotel',
    businessName: 'Grand Palace Hotel',
    targetAudience: 'luxury travelers and couples',
    mainGoal: 'generate bookings',
    location: 'Prague, Czech Republic',
    pricing: 'Rooms from €300/night',
    specialFeatures: 'Online booking, photo gallery, customer reviews',
    brandColors: 'Gold and navy blue',
    selectedTheme: 'luxury-elegant',
    pages: 'single',
    style: 'modern'
  };

  console.log('📋 Test Scenario:');
  console.log('─────────────────────────────────────────────────────');
  console.log(`Business: ${testState.businessName}`);
  console.log(`Type: ${testState.websiteType}`);
  console.log(`Theme: ${testState.selectedTheme}`);
  console.log(`Target: ${testState.targetAudience}`);
  console.log(`Goal: ${testState.mainGoal}`);
  console.log('─────────────────────────────────────────────────────\n');

  try {
    console.log('🚀 Generating website with 2025 Design Intelligence...\n');

    const startTime = Date.now();
    const result = await generateWebsiteCode(testState);
    const endTime = Date.now();

    console.log('✅ GENERATION SUCCESSFUL!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Generation time: ${(endTime - startTime) / 1000}s`);
    console.log(`📄 HTML size: ${result.files['index.html'].length} chars`);
    console.log(`🎨 CSS size: ${result.files['style.css'].length} chars`);
    console.log(`⚡ JS size: ${result.files['script.js']?.length || 0} chars`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verify 2025 design features
    console.log('🔍 VERIFYING 2025 DESIGN FEATURES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const css = result.files['style.css'];
    const html = result.files['index.html'];

    const checks = {
      glassmorphism: css.includes('backdrop-filter') && css.includes('blur'),
      liquidGradients: css.includes('linear-gradient') || css.includes('radial-gradient'),
      responsiveTypography: css.includes('clamp('),
      cssVariables: css.includes(':root') && css.includes('--'),
      semanticHTML: html.includes('<header>') && html.includes('<main>') && html.includes('<footer>'),
      accessibility: html.includes('aria-') || html.includes('alt='),
      metaTags: html.includes('<meta name="description"'),
      googleFonts: html.includes('fonts.googleapis.com'),
      smoothAnimations: css.includes('transition') || css.includes('@keyframes'),
      mobileFirst: css.includes('@media')
    };

    Object.entries(checks).forEach(([feature, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${feature}: ${passed ? 'PASS' : 'FAIL'}`);
    });

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const percentage = Math.round((passedChecks / totalChecks) * 100);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Design Quality Score: ${passedChecks}/${totalChecks} (${percentage}%)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Save to test output
    const outputDir = path.join(__dirname, 'test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'test-website.html'),
      result.files['index.html']
    );
    fs.writeFileSync(
      path.join(outputDir, 'test-style.css'),
      result.files['style.css']
    );
    fs.writeFileSync(
      path.join(outputDir, 'test-script.js'),
      result.files['script.js'] || ''
    );

    console.log('💾 Test website saved to: backend/test-output/');
    console.log('   • test-website.html');
    console.log('   • test-style.css');
    console.log('   • test-script.js\n');

    if (percentage >= 80) {
      console.log('🎉 SUCCESS! Design Intelligence is working excellently!');
    } else if (percentage >= 60) {
      console.log('⚠️  WARNING: Design Intelligence needs improvement.');
    } else {
      console.log('❌ FAILURE: Design Intelligence is not meeting standards.');
    }

  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ TEST FAILED:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check GEMINI_API_KEY is set in .env');
    console.error('   2. Verify Gemini API is accessible');
    console.error('   3. Check network connection');
    console.error('   4. Review error message above for details');
    process.exit(1);
  }
}

// Run test
testDesignIntelligence();
