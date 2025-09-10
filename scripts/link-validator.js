#!/usr/bin/env node

/**
 * HeyZack LaunchBoom Templates - Internal Link Validator
 * 
 * This script validates all internal links in markdown files to ensure:
 * 1. All internal links point to existing files/pages
 * 2. Anchor links reference existing headings
 * 3. Cross-references between sections are valid
 * 4. No broken links exist in the content
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class LinkValidator {
  constructor(contentDir = './src/content/docs') {
    this.contentDir = contentDir;
    this.errors = [];
    this.warnings = [];
    this.validatedFiles = new Set();
    this.existingPages = new Set();
    this.headingAnchors = new Map(); // file -> Set of anchors
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 Starting link validation...');
    
    // Step 1: Discover all existing pages
    await this.discoverPages();
    
    // Step 2: Extract all headings for anchor validation
    await this.extractHeadings();
    
    // Step 3: Validate all links
    await this.validateAllLinks();
    
    // Step 4: Report results
    this.generateReport();
    
    return this.errors.length === 0;
  }

  /**
   * Discover all existing pages in the content directory
   */
  async discoverPages() {
    const pattern = path.join(this.contentDir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    for (const file of files) {
      const relativePath = path.relative(this.contentDir, file);
      const urlPath = this.filePathToUrl(relativePath);
      this.existingPages.add(urlPath);
    }
    
    console.log(`📄 Discovered ${this.existingPages.size} pages`);
  }

  /**
   * Extract all headings from markdown files for anchor validation
   */
  async extractHeadings() {
    const pattern = path.join(this.contentDir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const headings = this.extractHeadingsFromContent(content);
      const relativePath = path.relative(this.contentDir, file);
      const urlPath = this.filePathToUrl(relativePath);
      this.headingAnchors.set(urlPath, new Set(headings));
    }
    
    console.log(`🔗 Extracted headings from ${files.length} files`);
  }

  /**
   * Validate all links in all markdown files
   */
  async validateAllLinks() {
    const pattern = path.join(this.contentDir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    for (const file of files) {
      await this.validateFileLinks(file);
    }
    
    console.log(`✅ Validated links in ${files.length} files`);
  }

  /**
   * Validate links in a specific file
   */
  async validateFileLinks(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.contentDir, filePath);
    
    // Extract all markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, linkText, linkUrl] = match;
      const lineNumber = this.getLineNumber(content, match.index);
      
      await this.validateLink(relativePath, linkUrl, linkText, lineNumber);
    }
    
    // Extract LinkCard href attributes
    const linkCardRegex = /href=["']([^"']+)["']/g;
    while ((match = linkCardRegex.exec(content)) !== null) {
      const [fullMatch, linkUrl] = match;
      const lineNumber = this.getLineNumber(content, match.index);
      
      await this.validateLink(relativePath, linkUrl, 'LinkCard', lineNumber);
    }
  }

  /**
   * Validate a single link
   */
  async validateLink(sourceFile, linkUrl, linkText, lineNumber) {
    // Skip external links
    if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://') || linkUrl.startsWith('mailto:')) {
      return;
    }
    
    // Skip anchor-only links (same page)
    if (linkUrl.startsWith('#')) {
      const sourceUrl = this.filePathToUrl(sourceFile);
      const anchor = linkUrl.substring(1);
      
      if (!this.headingAnchors.get(sourceUrl)?.has(anchor)) {
        this.errors.push({
          type: 'broken-anchor',
          file: sourceFile,
          line: lineNumber,
          link: linkUrl,
          text: linkText,
          message: `Anchor '#${anchor}' not found in current page`
        });
      }
      return;
    }
    
    // Parse internal links
    const [urlPath, anchor] = linkUrl.split('#');
    const normalizedPath = this.normalizeInternalPath(urlPath);
    
    // Check if the target page exists
    if (!this.existingPages.has(normalizedPath)) {
      this.errors.push({
        type: 'broken-link',
        file: sourceFile,
        line: lineNumber,
        link: linkUrl,
        text: linkText,
        message: `Target page '${normalizedPath}' does not exist`
      });
      return;
    }
    
    // Check anchor if present
    if (anchor) {
      const targetHeadings = this.headingAnchors.get(normalizedPath);
      if (!targetHeadings?.has(anchor)) {
        this.errors.push({
          type: 'broken-anchor',
          file: sourceFile,
          line: lineNumber,
          link: linkUrl,
          text: linkText,
          message: `Anchor '#${anchor}' not found in target page '${normalizedPath}'`
        });
      }
    }
  }

  /**
   * Convert file path to URL path
   */
  filePathToUrl(filePath) {
    // Remove file extension
    let urlPath = filePath.replace(/\.(md|mdx)$/, '');
    
    // Convert index files to directory paths
    if (urlPath.endsWith('/index')) {
      urlPath = urlPath.replace('/index', '/');
    }
    
    // Ensure leading slash
    if (!urlPath.startsWith('/')) {
      urlPath = '/' + urlPath;
    }
    
    // Ensure trailing slash for directories
    if (!urlPath.endsWith('/') && !path.extname(urlPath)) {
      urlPath += '/';
    }
    
    return urlPath;
  }

  /**
   * Normalize internal path for comparison
   */
  normalizeInternalPath(urlPath) {
    // Remove leading slash if present
    if (urlPath.startsWith('/')) {
      urlPath = urlPath.substring(1);
    }
    
    // Add trailing slash if not present
    if (!urlPath.endsWith('/')) {
      urlPath += '/';
    }
    
    // Convert to absolute path
    return '/' + urlPath;
  }

  /**
   * Extract headings from markdown content
   */
  extractHeadingsFromContent(content) {
    const headings = [];
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const headingText = match[1].trim();
      const anchor = this.textToAnchor(headingText);
      headings.push(anchor);
    }
    
    return headings;
  }

  /**
   * Convert heading text to anchor
   */
  textToAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Get line number for a character index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 Link Validation Report');
    console.log('=' .repeat(50));
    
    if (this.errors.length === 0) {
      console.log('✅ All links are valid!');
    } else {
      console.log(`❌ Found ${this.errors.length} broken links:\n`);
      
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type.toUpperCase()}`);
        console.log(`   File: ${error.file}:${error.line}`);
        console.log(`   Link: ${error.link}`);
        console.log(`   Text: "${error.text}"`);
        console.log(`   Issue: ${error.message}\n`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`⚠️  Found ${this.warnings.length} warnings:\n`);
      
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        console.log(`   File: ${warning.file}:${warning.line}\n`);
      });
    }
    
    console.log(`📈 Summary:`);
    console.log(`   - Pages discovered: ${this.existingPages.size}`);
    console.log(`   - Errors found: ${this.errors.length}`);
    console.log(`   - Warnings: ${this.warnings.length}`);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new LinkValidator();
  
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Link validation failed:', error);
    process.exit(1);
  });
}

export default LinkValidator;