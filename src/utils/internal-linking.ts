/**
 * Internal Linking Utility Functions
 *
 * Advanced SEO-optimized internal linking system for the health blog.
 * Provides intelligent content relationship analysis, topic clustering,
 * and contextual link suggestions based on content analysis.
 */

import { topN, unique } from "./linking/helpers";
import { LinkScorer } from "./linking/scoring";
import { logger } from "./logger";
import type { Post } from "./types";

/**
 * Topic clusters identified from content audit
 */
const TOPIC_CLUSTERS = {
  "mentale-gesundheit": {
    name: "Mentale Gesundheit & Psyche",
    keywords: [
      "depression",
      "angst",
      "stress",
      "mental",
      "psyche",
      "gefühle",
      "emotionen",
      "resilienz",
      "achtsamkeit",
      "meditation",
    ],
    pillarPost: "2024-10-18-17-mentale-blockaden-die-erfolg-verhindern",
    supportingCategories: [
      "Mentale Gesundheit",
      "Persönlichkeitsentwicklung",
      "Stressbewältigung",
    ],
  },
  "ernaehrung-nahrungsergaenzung": {
    name: "Ernährung & Nahrungsergänzung",
    keywords: [
      "ernährung",
      "nahrung",
      "lebensmittel",
      "superfood",
      "antioxidantien",
      "entzündung",
      "diet",
      "kalorien",
    ],
    pillarPost: "2025-05-06-top-entzuendungshemmende-lebensmittel",
    supportingCategories: ["Ernährung", "Superfoods", "Nahrungsergänzung"],
  },
  "immunsystem-gesundheit": {
    name: "Immunsystem & Gesundheit",
    keywords: [
      "immunsystem",
      "immunität",
      "antiviral",
      "infektion",
      "abwehr",
      "widerstand",
      "gesundheit",
    ],
    pillarPost: "2023-08-14-top-lebensmittel-fuers-immunsystems",
    supportingCategories: ["Immunsystem", "Gesundheitsvorsorge", "Prävention"],
  },
  "darm-mikrobiom": {
    name: "Darm & Mikrobiom",
    keywords: [
      "darm",
      "mikrobiom",
      "probiotika",
      "verdauung",
      "bakterien",
      "stuhlgang",
      "magen",
    ],
    pillarPost: "2024-10-29-die-wissenschaft-der-darm-hirn-achse",
    supportingCategories: ["Darmgesundheit", "Verdauung", "Mikrobiom"],
  },
  "vitamine-mineralstoffe": {
    name: "Vitamine & Mineralstoffe",
    keywords: [
      "vitamin",
      "mineral",
      "nährstoff",
      "mangel",
      "defizit",
      "supplementierung",
      "b12",
      "vitamin-d",
      "vitamin-c",
    ],
    pillarPost: "2025-02-10-18-warnzeichen-fuer-naehrstoffmangel",
    supportingCategories: ["Mikronährstoffe", "Vitamine", "Mineralien"],
  },
} as const;

/**
 * Content relationship scoring weights for internal linking
 * Using shared LinkScorer from linking/scoring module
 */
const linkScorer = new LinkScorer({
  "exact-keyword": 10,
  "partial-keyword": 6,
  category: 5,
  tag: 4,
  cluster: 3,
  author: 1,
});

// Additional weight for recency bonus (not in standard scorer)
const RECENCY_BONUS = 2;

/**
 * Interface for content relationship analysis
 */
interface ContentRelationship {
  targetPost: Post;
  score: number;
  matchReasons: string[];
  suggestedAnchorText: string[];
  linkingContext: "strong" | "moderate" | "weak";
}

/**
 * Interface for topic cluster analysis
 */
interface TopicClusterAnalysis {
  clusterId: keyof typeof TOPIC_CLUSTERS;
  clusterName: string;
  posts: Post[];
  pillarPost?: Post;
  supportingPosts: Post[];
  internalLinkOpportunities: ContentRelationship[];
}

/**
 * Analyzes content relationships between posts for intelligent internal linking
 */
function analyzeContentRelationships(
  sourcePost: Post,
  candidatePosts: Post[],
  maxSuggestions: number = 5
): ContentRelationship[] {
  const relationships: ContentRelationship[] = [];

  // Remove source post from candidates and filter out any undefined posts
  const filteredCandidates = candidatePosts.filter(
    post => post?.id && sourcePost?.id && post.id !== sourcePost.id
  );

  for (const candidatePost of filteredCandidates) {
    const relationship = calculateContentRelationship(
      sourcePost,
      candidatePost
    );

    if (relationship.score > 0) {
      relationships.push(relationship);
    }
  }

  // Sort by score and return top suggestions using helper
  return topN(relationships, maxSuggestions, rel => rel.score);
}

/**
 * Calculates relationship score between two posts
 */
function calculateContentRelationship(
  sourcePost: Post,
  targetPost: Post
): ContentRelationship {
  let score = 0;
  const matchReasons: string[] = [];
  const suggestedAnchorText: string[] = [];

  // Extract content data
  const _sourceTitle = sourcePost.data.title.toLowerCase();
  const targetTitle = targetPost.data.title.toLowerCase();
  const sourceCategories = sourcePost.data.categories || [];
  const targetCategories = targetPost.data.categories || [];
  const sourceTags = sourcePost.data.tags || [];
  const targetTags = targetPost.data.tags || [];
  const sourceKeywords = sourcePost.data.keywords || [];
  const targetKeywords = targetPost.data.keywords || [];

  // 1. Keyword matching (highest priority)
  for (const keyword of sourceKeywords) {
    const keywordLower = keyword.toLowerCase();

    // Exact keyword match in target
    if (
      targetKeywords.some(k => k.toLowerCase() === keywordLower) ||
      targetTitle.includes(keywordLower)
    ) {
      score += linkScorer.scoreMatch("exact-keyword");
      matchReasons.push(`Exact keyword match: ${keyword}`);
      suggestedAnchorText.push(keyword);
    }

    // Partial keyword match
    else if (
      targetTitle.includes(keywordLower.split(" ")[0]) ||
      targetKeywords.some(k =>
        k.toLowerCase().includes(keywordLower.split(" ")[0])
      )
    ) {
      score += linkScorer.scoreMatch("partial-keyword");
      matchReasons.push(`Partial keyword match: ${keyword}`);
    }
  }

  // 2. Category matching
  const sharedCategories = sourceCategories.filter((cat: Category) =>
    targetCategories.includes(cat)
  );
  if (sharedCategories.length > 0) {
    score += linkScorer.scoreMatch("category", sharedCategories.length);
    matchReasons.push(`Shared categories: ${sharedCategories.join(", ")}`);

    // Add category-based anchor text suggestions
    sharedCategories.forEach(category => {
      suggestedAnchorText.push(getCategoryAnchorText(category as string));
    });
  }

  // 3. Tag matching
  const sharedTags = sourceTags.filter((tag: Tag) => targetTags.includes(tag));
  if (sharedTags.length > 0) {
    score += linkScorer.scoreMatch("tag", sharedTags.length);
    matchReasons.push(`Shared tags: ${sharedTags.join(", ")}`);
  }

  // 4. Topic cluster matching
  const sourceCluster = identifyTopicCluster(sourcePost);
  const targetCluster = identifyTopicCluster(targetPost);

  if (sourceCluster && targetCluster && sourceCluster === targetCluster) {
    score += linkScorer.scoreMatch("cluster");
    matchReasons.push(
      `Same topic cluster: ${TOPIC_CLUSTERS[sourceCluster].name}`
    );
  }

  // Cross-cluster bonus for related topics (e.g., gut health → mental health)
  if (
    sourceCluster &&
    targetCluster &&
    areRelatedClusters(sourceCluster, targetCluster)
  ) {
    score += linkScorer.scoreMatch("cluster") / 2;
    matchReasons.push(`Related topic clusters`);
  }

  // 5. Author matching (small bonus)
  if (sourcePost.data.author === targetPost.data.author) {
    score += linkScorer.scoreMatch("author");
    matchReasons.push("Same author");
  }

  // 6. Recency bonus (newer posts get slight preference)
  const targetDate = new Date(targetPost.data.pubDatetime);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (targetDate > oneYearAgo) {
    score += RECENCY_BONUS;
    matchReasons.push("Recent content");
  }

  // Generate smart anchor text suggestions
  if (suggestedAnchorText.length === 0) {
    suggestedAnchorText.push(...generateSmartAnchorText(targetPost));
  }

  // Determine linking context strength using shared LinkScorer
  const linkingContext = linkScorer.getLinkingContext(score);

  return {
    targetPost,
    score,
    matchReasons,
    suggestedAnchorText: unique(suggestedAnchorText), // Remove duplicates using helper
    linkingContext,
  };
}

/**
 * Identifies which topic cluster a post belongs to
 */
function identifyTopicCluster(post: Post): keyof typeof TOPIC_CLUSTERS | null {
  const title = post.data.title.toLowerCase();
  const categories = (post.data.categories || []).map((c: string) =>
    c.toLowerCase()
  );
  const keywords = (post.data.keywords || []).map((k: string) =>
    k.toLowerCase()
  );
  const content = [title, ...categories, ...keywords].join(" ");

  let bestMatch: {
    cluster: keyof typeof TOPIC_CLUSTERS;
    score: number;
  } | null = null;

  for (const [clusterId, cluster] of Object.entries(TOPIC_CLUSTERS)) {
    let score = 0;

    // Check keyword matches
    for (const keyword of cluster.keywords) {
      if (content.includes(keyword)) {
        score += 1;
      }
    }

    // Check category matches
    for (const category of cluster.supportingCategories) {
      if (categories.includes(category.toLowerCase())) {
        score += 2; // Categories are stronger indicators
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { cluster: clusterId as keyof typeof TOPIC_CLUSTERS, score };
    }
  }

  return bestMatch?.cluster || null;
}

/**
 * Checks if two topic clusters are related for cross-linking
 */
function areRelatedClusters(
  cluster1: keyof typeof TOPIC_CLUSTERS,
  cluster2: keyof typeof TOPIC_CLUSTERS
): boolean {
  const relatedPairs = [
    ["darm-mikrobiom", "mentale-gesundheit"], // Gut-brain axis
    ["darm-mikrobiom", "immunsystem-gesundheit"], // Gut-immune connection
    ["vitamine-mineralstoffe", "mentale-gesundheit"], // Nutrition-mental health
    ["vitamine-mineralstoffe", "immunsystem-gesundheit"], // Nutrition-immune
    ["ernaehrung-nahrungsergaenzung", "immunsystem-gesundheit"], // Diet-immune
    ["ernaehrung-nahrungsergaenzung", "vitamine-mineralstoffe"], // Diet-nutrients
  ];

  return relatedPairs.some(
    ([c1, c2]) =>
      (cluster1 === c1 && cluster2 === c2) ||
      (cluster1 === c2 && cluster2 === c1)
  );
}

/**
 * Generates smart anchor text suggestions based on post content
 */
function generateSmartAnchorText(post: Post): string[] {
  const title = post.data.title;
  const keywords = post.data.keywords || [];
  const suggestions: string[] = [];

  // 1. Use keywords as anchor text
  keywords.slice(0, 3).forEach(keyword => {
    suggestions.push(keyword);
  });

  // 2. Extract key phrases from title
  const titleWords = title.split(" ");
  if (titleWords.length >= 3) {
    // Take first 3-4 meaningful words
    const keyPhrase = titleWords.slice(0, 4).join(" ");
    suggestions.push(keyPhrase);
  }

  // 3. Add generic but contextual phrases
  if (
    title.toLowerCase().includes("warnzeichen") ||
    title.toLowerCase().includes("symptome")
  ) {
    suggestions.push("Warnzeichen erkennen", "Symptome verstehen");
  }

  if (
    title.toLowerCase().includes("tipps") ||
    title.toLowerCase().includes("strategien")
  ) {
    suggestions.push("praktische Tipps", "bewährte Strategien");
  }

  if (
    title.toLowerCase().includes("gesunde") ||
    title.toLowerCase().includes("gesundheit")
  ) {
    suggestions.push("gesunde Ansätze", "Gesundheit verbessern");
  }

  return suggestions.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Gets appropriate anchor text for categories
 */
function getCategoryAnchorText(category: string): string {
  const categoryMap: Record<string, string> = {
    "Mentale Gesundheit": "mentale Gesundheit stärken",
    Ernährung: "gesunde Ernährung",
    Immunsystem: "Immunsystem stärken",
    Darmgesundheit: "Darmgesundheit verbessern",
    Mikronährstoffe: "wichtige Nährstoffe",
    Vitamine: "essentielle Vitamine",
    Stressbewältigung: "Stress bewältigen",
    Persönlichkeitsentwicklung: "persönlich wachsen",
  };

  return categoryMap[category] || category.toLowerCase();
}

/**
 * Analyzes all posts to create topic cluster analysis
 */
function analyzeTopicClusters(posts: Post[]): TopicClusterAnalysis[] {
  const clusterAnalyses: TopicClusterAnalysis[] = [];

  for (const [clusterId, clusterInfo] of Object.entries(TOPIC_CLUSTERS)) {
    const clusterPosts = posts.filter(
      post => identifyTopicCluster(post) === clusterId
    );

    // Find pillar post
    const pillarPost = clusterPosts.find(
      post => post.slug === clusterInfo.pillarPost
    );

    // Separate supporting posts
    const supportingPosts = clusterPosts.filter(
      post => post.slug !== clusterInfo.pillarPost
    );

    // Find internal linking opportunities within cluster
    const internalLinkOpportunities: ContentRelationship[] = [];

    if (pillarPost) {
      // Get links from pillar to supporting posts
      const pillarLinks = analyzeContentRelationships(
        pillarPost,
        supportingPosts,
        10
      );
      internalLinkOpportunities.push(...pillarLinks);
    }

    clusterAnalyses.push({
      clusterId: clusterId as keyof typeof TOPIC_CLUSTERS,
      clusterName: clusterInfo.name,
      posts: clusterPosts,
      pillarPost,
      supportingPosts,
      internalLinkOpportunities,
    });
  }

  return clusterAnalyses;
}

/**
 * Finds cross-cluster linking opportunities for comprehensive SEO strategy
 */
function findCrossClusterLinkingOpportunities(
  clusters: TopicClusterAnalysis[]
): ContentRelationship[] {
  const crossClusterLinks: ContentRelationship[] = [];

  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      const cluster1 = clusters[i];
      const cluster2 = clusters[j];

      // Check if clusters are related
      if (areRelatedClusters(cluster1.clusterId, cluster2.clusterId)) {
        // Find top posts from each cluster for cross-linking
        const cluster1TopPosts = cluster1.posts.slice(0, 3);
        const cluster2TopPosts = cluster2.posts.slice(0, 3);

        for (const post1 of cluster1TopPosts) {
          const relationships = analyzeContentRelationships(
            post1,
            cluster2TopPosts,
            2
          );
          crossClusterLinks.push(
            ...relationships.filter(rel => rel.score >= 5)
          );
        }
      }
    }
  }

  // Sort by score using topN (no limit, but sorted)
  return topN(crossClusterLinks, crossClusterLinks.length, rel => rel.score);
}

/**
 * Generates a comprehensive internal linking report
 */
function generateInternalLinkingReport(posts: Post[]): {
  topicClusters: TopicClusterAnalysis[];
  crossClusterOpportunities: ContentRelationship[];
  orphanedPosts: Post[];
  highAuthorityPosts: Post[];
} {
  logger.log("Generating comprehensive internal linking report...");

  const topicClusters = analyzeTopicClusters(posts);
  const crossClusterOpportunities =
    findCrossClusterLinkingOpportunities(topicClusters);

  // Find orphaned posts (not in any cluster)
  const clusteredPostIds = new Set(
    topicClusters.flatMap(cluster => cluster.posts.map(post => post.id))
  );
  const orphanedPosts = posts.filter(post => !clusteredPostIds.has(post.id));

  // Identify high authority posts (featured posts or posts with many relationships)
  const highAuthorityPosts = posts.filter(
    post =>
      post.data.featured ||
      (post.data.categories && post.data.categories.length >= 3) ||
      (post.data.keywords && post.data.keywords.length >= 5)
  );

  logger.log(
    `Analysis complete: ${topicClusters.length} clusters, ${crossClusterOpportunities.length} cross-cluster opportunities`
  );

  return {
    topicClusters,
    crossClusterOpportunities,
    orphanedPosts,
    highAuthorityPosts,
  };
}

// Export all functions and constants at the end of the file
export {
  TOPIC_CLUSTERS,
  LINKING_WEIGHTS,
  analyzeContentRelationships,
  identifyTopicCluster,
  analyzeTopicClusters,
  findCrossClusterLinkingOpportunities,
  generateInternalLinkingReport,
};

export type { ContentRelationship, TopicClusterAnalysis };
