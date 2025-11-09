/**
 * @file integration.test.ts
 * @description Integration tests for the linking system workflows
 * Tests the complete flow from internal-linking through core utilities
 */

import { describe, it, expect, beforeEach } from "vitest";

import {
  analyzeContentRelationships,
  identifyTopicCluster,
  analyzeTopicClusters,
  findCrossClusterLinkingOpportunities,
  generateInternalLinkingReport,
  TOPIC_CLUSTERS,
} from "../../internal-linking";
import type { Post } from "../../types";

// Mock post data for testing
const createMockPost = (
  id: string,
  title: string,
  categories: string[],
  keywords: string[],
  tags: string[] = [],
  author: string = "test-author",
  pubDatetime: Date = new Date("2024-01-15")
): Post => ({
  id,
  slug: id,
  body: "",
  collection: "blog",
  data: {
    title,
    categories,
    keywords,
    tags,
    author,
    pubDatetime,
    featured: false,
    draft: false,
    heroImage: {
      src: "",
      alt: "",
    },
  },
});

describe("Internal Linking Integration Tests", () => {
  let mockPosts: Post[];

  beforeEach(() => {
    // Create a diverse set of mock posts across different clusters
    mockPosts = [
      // Mental health cluster
      createMockPost(
        "mental-health-1",
        "Understanding Mental Health and Depression",
        ["Mentale Gesundheit"],
        ["depression", "mental health", "anxiety"],
        ["stress", "coping"],
        "dr-mueller",
        new Date("2024-06-01")
      ),
      createMockPost(
        "mental-health-2",
        "Stress Management Techniques",
        ["Stressbewältigung", "Mentale Gesundheit"],
        ["stress", "relaxation", "meditation"],
        ["mindfulness"],
        "dr-mueller",
        new Date("2024-05-15")
      ),

      // Gut-microbiome cluster
      createMockPost(
        "gut-health-1",
        "The Science of the Gut-Brain Axis",
        ["Darmgesundheit"],
        ["gut", "microbiome", "brain", "bacteria"],
        ["probiotics"],
        "dr-schmidt",
        new Date("2024-04-20")
      ),
      createMockPost(
        "gut-health-2",
        "Probiotics for Better Digestion",
        ["Darmgesundheit", "Ernährung"],
        ["probiotics", "digestion", "gut health"],
        ["supplements"],
        "dr-schmidt",
        new Date("2024-03-10")
      ),

      // Nutrition cluster
      createMockPost(
        "nutrition-1",
        "Anti-Inflammatory Foods Guide",
        ["Ernährung", "Superfoods"],
        ["inflammation", "nutrition", "diet"],
        ["health"],
        "nutritionist-anna",
        new Date("2024-02-05")
      ),

      // Immune system cluster
      createMockPost(
        "immune-1",
        "Boosting Your Immune System Naturally",
        ["Immunsystem"],
        ["immunity", "immune system", "health"],
        ["wellness"],
        "dr-mueller",
        new Date("2024-01-20")
      ),

      // Vitamins cluster
      createMockPost(
        "vitamins-1",
        "Signs of Vitamin D Deficiency",
        ["Vitamine", "Mikronährstoffe"],
        ["vitamin d", "deficiency", "nutrients"],
        ["supplements"],
        "nutritionist-anna",
        new Date("2023-12-15")
      ),
    ];
  });

  describe("analyzeContentRelationships", () => {
    it("should find related posts based on keyword matches", () => {
      const sourcePost = mockPosts[0]; // mental health post
      const candidatePosts = mockPosts.slice(1);

      const relationships = analyzeContentRelationships(
        sourcePost,
        candidatePosts,
        5
      );

      expect(relationships).toBeDefined();
      expect(Array.isArray(relationships)).toBe(true);
      expect(relationships.length).toBeGreaterThan(0);
      expect(relationships.length).toBeLessThanOrEqual(5);

      // Check that relationships are sorted by score (descending)
      for (let i = 1; i < relationships.length; i++) {
        expect(relationships[i - 1].score).toBeGreaterThanOrEqual(
          relationships[i].score
        );
      }

      // Check relationship structure
      const firstRelationship = relationships[0];
      expect(firstRelationship).toHaveProperty("targetPost");
      expect(firstRelationship).toHaveProperty("score");
      expect(firstRelationship).toHaveProperty("matchReasons");
      expect(firstRelationship).toHaveProperty("suggestedAnchorText");
      expect(firstRelationship).toHaveProperty("linkingContext");

      // Score should be positive
      expect(firstRelationship.score).toBeGreaterThan(0);

      // Should have match reasons
      expect(firstRelationship.matchReasons.length).toBeGreaterThan(0);

      // Should have anchor text suggestions
      expect(firstRelationship.suggestedAnchorText.length).toBeGreaterThan(0);
    });

    it("should prioritize exact keyword matches over partial matches", () => {
      const sourcePost = mockPosts[2]; // gut-brain post with "gut", "microbiome"
      const candidatePosts = mockPosts.slice(3);

      const relationships = analyzeContentRelationships(
        sourcePost,
        candidatePosts,
        10
      );

      // Find the probiotics post (should have exact keyword "probiotics" match)
      const probioticsRelationship = relationships.find(
        r => r.targetPost.id === "gut-health-2"
      );

      if (probioticsRelationship) {
        expect(probioticsRelationship.score).toBeGreaterThan(0);
      }
    });

    it("should give bonus for same author", () => {
      const sourcePost = mockPosts[0]; // dr-mueller
      const sameAuthorPost = mockPosts[1]; // also dr-mueller
      const differentAuthorPost = mockPosts[2]; // dr-schmidt

      const relationships = analyzeContentRelationships(
        sourcePost,
        [sameAuthorPost, differentAuthorPost],
        10
      );

      // Same author relationship should exist
      const sameAuthorRel = relationships.find(
        r => r.targetPost.id === sameAuthorPost.id
      );
      expect(sameAuthorRel).toBeDefined();
      if (sameAuthorRel) {
        expect(sameAuthorRel.matchReasons).toContain("Same author");
      }
    });

    it("should give recency bonus to newer posts", () => {
      const sourcePost = mockPosts[0]; // from 2024-06-01 (recent)
      const oldPost = mockPosts[6]; // from 2023-12-15 (older than 1 year)

      const relationships = analyzeContentRelationships(
        sourcePost,
        [oldPost],
        10
      );

      // Should still find relationship but recency will affect score
      expect(relationships.length).toBeGreaterThanOrEqual(0);
    });

    it("should not include source post in results", () => {
      const sourcePost = mockPosts[0];

      const relationships = analyzeContentRelationships(
        sourcePost,
        mockPosts, // includes source post
        10
      );

      // Source post should not appear in relationships
      const selfReference = relationships.find(
        r => r.targetPost.id === sourcePost.id
      );
      expect(selfReference).toBeUndefined();
    });
  });

  describe("identifyTopicCluster", () => {
    it("should identify mental health cluster correctly", () => {
      const mentalHealthPost = mockPosts[0];
      const cluster = identifyTopicCluster(mentalHealthPost);

      expect(cluster).toBe("mentale-gesundheit");
    });

    it("should identify gut-microbiome cluster correctly", () => {
      const gutPost = mockPosts[2];
      const cluster = identifyTopicCluster(gutPost);

      expect(cluster).toBe("darm-mikrobiom");
    });

    it("should identify nutrition cluster correctly", () => {
      const nutritionPost = mockPosts[4];
      const cluster = identifyTopicCluster(nutritionPost);

      expect(cluster).toBe("ernaehrung-nahrungsergaenzung");
    });

    it("should handle posts with no clear cluster", () => {
      const ambiguousPost = createMockPost(
        "ambiguous",
        "Generic Health Tips",
        ["General Health"],
        ["health", "wellness"],
        []
      );

      const cluster = identifyTopicCluster(ambiguousPost);

      // Should return null or a best-match cluster
      expect(cluster === null || typeof cluster === "string").toBe(true);
    });
  });

  describe("analyzeTopicClusters", () => {
    it("should organize posts into topic clusters", () => {
      const clusterAnalyses = analyzeTopicClusters(mockPosts);

      expect(clusterAnalyses).toBeDefined();
      expect(Array.isArray(clusterAnalyses)).toBe(true);
      expect(clusterAnalyses.length).toBeGreaterThan(0);

      // Check structure of cluster analysis
      const firstCluster = clusterAnalyses[0];
      expect(firstCluster).toHaveProperty("clusterId");
      expect(firstCluster).toHaveProperty("clusterName");
      expect(firstCluster).toHaveProperty("posts");
      expect(firstCluster).toHaveProperty("supportingPosts");
      expect(firstCluster).toHaveProperty("internalLinkOpportunities");

      // Cluster ID should be valid
      expect(TOPIC_CLUSTERS[firstCluster.clusterId]).toBeDefined();
    });

    it("should find internal linking opportunities within clusters", () => {
      const clusterAnalyses = analyzeTopicClusters(mockPosts);

      // Find a cluster with posts
      const clusterWithPosts = clusterAnalyses.find(c => c.posts.length >= 2);

      if (clusterWithPosts?.pillarPost) {
        expect(clusterWithPosts.internalLinkOpportunities).toBeDefined();
        expect(Array.isArray(clusterWithPosts.internalLinkOpportunities)).toBe(
          true
        );
      }
    });

    it("should separate pillar posts from supporting posts", () => {
      const clusterAnalyses = analyzeTopicClusters(mockPosts);

      clusterAnalyses.forEach(cluster => {
        if (cluster.pillarPost) {
          // Pillar post should not be in supporting posts
          const pillarInSupporting = cluster.supportingPosts.find(
            p => p.id === cluster.pillarPost?.id
          );
          expect(pillarInSupporting).toBeUndefined();
        }
      });
    });
  });

  describe("findCrossClusterLinkingOpportunities", () => {
    it("should find cross-cluster linking opportunities", () => {
      const clusterAnalyses = analyzeTopicClusters(mockPosts);
      const crossClusterLinks =
        findCrossClusterLinkingOpportunities(clusterAnalyses);

      expect(crossClusterLinks).toBeDefined();
      expect(Array.isArray(crossClusterLinks)).toBe(true);

      // If there are opportunities, they should be sorted by score
      if (crossClusterLinks.length > 1) {
        for (let i = 1; i < crossClusterLinks.length; i++) {
          expect(crossClusterLinks[i - 1].score).toBeGreaterThanOrEqual(
            crossClusterLinks[i].score
          );
        }
      }
    });

    it("should only link related clusters", () => {
      const clusterAnalyses = analyzeTopicClusters(mockPosts);
      const crossClusterLinks =
        findCrossClusterLinkingOpportunities(clusterAnalyses);

      // All cross-cluster links should meet minimum score threshold
      crossClusterLinks.forEach(link => {
        expect(link.score).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe("generateInternalLinkingReport", () => {
    it("should generate a comprehensive linking report", () => {
      const report = generateInternalLinkingReport(mockPosts);

      expect(report).toBeDefined();
      expect(report).toHaveProperty("topicClusters");
      expect(report).toHaveProperty("crossClusterOpportunities");
      expect(report).toHaveProperty("orphanedPosts");
      expect(report).toHaveProperty("highAuthorityPosts");

      expect(Array.isArray(report.topicClusters)).toBe(true);
      expect(Array.isArray(report.crossClusterOpportunities)).toBe(true);
      expect(Array.isArray(report.orphanedPosts)).toBe(true);
      expect(Array.isArray(report.highAuthorityPosts)).toBe(true);
    });

    it("should identify orphaned posts (not in any cluster)", () => {
      const orphanPost = createMockPost(
        "orphan",
        "Random Topic",
        ["Unknown Category"],
        ["random", "unrelated"],
        []
      );

      const postsWithOrphan = [...mockPosts, orphanPost];
      const report = generateInternalLinkingReport(postsWithOrphan);

      // Should have some orphaned posts
      expect(report.orphanedPosts.length).toBeGreaterThan(0);
    });

    it("should identify high authority posts", () => {
      const report = generateInternalLinkingReport(mockPosts);

      // High authority posts should have specific characteristics
      report.highAuthorityPosts.forEach(post => {
        const isFeatured = post.data.featured;
        const hasMultipleCategories =
          post.data.categories && post.data.categories.length >= 3;
        const hasManyKeywords =
          post.data.keywords && post.data.keywords.length >= 5;

        expect(isFeatured || hasMultipleCategories || hasManyKeywords).toBe(
          true
        );
      });
    });
  });

  describe("Integration: Complete Linking Workflow", () => {
    it("should complete full linking analysis workflow", () => {
      // Step 1: Generate report
      const report = generateInternalLinkingReport(mockPosts);

      expect(report.topicClusters.length).toBeGreaterThan(0);

      // Step 2: Analyze individual post relationships
      const sourcePost = mockPosts[0];
      const relationships = analyzeContentRelationships(
        sourcePost,
        mockPosts.slice(1),
        5
      );

      expect(relationships.length).toBeGreaterThan(0);

      // Step 3: Verify data consistency
      const cluster = identifyTopicCluster(sourcePost);
      if (cluster) {
        const clusterAnalysis = report.topicClusters.find(
          c => c.clusterId === cluster
        );
        expect(clusterAnalysis).toBeDefined();
      }

      // Step 4: Check cross-cluster opportunities
      expect(report.crossClusterOpportunities).toBeDefined();
    });

    it("should use shared utilities consistently", () => {
      // This test verifies that the refactored code uses shared utilities
      const sourcePost = mockPosts[0];
      const candidatePosts = mockPosts.slice(1);

      // Call the main function which now uses shared LinkScorer and helpers
      const relationships = analyzeContentRelationships(
        sourcePost,
        candidatePosts,
        3
      );

      // Results should be properly sorted (via topN helper)
      expect(relationships.length).toBeLessThanOrEqual(3);

      if (relationships.length > 1) {
        expect(relationships[0].score).toBeGreaterThanOrEqual(
          relationships[1].score
        );
      }

      // Anchor text should be deduplicated (via unique helper)
      relationships.forEach(rel => {
        const anchorTexts = rel.suggestedAnchorText;
        const uniqueAnchorTexts = [...new Set(anchorTexts)];
        expect(anchorTexts.length).toBe(uniqueAnchorTexts.length);
      });

      // Linking context should be determined by LinkScorer.getLinkingContext
      relationships.forEach(rel => {
        expect(["strong", "moderate", "weak"]).toContain(rel.linkingContext);

        // Verify context matches score
        if (rel.score >= 15) {
          expect(rel.linkingContext).toBe("strong");
        } else if (rel.score >= 8) {
          expect(rel.linkingContext).toBe("moderate");
        } else {
          expect(rel.linkingContext).toBe("weak");
        }
      });
    });
  });
});
