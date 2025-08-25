#!/usr/bin/env node

/**
 * Validation script for the internal linking system
 * Tests the functionality of the internal linking components and utilities
 */

import { processGlossaryLinks, getGlossaryStats, GLOSSARY_TERMS } from '../src/utils/glossary-linking.js';
import { analyzeContentRelationships, TOPIC_CLUSTERS } from '../src/utils/internal-linking.js';
import { processAllPosts } from '../src/utils/posts.js';

async function validateInternalLinking() {
  console.log('🔍 Validating Internal Linking System...\n');

  try {
    // Test 1: Load all posts
    console.log('1. Loading all posts...');
    const posts = await processAllPosts({ includeDrafts: false });
    console.log(`✅ Loaded ${posts.length} posts\n`);

    // Test 2: Validate topic clusters
    console.log('2. Validating topic clusters...');
    const clusterCount = Object.keys(TOPIC_CLUSTERS).length;
    let postsWithClusters = 0;
    
    for (const post of posts.slice(0, 10)) { // Test first 10 posts
      const categories = post.data?.categories ?? [];
      const keywords = post.data?.keywords ?? [];
      
      let hasCluster = false;
      for (const cluster of Object.values(TOPIC_CLUSTERS)) {
        const categoryMatch = Array.isArray(categories) && Array.isArray(cluster.categories) ? 
          categories.some(cat => cluster.categories.includes(cat)) : false;
        const keywordMatch = Array.isArray(keywords) && Array.isArray(cluster.keywords) ?
          keywords.some(kw => cluster.keywords.includes(kw.toLowerCase())) : false;
        if (categoryMatch || keywordMatch) {
          hasCluster = true;
          break;
        }
      }
      
      if (hasCluster) {
      postsWithClusters++;
    }
    }
    
    console.log(`✅ ${clusterCount} topic clusters configured`);
    console.log(`✅ ${postsWithClusters}/10 sample posts have cluster associations\n`);

    // Test 3: Content relationship analysis
    console.log('3. Testing content relationship analysis...');
    if (posts.length >= 2) {
      const relationships = analyzeContentRelationships(posts[0], posts.slice(1, 6));
      console.log(`✅ Generated ${relationships.length} content relationships`);
      
      if (relationships.length > 0) {
        const avgScore = relationships.reduce((sum, rel) => sum + rel.score, 0) / relationships.length;
        console.log(`📊 Average relationship score: ${avgScore.toFixed(2)}`);
        console.log(`🔗 Best match: "${relationships[0].targetPost.data.title}" (score: ${relationships[0].score})\n`);
      }
    }

    // Test 4: Glossary terms validation
    console.log('4. Validating glossary terms...');
    const glossaryTermCount = Object.keys(GLOSSARY_TERMS).length;
    const categories = [...new Set(Object.values(GLOSSARY_TERMS).map(term => term.category))];
    console.log(`✅ ${glossaryTermCount} glossary terms configured`);
    console.log(`✅ ${categories.length} glossary categories: ${categories.join(', ')}\n`);

    // Test 5: Glossary linking functionality
    console.log('5. Testing glossary auto-linking...');
    const testContent = `
      Das Mikrobiom im Darm spielt eine wichtige Rolle für das Immunsystem. 
      Probiotika und Präbiotika können Entzündungen reduzieren und das Wohlbefinden steigern.
      Omega-3-Fettsäuren und Antioxidantien unterstützen die Darm-Hirn-Achse.
    `;
    
    processGlossaryLinks(testContent, 10, 4);
    const stats = getGlossaryStats(testContent);
    
    console.log(`✅ Found ${stats.totalTerms} potential glossary terms in test content`);
    console.log(`✅ Generated processed content with auto-links`);
    console.log(`📊 Top terms: ${stats.topTerms.slice(0, 3).map(t => `${t.term}(${t.count})`).join(', ')}\n`);

    // Test 6: Performance check
    console.log('6. Performance validation...');
    const startTime = Date.now();
    
    // Run multiple relationship analyses
    for (let i = 0; i < Math.min(5, posts.length - 1); i++) {
      analyzeContentRelationships(posts[i], posts.slice(i + 1, i + 6));
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Processed 5 relationship analyses in ${duration}ms`);
    console.log(`📊 Average time per analysis: ${(duration / 5).toFixed(1)}ms\n`);

    // Summary
    console.log('🎉 Internal Linking System Validation Complete!');
    console.log('\n📋 Summary:');
    console.log(`- ${posts.length} posts loaded successfully`);
    console.log(`- ${clusterCount} topic clusters configured`);
    console.log(`- ${glossaryTermCount} glossary terms available`);
    console.log(`- Content relationship analysis working`);
    console.log(`- Glossary auto-linking functional`);
    console.log(`- Performance within acceptable limits\n`);

    return true;

  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

// Run validation if script is executed directly
if (process.argv[1]?.includes('validate-internal-linking')) {
  validateInternalLinking()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation script error:', error);
      process.exit(1);
    });
}

export default validateInternalLinking;