package frontmatter

import (
	"fmt"
	"strings"
	"time"

	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/config"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/models"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/parser"
	"gopkg.in/yaml.v3"
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
		ID:          fmt.Sprintf("%d", post.RawItem.PostID),
		Title:       post.Title,
		Author:      g.getAuthor(post),
		PubDatetime: post.PubDate.Format(time.RFC3339),
		ModDatetime: post.ModDate.Format(time.RFC3339),
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
	if post.HeroImage != nil {
		fm.HeroImage = &models.HeroImage{
			Src: post.HeroImage.LocalPath,
			Alt: post.HeroImage.Alt,
		}
	}

	return fm, nil
}

// ToYAML converts frontmatter to YAML string
func (g *Generator) ToYAML(fm *models.Frontmatter) (string, error) {
	data, err := yaml.Marshal(fm)
	if err != nil {
		return "", fmt.Errorf("failed to marshal frontmatter: %w", err)
	}

	return string(data), nil
}

// getAuthor determines the author identifier
func (g *Generator) getAuthor(post *models.Post) string {
	if post.RawItem.Creator != "" {
		// Check for author mapping
		return g.config.GetAuthor(post.RawItem.Creator)
	}
	return "healthy-life-author"
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
	// Simple HTML stripping - can be enhanced with goquery if needed
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

	// Extract keywords
	post.Keywords = parser.ExtractKeywords(post.Content, 10)

	// Determine group
	post.Group = parser.DetermineGroup(post.Title, post.Content)

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
