#!/usr/bin/env node

/**
 * HeyZack LaunchBoom Templates - Content Validation Pipeline
 * 
 * Comprehensive content validation system that includes:
 * 1. Link validation (internal and anchor links)
 * 2. Frontmatter validation
 * 3. Content structure validation
 * 4. Cross-reference validation
 * 5. SEO and accessibility checks
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import LinkValidator from './link-validator.js';

class ContentValidator {
  constructor(contentDir = './src/content/docs') {
    this.contentDir = contentDir;
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.linkValidator = new LinkValidator(contentDir);
  }

  /**
   * Run complete content validation pipeline
   */
  async validate() {
    console.log('🚀 Starting comprehensive content validation...');
    
    try {
      // Step 1: Link validation
      await this.validateLinks();
      
      // Step 2: Frontmatter validation
      await this.validateFrontmatter();
      
      // Step 3: Content structure validation
      await this.validateContentStructure();
      
      // Step 4: Cross-reference validation
      await this.validateCrossReferences();
      
      // Step 5: SEO validation
      await this.validateSEO();
      
      // Step 6: Accessibility validation
      await this.validateAccessibility();
      
      // Generate comprehensive report
      this.generateReport();
      
      return this.errors.length === 0;
      
    } catch (error) {
      console.error('❌ Validation pipeline failed:', error);
      return false;
    }
  }

  /**
   * Validate all internal links
   */
  async validateLinks() {
    console.log('\n🔗 Validating internal links...');
    
    const linkValidationSuccess = await this.linkValidator.validate();
    
    // Merge link validation results
    this.errors.push(...this.linkValidator.errors.map(error => ({
      ...error,
      category: 'links'
    })));
    
    this.warnings.push(...this.linkValidator.warnings.map(warning => ({
      ...warning,
      category: 'links'
    })));
    
    if (linkValidationSuccess) {
      this.info.push({
        category: 'links',
        message: 'All internal links are valid'
      });
    }
  }

  /**
   * Validate frontmatter in all markdown files
   */
  async validateFrontmatter() {
    console.log('\n📋 Validating frontmatter...');
    
    const pattern = path.join(this.contentDir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    for (const file of files) {
      await this.validateFileFrontmatter(file);
    }
  }

  /**
   * Validate frontmatter in a specific file
   */
  async validateFileFrontmatter(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.contentDir, filePath);
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
      this.errors.push({
        category: 'frontmatter',
        type: 'missing-frontmatter',
        file: relativePath,
        message: 'Missing frontmatter block'
      });
      return;
    }
    
    const frontmatterText = frontmatterMatch[1];
    const frontmatter = this.parseFrontmatter(frontmatterText);
    
    // Required fields validation
    const requiredFields = ['title', 'description'];
    for (const field of requiredFields) {
      if (!frontmatter[field]) {
        this.errors.push({
          category: 'frontmatter',
          type: 'missing-required-field',
          file: relativePath,
          field: field,
          message: `Missing required frontmatter field: ${field}`
        });
      }
    }
    
    // Title validation
    if (frontmatter.title) {
      if (frontmatter.title.length > 60) {
        this.warnings.push({
          category: 'frontmatter',
          type: 'title-too-long',
          file: relativePath,
          message: `Title is ${frontmatter.title.length} characters (recommended: <60)`
        });
      }
    }
    
    // Description validation
    if (frontmatter.description) {
      if (frontmatter.description.length > 160) {
        this.warnings.push({
          category: 'frontmatter',
          type: 'description-too-long',
          file: relativePath,
          message: `Description is ${frontmatter.description.length} characters (recommended: <160)`
        });
      }
      
      if (frontmatter.description.length < 50) {
        this.warnings.push({
          category: 'frontmatter',
          type: 'description-too-short',
          file: relativePath,
          message: `Description is ${frontmatter.description.length} characters (recommended: >50)`
        });
      }
    }
  }

  /**
   * Validate content structure
   */
  async validateContentStructure() {
    console.log('\n📐 Validating content structure...');
    
    const pattern = path.join(this.contentDir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    for (const file of files) {
      await this.validateFileStructure(file);
    }
  }

  /**
   * Validate structure of a specific file
   */
  async validateFileStructure(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.contentDir, filePath);
    
    // Remove frontmatter for content analysis
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
    
    // Check for proper heading hierarchy
    const headings = this.extractHeadings(contentWithoutFrontmatter);
    this.validateHeadingHierarchy(relativePath, headings);
    
    // Check for minimum content length
    const wordCount = this.getWordCount(contentWithoutFrontmatter);
    if (wordCount < 100) {
      this.warnings.push({
        category: 'structure',
        type: 'short-content',
        file: relativePath,
        message: `Content is only ${wordCount} words (recommended: >100)`
      });
    }
    
    // Check for duplicate headings
    const headingTexts = headings.map(h => h.text.toLowerCase());
    const duplicates = headingTexts.filter((text, index) => headingTexts.indexOf(text) !== index);
    if (duplicates.length > 0) {
      this.warnings.push({
        category: 'structure',
        type: 'duplicate-headings',
        file: relativePath,
        message: `Duplicate headings found: ${[...new Set(duplicates)].join(', ')}`
      });
    }
  }

  /**
   * Validate cross-references between sections
   */
  async validateCrossReferences() {
    console.log('\n🔄 Validating cross-references...');
    
    const pattern = path.join(this.contentDir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    // Build reference map
    const referenceMap = new Map();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(this.contentDir, file);
      
      // Find all outbound references
      const references = this.extractReferences(content);
      referenceMap.set(relativePath, references);
    }
    
    // Validate reference consistency
    for (const [file, references] of referenceMap) {
      for (const ref of references) {
        // Check if referenced sections have back-references
        const targetFile = ref.target;
        const targetReferences = referenceMap.get(targetFile) || [];
        
        const hasBackReference = targetReferences.some(targetRef => 
          targetRef.target === file
        );
        
        if (!hasBackReference && ref.type === 'integration') {
          this.info.push({
            category: 'cross-references',
            type: 'missing-back-reference',
            file: file,
            message: `Consider adding back-reference from ${targetFile} to ${file}`
          });
        }
      }
    }
  }

  /**
   * Validate SEO aspects
   */
  async validateSEO() {
    console.log('\n🔍 Validating SEO aspects...');
    
    const pattern = path.join(this.contentDir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    for (const file of files) {
      await this.validateFileSEO(file);
    }
  }

  /**
   * Validate SEO for a specific file
   */
  async validateFileSEO(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.contentDir, filePath);
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return;
    
    const frontmatter = this.parseFrontmatter(frontmatterMatch[1]);
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
    
    // Check for H1 heading
    const h1Match = contentWithoutFrontmatter.match(/^# (.+)$/m);
    if (!h1Match && !frontmatter.title) {
      this.errors.push({
        category: 'seo',
        type: 'missing-h1',
        file: relativePath,
        message: 'Missing H1 heading or title in frontmatter'
      });
    }
    
    // Check for meta description
    if (!frontmatter.description) {
      this.errors.push({
        category: 'seo',
        type: 'missing-meta-description',
        file: relativePath,
        message: 'Missing meta description in frontmatter'
      });
    }
    
    // Check for keyword density (basic check)
    if (frontmatter.title) {
      const titleWords = frontmatter.title.toLowerCase().split(/\s+/);
      const contentText = contentWithoutFrontmatter.toLowerCase();
      
      for (const word of titleWords) {
        if (word.length > 3) {
          const occurrences = (contentText.match(new RegExp(word, 'g')) || []).length;
          const wordCount = this.getWordCount(contentWithoutFrontmatter);
          const density = (occurrences / wordCount) * 100;
          
          if (density > 5) {
            this.warnings.push({
              category: 'seo',
              type: 'high-keyword-density',
              file: relativePath,
              message: `High keyword density for "${word}": ${density.toFixed(1)}% (recommended: <5%)`
            });
          }
        }
      }
    }
  }

  /**
   * Validate accessibility aspects
   */
  async validateAccessibility() {
    console.log('\n♿ Validating accessibility...');
    
    const pattern = path.join(this.contentDir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    for (const file of files) {
      await this.validateFileAccessibility(file);
    }
  }

  /**
   * Validate accessibility for a specific file
   */
  async validateFileAccessibility(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.contentDir, filePath);
    
    // Check for images without alt text
    const imageRegex = /!\[([^\]]*)\]\([^)]+\)/g;
    let match;
    
    while ((match = imageRegex.exec(content)) !== null) {
      const altText = match[1];
      const lineNumber = this.getLineNumber(content, match.index);
      
      if (!altText || altText.trim() === '') {
        this.errors.push({
          category: 'accessibility',
          type: 'missing-alt-text',
          file: relativePath,
          line: lineNumber,
          message: 'Image missing alt text for accessibility'
        });
      }
    }
    
    // Check for proper heading structure (no skipped levels)
    const headings = this.extractHeadings(content);
    for (let i = 1; i < headings.length; i++) {
      const prevLevel = headings[i - 1].level;
      const currentLevel = headings[i].level;
      
      if (currentLevel > prevLevel + 1) {
        this.warnings.push({
          category: 'accessibility',
          type: 'skipped-heading-level',
          file: relativePath,
          line: headings[i].line,
          message: `Heading level skipped from H${prevLevel} to H${currentLevel}`
        });
      }
    }
  }

  // Helper methods
  
  parseFrontmatter(frontmatterText) {
    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        frontmatter[key] = value;
      }
    }
    
    return frontmatter;
  }
  
  extractHeadings(content) {
    const headings = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2].trim(),
          line: i + 1
        });
      }
    }
    
    return headings;
  }
  
  validateHeadingHierarchy(file, headings) {
    for (let i = 1; i < headings.length; i++) {
      const prevLevel = headings[i - 1].level;
      const currentLevel = headings[i].level;
      
      if (currentLevel > prevLevel + 1) {
        this.warnings.push({
          category: 'structure',
          type: 'heading-hierarchy-skip',
          file: file,
          line: headings[i].line,
          message: `Heading hierarchy skip from H${prevLevel} to H${currentLevel}`
        });
      }
    }
  }
  
  getWordCount(content) {
    // Remove markdown syntax and count words
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
      .replace(/[#*_~`]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return cleanContent ? cleanContent.split(' ').length : 0;
  }
  
  extractReferences(content) {
    const references = [];
    
    // Find integration points mentions
    const integrationRegex = /- \[([^\]]+)\]\(([^)]+)\) - (.+)/g;
    let match;
    
    while ((match = integrationRegex.exec(content)) !== null) {
      references.push({
        type: 'integration',
        text: match[1],
        target: match[2],
        description: match[3]
      });
    }
    
    return references;
  }
  
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Generate comprehensive validation report
   */
  generateReport() {
    console.log('\n📊 Content Validation Report');
    console.log('=' .repeat(60));
    
    const totalIssues = this.errors.length + this.warnings.length;
    
    if (totalIssues === 0) {
      console.log('✅ All content validation checks passed!');
    } else {
      console.log(`Found ${this.errors.length} errors and ${this.warnings.length} warnings\n`);
      
      // Group by category
      const categories = ['links', 'frontmatter', 'structure', 'cross-references', 'seo', 'accessibility'];
      
      for (const category of categories) {
        const categoryErrors = this.errors.filter(e => e.category === category);
        const categoryWarnings = this.warnings.filter(w => w.category === category);
        
        if (categoryErrors.length > 0 || categoryWarnings.length > 0) {
          console.log(`\n📂 ${category.toUpperCase()}`);
          console.log('-'.repeat(30));
          
          categoryErrors.forEach(error => {
            console.log(`❌ ${error.file}${error.line ? ':' + error.line : ''}`);
            console.log(`   ${error.message}\n`);
          });
          
          categoryWarnings.forEach(warning => {
            console.log(`⚠️  ${warning.file}${warning.line ? ':' + warning.line : ''}`);
            console.log(`   ${warning.message}\n`);
          });
        }
      }
    }
    
    // Summary
    console.log(`\n📈 Summary:`);
    console.log(`   - Total files validated: ${glob.sync(path.join(this.contentDir, '**/*.{md,mdx}')).length}`);
    console.log(`   - Errors: ${this.errors.length}`);
    console.log(`   - Warnings: ${this.warnings.length}`);
    console.log(`   - Info messages: ${this.info.length}`);
    
    if (this.info.length > 0) {
      console.log('\n💡 Suggestions:');
      this.info.forEach(info => {
        console.log(`   - ${info.message}`);
      });
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ContentValidator();
  
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Content validation failed:', error);
    process.exit(1);
  });
}

export default ContentValidator;