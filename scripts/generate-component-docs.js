#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * @file generate-component-docs.js
 * @description Generate comprehensive documentation for Astro components
 * 
 * Extracts JSDoc comments and TypeScript interfaces from Astro components
 * to generate markdown documentation. Supports:
 * - Component props documentation
 * - Usage examples
 * - Type definitions
 * - Accessibility notes
 * - Performance guidelines
 * 
 * @example
 * ```bash
 * # Generate docs for all components
 * node scripts/generate-component-docs.js
 * 
 * # Generate docs for specific component
 * node scripts/generate-component-docs.js --component=Button
 * 
 * # Output to specific directory
 * node scripts/generate-component-docs.js --output=./docs/components
 * ```
 */

import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join, basename, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === Configuration ===
const CONFIG = {
  componentsDir: './src/components',
  outputDir: './docs/components',
  templateFile: './scripts/templates/component-doc.md',
  patterns: {
    astroComponent: /\.astro$/,
    jsDoc: /\/\*\*([\s\S]*?)\*\//g,
    propsInterface: /interface\s+Props\s*(?:extends\s+[^{]*?)?\s*\{([\s\S]*?)\}/,
    typeDefinition: /type\s+(\w+)\s*=\s*([^;]+);?/g,
    example: /@example\s+(.*?)\n\s*```(.*?)\n([\s\S]*?)```/g,
  },
  categories: {
    elements: 'Basic Elements',
    sections: 'Layout Sections', 
    partials: 'Page Partials',
    filters: 'Interactive Filters',
    socials: 'Social Components',
  }
};

// === Utility Functions ===

/**
 * Extract JSDoc comments from file content
 */
function extractJSDoc(content) {
  const matches = [...content.matchAll(CONFIG.patterns.jsDoc)];
  return matches.map(match => {
    const comment = match[1];
    return parseJSDocComment(comment);
  });
}

/**
 * Parse individual JSDoc comment
 */
function parseJSDocComment(comment) {
  const lines = comment.split('\n').map(line => 
    line.replace(/^\s*\*\s?/, '').trim()
  );
  
  const parsed = {
    description: [],
    tags: {},
    examples: []
  };
  
  let currentSection = 'description';
  let currentExample = null;
  
  for (const line of lines) {
    if (line.startsWith('@')) {
      const [tag, ...rest] = line.split(' ');
      const tagName = tag.substring(1);
      const tagValue = rest.join(' ');
      
      if (tagName === 'example') {
        currentExample = {
          title: tagValue || 'Example',
          code: []
        };
        currentSection = 'example';
      } else {
        parsed.tags[tagName] = tagValue;
        currentSection = 'tags';
      }
    } else if (currentSection === 'example' && currentExample) {
      if (line.startsWith('```')) {
        if (currentExample.code.length === 0) {
          currentExample.language = line.substring(3);
        } else {
          parsed.examples.push(currentExample);
          currentExample = null;
          currentSection = 'description';
        }
      } else if (currentExample.code.length > 0 || line.trim()) {
        currentExample.code.push(line);
      }
    } else if (currentSection === 'description' && line.trim()) {
      parsed.description.push(line);
    }
  }
  
  // Handle unclosed example
  if (currentExample) {
    parsed.examples.push(currentExample);
  }
  
  return parsed;
}

/**
 * Extract Props interface from component
 */
function extractPropsInterface(content) {
  const match = content.match(CONFIG.patterns.propsInterface);
  if (!match) return null;
  
  const propsContent = match[1];
  const props = [];
  
  // Parse individual properties
  const propLines = propsContent.split('\n');
  let currentProp = null;
  
  for (const line of propLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;
    
    // Property with JSDoc comment
    if (trimmed.startsWith('/**')) {
      currentProp = { comment: [] };
      continue;
    }
    
    if (trimmed.endsWith('*/') && currentProp) {
      continue;
    }
    
    if (trimmed.startsWith('*') && currentProp) {
      const comment = trimmed.replace(/^\*\s?/, '');
      if (comment) currentProp.comment.push(comment);
      continue;
    }
    
    // Property definition
    const propMatch = trimmed.match(/(\w+)(\?)?\s*:\s*([^;]+);?/);
    if (propMatch) {
      const [, name, optional, type] = propMatch;
      const prop = {
        name,
        type: type.trim(),
        optional: !!optional,
        description: currentProp?.comment.join(' ') || '',
      };
      props.push(prop);
      currentProp = null;
    }
  }
  
  return props;
}

/**
 * Extract type definitions
 */
function extractTypeDefinitions(content) {
  const matches = [...content.matchAll(CONFIG.patterns.typeDefinition)];
  return matches.map(match => ({
    name: match[1],
    definition: match[2].trim(),
  }));
}

/**
 * Analyze component file
 */
async function analyzeComponent(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const fileName = basename(filePath, '.astro');
    
    const analysis = {
      name: fileName,
      path: filePath,
      category: getComponentCategory(filePath),
      jsDoc: extractJSDoc(content),
      props: extractPropsInterface(content),
      types: extractTypeDefinitions(content),
      hasSlot: content.includes('<slot'),
      hasScript: content.includes('<script'),
      hasStyle: content.includes('<style'),
      imports: extractImports(content),
      complexity: calculateComplexity(content),
    };
    
    return analysis;
  } catch (error) {
    console.warn(`Warning: Could not analyze ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Determine component category from path
 */
function getComponentCategory(filePath) {
  for (const [folder, category] of Object.entries(CONFIG.categories)) {
    if (filePath.includes(`/${folder}/`)) {
      return category;
    }
  }
  return 'Components';
}

/**
 * Extract import statements
 */
function extractImports(content) {
  const importRegex = /import\s+(?:{[^}]+}|\w+|\*\s+as\s+\w+)\s+from\s+["']([^"']+)["']/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

/**
 * Calculate component complexity score
 */
function calculateComplexity(content) {
  let score = 0;
  
  // Basic complexity factors
  score += (content.match(/\bif\b/g) || []).length * 2;
  score += (content.match(/\bfor\b/g) || []).length * 3;
  score += (content.match(/\bswitch\b/g) || []).length * 4;
  score += (content.match(/\?\s*:/g) || []).length * 1;
  score += (content.match(/\bawait\b/g) || []).length * 2;
  score += (content.match(/\btry\b/g) || []).length * 3;
  
  // Component-specific factors
  score += (content.match(/<script/g) || []).length * 5;
  score += (content.match(/<style/g) || []).length * 2;
  score += (content.match(/Astro\.props/g) || []).length * 1;
  score += (content.match(/Astro\.slots/g) || []).length * 2;
  
  return Math.min(score, 100); // Cap at 100
}

/**
 * Generate markdown documentation for component
 */
function generateComponentDoc(analysis) {
  const { name, category, jsDoc, props, types, hasSlot, hasScript, hasStyle, imports, complexity } = analysis;
  
  const mainDoc = jsDoc[0] || { description: [], tags: {}, examples: [] };
  
  let markdown = `# ${name}\n\n`;
  
  // Description
  if (mainDoc.description.length > 0) {
    markdown += `${mainDoc.description.join(' ')}\n\n`;
  }
  
  // Metadata
  markdown += `## Overview\n\n`;
  markdown += `- **Category**: ${category}\n`;
  markdown += `- **Complexity**: ${getComplexityLabel(complexity)} (${complexity}/100)\n`;
  markdown += `- **Has Slots**: ${hasSlot ? '✅' : '❌'}\n`;
  markdown += `- **Has Script**: ${hasScript ? '✅' : '❌'}\n`;
  markdown += `- **Has Styles**: ${hasStyle ? '✅' : '❌'}\n`;
  
  if (mainDoc.tags.since) {
    markdown += `- **Since**: ${mainDoc.tags.since}\n`;
  }
  
  if (mainDoc.tags.author) {
    markdown += `- **Author**: ${mainDoc.tags.author}\n`;
  }
  
  markdown += `\n`;
  
  // Props
  if (props && props.length > 0) {
    markdown += `## Props\n\n`;
    markdown += `| Name | Type | Required | Description |\n`;
    markdown += `|------|------|----------|-------------|\n`;
    
    for (const prop of props) {
      const required = prop.optional ? '❌' : '✅';
      const description = prop.description || '-';
      markdown += `| \`${prop.name}\` | \`${prop.type}\` | ${required} | ${description} |\n`;
    }
    
    markdown += `\n`;
  }
  
  // Type Definitions
  if (types && types.length > 0) {
    markdown += `## Types\n\n`;
    
    for (const type of types) {
      markdown += `### \`${type.name}\`\n\n`;
      markdown += `\`\`\`typescript\n`;
      markdown += `type ${type.name} = ${type.definition}\n`;
      markdown += `\`\`\`\n\n`;
    }
  }
  
  // Examples
  if (mainDoc.examples && mainDoc.examples.length > 0) {
    markdown += `## Examples\n\n`;
    
    for (const example of mainDoc.examples) {
      markdown += `### ${example.title}\n\n`;
      markdown += `\`\`\`${example.language || 'astro'}\n`;
      markdown += `${example.code.join('\n')}\n`;
      markdown += `\`\`\`\n\n`;
    }
  }
  
  // Dependencies
  if (imports && imports.length > 0) {
    markdown += `## Dependencies\n\n`;
    markdown += `This component imports:\n\n`;
    
    for (const imp of imports) {
      markdown += `- \`${imp}\`\n`;
    }
    
    markdown += `\n`;
  }
  
  // Usage Guidelines
  markdown += `## Usage Guidelines\n\n`;
  
  if (complexity > 70) {
    markdown += `⚠️ **High Complexity**: This component has high complexity (${complexity}/100). Consider breaking it into smaller components.\n\n`;
  }
  
  if (hasScript) {
    markdown += `⚡ **Interactive**: This component includes client-side JavaScript for enhanced functionality.\n\n`;
  }
  
  if (hasSlot) {
    markdown += `🔌 **Flexible Content**: This component accepts content through slots for maximum flexibility.\n\n`;
  }
  
  // Accessibility Notes
  markdown += `## Accessibility\n\n`;
  
  if (name.toLowerCase().includes('button')) {
    markdown += `- Ensure proper ARIA labels for screen readers\n`;
    markdown += `- Support keyboard navigation (Enter/Space)\n`;
    markdown += `- Provide focus indicators\n`;
  }
  
  if (name.toLowerCase().includes('form')) {
    markdown += `- Associate labels with form controls\n`;
    markdown += `- Provide validation feedback\n`;
    markdown += `- Support keyboard navigation\n`;
  }
  
  if (hasScript) {
    markdown += `- Test with JavaScript disabled\n`;
    markdown += `- Provide fallback functionality\n`;
  }
  
  markdown += `- Test with screen readers\n`;
  markdown += `- Verify color contrast ratios\n`;
  markdown += `- Ensure focus management\n\n`;
  
  // Performance Notes
  markdown += `## Performance\n\n`;
  
  if (complexity > 50) {
    markdown += `- Consider lazy loading for better performance\n`;
  }
  
  if (hasScript) {
    markdown += `- Client-side JavaScript adds to bundle size\n`;
    markdown += `- Consider code splitting for large scripts\n`;
  }
  
  markdown += `- Component renders server-side by default\n`;
  markdown += `- Optimized for Astro's Islands architecture\n\n`;
  
  return markdown;
}

/**
 * Get complexity label
 */
function getComplexityLabel(score) {
  if (score <= 20) return 'Low';
  if (score <= 50) return 'Medium';
  if (score <= 80) return 'High';
  return 'Very High';
}

/**
 * Find all component files
 */
async function findComponents(dir = CONFIG.componentsDir, components = []) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await findComponents(fullPath, components);
      } else if (entry.isFile() && CONFIG.patterns.astroComponent.test(entry.name)) {
        components.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }
  
  return components;
}

/**
 * Generate index file
 */
function generateIndexDoc(analyses) {
  let markdown = `# Component Documentation\n\n`;
  markdown += `Generated on ${new Date().toLocaleString()}\n\n`;
  
  // Group by category
  const byCategory = {};
  for (const analysis of analyses) {
    if (!byCategory[analysis.category]) {
      byCategory[analysis.category] = [];
    }
    byCategory[analysis.category].push(analysis);
  }
  
  // Table of contents
  markdown += `## Table of Contents\n\n`;
  for (const [category, components] of Object.entries(byCategory)) {
    markdown += `### ${category}\n\n`;
    for (const component of components.sort((a, b) => a.name.localeCompare(b.name))) {
      markdown += `- [${component.name}](./${component.name}.md)\n`;
    }
    markdown += `\n`;
  }
  
  // Statistics
  markdown += `## Statistics\n\n`;
  markdown += `- **Total Components**: ${analyses.length}\n`;
  markdown += `- **Categories**: ${Object.keys(byCategory).length}\n`;
  
  const withProps = analyses.filter(a => a.props && a.props.length > 0).length;
  const withSlots = analyses.filter(a => a.hasSlot).length;
  const withScripts = analyses.filter(a => a.hasScript).length;
  
  markdown += `- **With Props**: ${withProps}\n`;
  markdown += `- **With Slots**: ${withSlots}\n`;
  markdown += `- **With Scripts**: ${withScripts}\n\n`;
  
  // Complexity distribution
  const complexityRanges = {
    'Low (0-20)': 0,
    'Medium (21-50)': 0,
    'High (51-80)': 0,
    'Very High (81-100)': 0,
  };
  
  for (const analysis of analyses) {
    if (analysis.complexity <= 20) complexityRanges['Low (0-20)']++;
    else if (analysis.complexity <= 50) complexityRanges['Medium (21-50)']++;
    else if (analysis.complexity <= 80) complexityRanges['High (51-80)']++;
    else complexityRanges['Very High (81-100)']++;
  }
  
  markdown += `## Complexity Distribution\n\n`;
  for (const [range, count] of Object.entries(complexityRanges)) {
    markdown += `- **${range}**: ${count} components\n`;
  }
  
  return markdown;
}

/**
 * Main function
 */
async function generateDocs() {
  try {
    console.log('📚 Generating component documentation...');
    
    // Find all components
    const componentFiles = await findComponents();
    console.log(`Found ${componentFiles.length} components`);
    
    // Analyze each component
    const analyses = [];
    for (const file of componentFiles) {
      console.log(`Analyzing ${basename(file)}...`);
      const analysis = await analyzeComponent(file);
      if (analysis) {
        analyses.push(analysis);
      }
    }
    
    // Create output directory
    await mkdir(CONFIG.outputDir, { recursive: true });
    
    // Generate documentation for each component
    for (const analysis of analyses) {
      const markdown = generateComponentDoc(analysis);
      const outputFile = join(CONFIG.outputDir, `${analysis.name}.md`);
      await writeFile(outputFile, markdown);
      console.log(`Generated ${outputFile}`);
    }
    
    // Generate index
    const indexMarkdown = generateIndexDoc(analyses);
    const indexFile = join(CONFIG.outputDir, 'README.md');
    await writeFile(indexFile, indexMarkdown);
    console.log(`Generated ${indexFile}`);
    
    console.log(`\n✅ Documentation generated successfully!`);
    console.log(`📁 Output directory: ${CONFIG.outputDir}`);
    console.log(`📊 Generated docs for ${analyses.length} components`);
    
  } catch (error) {
    console.error('❌ Documentation generation failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${resolve(process.argv[1])}`) {
  generateDocs();
}

export { generateDocs, analyzeComponent, CONFIG };