import { generateWebsiteCode } from '../src/services/gemini.service';

describe('Gemini Service', () => {
  it('should generate website code', async () => {
    const conversationState = {
      websiteType: 'bakery',
      businessName: 'Sweet Dreams',
      pages: ['home', 'menu', 'contact'],
      style: 'cozy',
      readyToGenerate: true
    };

    const result = await generateWebsiteCode(conversationState);

    expect(result.files['index.html']).toContain('<!DOCTYPE html>');
    expect(result.files['style.css']).toBeDefined();
    expect(result.files['index.html']).toContain('Sweet Dreams');
  }, 30000); // 30 second timeout

  it('should have valid HTML structure', async () => {
    const conversationState = {
      websiteType: 'restaurant',
      businessName: 'The Gourmet Kitchen',
      pages: ['home', 'menu'],
      style: 'elegant',
      readyToGenerate: true
    };

    const result = await generateWebsiteCode(conversationState);

    expect(result.files['index.html']).toContain('<html');
    expect(result.files['index.html']).toContain('<head>');
    expect(result.files['index.html']).toContain('<body>');
    expect(result.files['index.html']).toContain('</html>');
  }, 30000);

  it('should sanitize dangerous code', async () => {
    const conversationState = {
      websiteType: 'portfolio',
      businessName: 'Test',
      pages: ['home'],
      style: 'modern',
      readyToGenerate: true
    };

    const result = await generateWebsiteCode(conversationState);

    // Should not contain inline event handlers
    expect(result.files['index.html']).not.toMatch(/on\w+\s*=/);
  }, 30000);
});
