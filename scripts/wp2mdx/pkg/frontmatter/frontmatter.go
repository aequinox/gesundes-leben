package frontmatter

import (
	"crypto/rand"
	"fmt"
	"strings"
	"time"

	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/config"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/models"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/parser"
)

// Generator generates frontmatter from WordPress posts
type Generator struct {
	config *config.Config
}

// New creates a new frontmatter generator
func New(cfg *config.Config) *Generator {
	return &Generator{
		config: cfg,
	}
}

// Generate creates frontmatter for a post
func (g *Generator) Generate(post *models.Post) (*models.Frontmatter, error) {
	fm := &models.Frontmatter{
		ID:          generateUUID(),
		Title:       post.Title,
		Author:      g.getAuthor(post),
		PubDatetime: formatTimestamp(post.PubDate),
		ModDatetime: formatTimestamp(post.ModDate),
		Description: g.getDescription(post),
		Keywords:    post.Keywords,
		Categories:  g.mapCategories(post.Categories),
		Group:       post.Group,
		Tags:        post.Tags,
		Draft:       post.Draft,
		Featured:    post.Featured,
		Extra:       make(map[string]interface{}),
	}

	// Add hero image if available
	if post.HeroImage != nil && post.HeroImage.LocalPath != "" {
		fm.HeroImage = &models.HeroImage{
			Src: post.HeroImage.LocalPath,
			Alt: post.HeroImage.Alt,
		}
	}

	return fm, nil
}

// ToYAML converts frontmatter to YAML string with proper formatting
func (g *Generator) ToYAML(fm *models.Frontmatter) (string, error) {
	// Build YAML manually for precise control over field order and formatting
	var sb strings.Builder

	// Required fields in order
	sb.WriteString(fmt.Sprintf("id: %q\n", fm.ID))
	sb.WriteString(fmt.Sprintf("title: %q\n", fm.Title))
	sb.WriteString(fmt.Sprintf("author: %q\n", fm.Author))
	sb.WriteString(fmt.Sprintf("pubDatetime: %q\n", fm.PubDatetime))
	sb.WriteString(fmt.Sprintf("modDatetime: %q\n", fm.ModDatetime))
	sb.WriteString(fmt.Sprintf("description: %q\n", fm.Description))

	// Keywords (array)
	if len(fm.Keywords) > 0 {
		sb.WriteString("keywords:\n")
		for _, kw := range fm.Keywords {
			sb.WriteString(fmt.Sprintf("  - %s\n", kw))
		}
	}

	// Categories (array)
	if len(fm.Categories) > 0 {
		sb.WriteString("categories:\n")
		for _, cat := range fm.Categories {
			sb.WriteString(fmt.Sprintf("  - %s\n", cat))
		}
	}

	// Group
	sb.WriteString(fmt.Sprintf("group: %q\n", fm.Group))

	// Tags (array)
	if len(fm.Tags) > 0 {
		sb.WriteString("tags:\n")
		for _, tag := range fm.Tags {
			sb.WriteString(fmt.Sprintf("  - %s\n", tag))
		}
	}

	// Hero image (object)
	if fm.HeroImage != nil {
		sb.WriteString("heroImage:\n")
		sb.WriteString(fmt.Sprintf("  src: %s\n", fm.HeroImage.Src))
		sb.WriteString(fmt.Sprintf("  alt: %q\n", fm.HeroImage.Alt))
	}

	// Booleans
	sb.WriteString(fmt.Sprintf("draft: %t\n", fm.Draft))
	sb.WriteString(fmt.Sprintf("featured: %t\n", fm.Featured))

	// Add any extra fields
	for k, v := range fm.Extra {
		// Simple handling for extra fields
		sb.WriteString(fmt.Sprintf("%s: %v\n", k, v))
	}

	return sb.String(), nil
}

// generateUUID generates a UUID v4
func generateUUID() string {
	b := make([]byte, 16)
	rand.Read(b)

	// Set version (4) and variant bits
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80

	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

// formatTimestamp formats time with milliseconds
func formatTimestamp(t time.Time) string {
	return t.Format("2006-01-02T15:04:05.000Z07:00")
}

// getAuthor determines the author identifier
func (g *Generator) getAuthor(post *models.Post) string {
	if post.RawItem.Creator != "" {
		// Check for author mapping
		mapped := g.config.GetAuthor(post.RawItem.Creator)

		// Apply default mappings for common authors
		if mapped == post.RawItem.Creator {
			// No custom mapping found, try defaults
			return getDefaultAuthorMapping(post.RawItem.Creator)
		}
		return mapped
	}
	return "healthy-life-author"
}

// getDefaultAuthorMapping provides default author slug mappings
func getDefaultAuthorMapping(author string) string {
	defaults := map[string]string{
		"KRenner":    "kai-renner",
		"Kai":        "kai-renner",
		"Sandra":     "sandra-pfeiffer",
		"SPfeiffer":  "sandra-pfeiffer",
		"admin":      "healthy-life-author",
	}

	if mapped, ok := defaults[author]; ok {
		return mapped
	}

	// Convert to slug format: "John Doe" -> "john-doe"
	slug := strings.ToLower(author)
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug
}

// getDescription generates a description from the excerpt or content
func (g *Generator) getDescription(post *models.Post) string {
	if post.Excerpt != "" {
		// Clean up HTML from excerpt
		desc := stripHTML(post.Excerpt)
		if len(desc) > 160 {
			desc = desc[:157] + "..."
		}
		return desc
	}

	// Generate from content
	content := stripHTML(post.Content)
	if len(content) > 160 {
		return content[:157] + "..."
	}

	return content
}

// mapCategories maps WordPress categories to German blog categories
func (g *Generator) mapCategories(categories []string) []string {
	var mapped []string
	seen := make(map[string]bool)

	for _, cat := range categories {
		// Normalize category name
		normalized := strings.ToLower(strings.TrimSpace(cat))

		// Map to German category
		germanCat := g.config.GetCategory(normalized)

		// Avoid duplicates
		if !seen[germanCat] {
			mapped = append(mapped, germanCat)
			seen[germanCat] = true
		}
	}

	// If no categories, add a default
	if len(mapped) == 0 {
		mapped = append(mapped, "Wissenswertes")
	}

	return mapped
}

// stripHTML removes HTML tags from a string
func stripHTML(html string) string {
	result := html

	// Remove HTML tags
	for {
		start := strings.Index(result, "<")
		if start == -1 {
			break
		}
		end := strings.Index(result[start:], ">")
		if end == -1 {
			break
		}
		result = result[:start] + result[start+end+1:]
	}

	// Clean up whitespace
	result = strings.TrimSpace(result)
	result = strings.ReplaceAll(result, "\n", " ")
	result = strings.ReplaceAll(result, "\r", "")

	// Remove multiple spaces
	for strings.Contains(result, "  ") {
		result = strings.ReplaceAll(result, "  ", " ")
	}

	// Decode HTML entities
	result = decodeHTMLEntities(result)

	return result
}

// decodeHTMLEntities decodes common HTML entities
func decodeHTMLEntities(s string) string {
	entities := map[string]string{
		"&nbsp;":   " ",
		"&lt;":     "<",
		"&gt;":     ">",
		"&amp;":    "&",
		"&quot;":   "\"",
		"&#8211;":  "–",
		"&#8212;":  "—",
		"&#8216;":  "'",
		"&#8217;":  "'",
		"&#8220;":  "\"",
		"&#8221;":  "\"",
		"&auml;":   "ä",
		"&ouml;":   "ö",
		"&uuml;":   "ü",
		"&Auml;":   "Ä",
		"&Ouml;":   "Ö",
		"&Uuml;":   "Ü",
		"&szlig;":  "ß",
		"&hellip;": "...",
	}

	result := s
	for entity, replacement := range entities {
		result = strings.ReplaceAll(result, entity, replacement)
	}

	return result
}

// BuildPost builds a complete Post model from a WordPress Item
func (g *Generator) BuildPost(item *models.Item, allItems []models.Item) (*models.Post, error) {
	pubDate, err := parser.ParseDate(item.PubDate)
	if err != nil {
		pubDate = time.Now()
	}

	// Use pub date as mod date if not available
	modDate := pubDate

	post := &models.Post{
		ID:          fmt.Sprintf("%d", item.PostID),
		Title:       item.Title,
		Slug:        item.PostName,
		Content:     item.Content,
		Excerpt:     item.Excerpt,
		PubDate:     pubDate,
		ModDate:     modDate,
		Status:      item.Status,
		Type:        item.PostType,
		Categories:  parser.GetCategories(item),
		Tags:        parser.GetTags(item),
		Draft:       item.Status == "draft",
		Featured:    item.IsSticky == 1,
		RawItem:     item,
		Images:      []models.ImageRef{},
		Frontmatter: make(map[string]interface{}),
	}

	// Generate slug if empty
	if post.Slug == "" {
		post.Slug = parser.GenerateSlug(post.Title)
	}

	// Use tags as keywords (they're more relevant than extracted words)
	if len(post.Tags) > 0 {
		post.Keywords = post.Tags
	} else {
		// Fallback to extraction if no tags
		post.Keywords = parser.ExtractKeywords(post.Content, 10)
	}

	// Determine group - improved logic
	post.Group = determineGroup(post.Title, post.Content, post.Tags)

	// Get author
	post.Author = g.getAuthor(post)

	// Get featured image
	featuredImageID := parser.GetFeaturedImageID(item)
	if featuredImageID != "" {
		attachment := parser.FindAttachmentByID(allItems, featuredImageID)
		if attachment != nil {
			post.HeroImage = &models.ImageRef{
				ID:           featuredImageID,
				URL:          attachment.GUID,
				OriginalName: attachment.PostName,
				Alt:          attachment.Title,
			}
		}
	}

	return post, nil
}

// determineGroup determines the post group with improved logic
func determineGroup(title, content string, tags []string) string {
	titleLower := strings.ToLower(title)
	contentLower := strings.ToLower(content)

	// Check tags first (most reliable)
	for _, tag := range tags {
		tagLower := strings.ToLower(tag)
		if strings.Contains(tagLower, "gefahr") ||
		   strings.Contains(tagLower, "risiko") ||
		   strings.Contains(tagLower, "warnung") {
			return "kontra"
		}
		if strings.Contains(tagLower, "frage") ||
		   strings.Contains(tagLower, "warum") ||
		   strings.Contains(tagLower, "wie") {
			return "fragezeiten"
		}
	}

	// Check for question indicators in title
	if strings.Contains(titleLower, "?") ||
	   strings.Contains(titleLower, "warum") ||
	   strings.Contains(titleLower, "wie") ||
	   strings.Contains(titleLower, "was ist") ||
	   strings.Contains(titleLower, "wieso") {
		return "fragezeiten"
	}

	// Check for "kontra" indicators (warnings, dangers, risks)
	kontraWords := []string{"gefahr", "risiko", "warnung", "vorsicht", "nachteil", "problem", "schaden", "negativ"}
	for _, word := range kontraWords {
		if strings.Contains(titleLower, word) {
			return "kontra"
		}
	}

	// Check first 1000 chars of content for strong kontra indicators
	contentSample := contentLower
	if len(contentSample) > 1000 {
		contentSample = contentSample[:1000]
	}

	kontraCount := 0
	for _, word := range kontraWords {
		kontraCount += strings.Count(contentSample, word)
	}

	if kontraCount >= 3 {
		return "kontra"
	}

	// Default to "pro" (positive, tips, benefits)
	return "pro"
}
