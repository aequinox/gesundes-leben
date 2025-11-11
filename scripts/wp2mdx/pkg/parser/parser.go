package parser

import (
	"encoding/xml"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/models"
)

// Parser handles WordPress XML parsing
type Parser struct {
	filename string
}

// New creates a new parser instance
func New(filename string) *Parser {
	return &Parser{
		filename: filename,
	}
}

// Parse reads and parses the WordPress XML file
func (p *Parser) Parse() (*models.WordPressExport, error) {
	data, err := os.ReadFile(p.filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read XML file: %w", err)
	}

	var export models.WordPressExport
	if err := xml.Unmarshal(data, &export); err != nil {
		return nil, fmt.Errorf("failed to parse XML: %w", err)
	}

	return &export, nil
}

// FilterPosts filters posts based on configuration
func FilterPosts(items []models.Item, includeDrafts, includePages, includeTypes bool) []models.Item {
	var filtered []models.Item

	for _, item := range items {
		// Skip attachments, revisions, etc.
		if item.PostType == "attachment" ||
			item.PostType == "revision" ||
			item.PostType == "nav_menu_item" ||
			item.PostType == "custom_css" ||
			item.PostType == "customize_changeset" {
			continue
		}

		// Skip trash
		if item.Status == "trash" {
			continue
		}

		// Handle drafts
		if item.Status == "draft" && !includeDrafts {
			continue
		}

		// Handle pages
		if item.PostType == "page" && !includePages {
			continue
		}

		// Handle custom post types
		if item.PostType != "post" && item.PostType != "page" && !includeTypes {
			continue
		}

		filtered = append(filtered, item)
	}

	return filtered
}

// ParseDate parses various WordPress date formats
func ParseDate(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Now(), nil
	}

	formats := []string{
		time.RFC1123Z,
		time.RFC1123,
		time.RFC3339,
		"2006-01-02 15:04:05",
		"Mon, 02 Jan 2006 15:04:05 -0700",
		"Mon, 02 Jan 2006 15:04:05 MST",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}

// GetPostMeta retrieves a specific post meta value
func GetPostMeta(item *models.Item, key string) string {
	for _, meta := range item.PostMeta {
		if meta.Key == key {
			return meta.Value
		}
	}
	return ""
}

// GetCategories extracts categories from an item
func GetCategories(item *models.Item) []string {
	var categories []string
	for _, cat := range item.Categories {
		if cat.Domain == "category" {
			categories = append(categories, cat.Value)
		}
	}
	return categories
}

// GetTags extracts tags from an item
func GetTags(item *models.Item) []string {
	var tags []string
	for _, cat := range item.Categories {
		if cat.Domain == "post_tag" {
			tags = append(tags, cat.Value)
		}
	}
	return tags
}

// GenerateSlug creates a URL-friendly slug from a title
func GenerateSlug(title string) string {
	slug := strings.ToLower(title)

	// Replace German umlauts
	replacements := map[string]string{
		"ä": "ae", "ö": "oe", "ü": "ue",
		"Ä": "ae", "Ö": "oe", "Ü": "ue",
		"ß": "ss",
	}

	for old, new := range replacements {
		slug = strings.ReplaceAll(slug, old, new)
	}

	// Remove special characters
	slug = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' || r == ' ' {
			return r
		}
		return -1
	}, slug)

	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove multiple consecutive hyphens
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}

	// Trim hyphens
	slug = strings.Trim(slug, "-")

	return slug
}

// ExtractKeywords extracts keywords from content
func ExtractKeywords(content string, maxKeywords int) []string {
	// Simple keyword extraction - can be enhanced
	words := strings.Fields(content)
	wordCount := make(map[string]int)

	// Common German stop words
	stopWords := map[string]bool{
		"der": true, "die": true, "das": true, "und": true, "ist": true,
		"in": true, "zu": true, "den": true, "von": true, "mit": true,
		"ein": true, "eine": true, "für": true, "auf": true, "des": true,
		"sich": true, "werden": true, "dem": true, "nicht": true, "hat": true,
		"im": true, "am": true, "an": true, "als": true, "auch": true,
	}

	for _, word := range words {
		word = strings.ToLower(strings.Trim(word, ".,!?;:()[]{}\"'"))
		if len(word) > 3 && !stopWords[word] {
			wordCount[word]++
		}
	}

	// Sort by frequency (simplified - just get the top ones)
	var keywords []string
	for word := range wordCount {
		if len(keywords) < maxKeywords {
			keywords = append(keywords, word)
		}
	}

	return keywords
}

// DetermineGroup determines the post group based on content
func DetermineGroup(title, content string) string {
	titleLower := strings.ToLower(title)
	contentLower := strings.ToLower(content)

	// Check for "kontra" indicators (warnings, dangers, risks)
	kontraWords := []string{"gefahr", "risiko", "warnung", "vorsicht", "nachteil", "problem", "schaden"}
	for _, word := range kontraWords {
		if strings.Contains(titleLower, word) || strings.Contains(contentLower[:min(500, len(contentLower))], word) {
			return "kontra"
		}
	}

	// Check for "fragezeiten" indicators (questions, FAQ)
	if strings.Contains(titleLower, "?") || strings.Contains(titleLower, "frage") || strings.Contains(titleLower, "warum") {
		return "fragezeiten"
	}

	// Default to "pro" (positive, tips, benefits)
	return "pro"
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// GetFeaturedImageID gets the featured image ID from post meta
func GetFeaturedImageID(item *models.Item) string {
	return GetPostMeta(item, "_thumbnail_id")
}

// FindAttachmentByID finds an attachment item by ID
func FindAttachmentByID(items []models.Item, id string) *models.Item {
	for i := range items {
		if items[i].PostType == "attachment" && fmt.Sprintf("%d", items[i].PostID) == id {
			return &items[i]
		}
	}
	return nil
}

// SanitizeFilename removes invalid characters from filenames
func SanitizeFilename(name string) string {
	// Remove or replace invalid filename characters
	invalid := []string{"/", "\\", ":", "*", "?", "\"", "<", ">", "|"}
	result := name
	for _, char := range invalid {
		result = strings.ReplaceAll(result, char, "-")
	}
	return result
}
