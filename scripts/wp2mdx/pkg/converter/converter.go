package converter

import (
	"fmt"
	"regexp"
	"strings"

	md "github.com/JohannesKaufmann/html-to-markdown"
	"github.com/PuerkitoBio/goquery"
)

// Converter handles HTML to Markdown conversion
type Converter struct {
	converter *md.Converter
}

// New creates a new HTML to Markdown converter
func New() *Converter {
	converter := md.NewConverter("", true, nil)

	// Add custom rules
	addCustomRules(converter)

	return &Converter{
		converter: converter,
	}
}

// Convert converts HTML content to Markdown
func (c *Converter) Convert(html string) (string, error) {
	markdown, err := c.converter.ConvertString(html)
	if err != nil {
		return "", fmt.Errorf("failed to convert HTML to Markdown: %w", err)
	}

	// Post-process the markdown
	markdown = c.postProcess(markdown)

	return markdown, nil
}

// addCustomRules adds custom conversion rules
func addCustomRules(converter *md.Converter) {
	// Rule for WordPress figures
	converter.AddRules(md.Rule{
		Filter: []string{"figure"},
		Replacement: func(content string, selec *goquery.Selection, options *md.Options) *string {
			// Extract image info
			img := selec.Find("img")
			src, _ := img.Attr("src")
			alt, _ := img.Attr("alt")

			// Check for alignment class
			position := "center"
			if selec.HasClass("alignright") {
				position = "right"
			} else if selec.HasClass("alignleft") {
				position = "left"
			}

			// Get caption if exists
			caption := selec.Find("figcaption").Text()

			// Create markdown image reference
			// This will be replaced with Astro Image component later
			result := fmt.Sprintf("![%s](%s){position=%s}", alt, src, position)
			if caption != "" {
				result += fmt.Sprintf("\n*%s*", caption)
			}

			return &result
		},
	})

	// Rule for WordPress blocks
	converter.AddRules(md.Rule{
		Filter: []string{"div"},
		Replacement: func(content string, selec *goquery.Selection, options *md.Options) *string {
			class, _ := selec.Attr("class")

			// Handle WordPress blocks
			if strings.Contains(class, "wp-block") {
				// Just return the content, stripping the wrapper
				return &content
			}

			return &content
		},
	})

	// Rule for blockquotes (for "Therapeuten Tipp")
	converter.AddRules(md.Rule{
		Filter: []string{"blockquote"},
		Replacement: func(content string, selec *goquery.Selection, options *md.Options) *string {
			// Convert to Astro Blockquote component
			result := fmt.Sprintf("\n<Blockquote>\n%s\n</Blockquote>\n", strings.TrimSpace(content))
			return &result
		},
	})
}

// postProcess cleans up and enhances the converted Markdown
func (c *Converter) postProcess(markdown string) string {
	// Remove excessive blank lines
	re := regexp.MustCompile(`\n{3,}`)
	markdown = re.ReplaceAllString(markdown, "\n\n")

	// Clean up list formatting
	markdown = cleanLists(markdown)

	// Fix heading spacing
	markdown = fixHeadings(markdown)

	// Remove WordPress comments
	wpCommentRe := regexp.MustCompile(`<!--.*?-->`)
	markdown = wpCommentRe.ReplaceAllString(markdown, "")

	return strings.TrimSpace(markdown)
}

// cleanLists improves list formatting
func cleanLists(markdown string) string {
	lines := strings.Split(markdown, "\n")
	var result []string

	inList := false
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)

		// Check if this is a list item
		isListItem := strings.HasPrefix(trimmed, "- ") ||
			strings.HasPrefix(trimmed, "* ") ||
			regexp.MustCompile(`^\d+\. `).MatchString(trimmed)

		if isListItem {
			if !inList && i > 0 {
				// Add blank line before list starts
				result = append(result, "")
			}
			inList = true
			result = append(result, line)
		} else {
			if inList && trimmed != "" {
				// Add blank line after list ends
				result = append(result, "")
			}
			inList = false
			result = append(result, line)
		}
	}

	return strings.Join(result, "\n")
}

// fixHeadings ensures proper spacing around headings
func fixHeadings(markdown string) string {
	lines := strings.Split(markdown, "\n")
	var result []string

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)

		// Check if this is a heading
		if strings.HasPrefix(trimmed, "#") {
			// Add blank line before heading (unless it's the first line)
			if i > 0 && result[len(result)-1] != "" {
				result = append(result, "")
			}
			result = append(result, line)
			// Blank line after heading will be handled by the next iteration
		} else {
			result = append(result, line)
		}
	}

	return strings.Join(result, "\n")
}

// ExtractImages finds all image references in HTML
func ExtractImages(html string) []ImageInfo {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return nil
	}

	var images []ImageInfo
	seen := make(map[string]bool)

	doc.Find("img").Each(func(i int, s *goquery.Selection) {
		src, exists := s.Attr("src")
		if !exists || seen[src] {
			return
		}

		alt, _ := s.Attr("alt")

		// Determine position from parent figure element
		position := "center"
		parent := s.Parent()
		if parent.Is("figure") {
			if parent.HasClass("alignright") {
				position = "right"
			} else if parent.HasClass("alignleft") {
				position = "left"
			}
		}

		images = append(images, ImageInfo{
			URL:      src,
			Alt:      alt,
			Position: position,
		})

		seen[src] = true
	})

	return images
}

// ImageInfo contains information about an extracted image
type ImageInfo struct {
	URL      string
	Alt      string
	Position string
}

// ConvertToImageComponent converts image markdown to Astro Image component
func ConvertToImageComponent(markdown string, images map[string]string) string {
	// Replace markdown images with Astro Image components
	re := regexp.MustCompile(`!\[(.*?)\]\((.*?)\)(?:\{position=(.*?)\})?`)

	markdown = re.ReplaceAllStringFunc(markdown, func(match string) string {
		matches := re.FindStringSubmatch(match)
		if len(matches) < 3 {
			return match
		}

		alt := matches[1]
		src := matches[2]
		position := "center"
		if len(matches) > 3 && matches[3] != "" {
			position = matches[3]
		}

		// Get the variable name for this image
		varName, ok := images[src]
		if !ok {
			// If we don't have a mapping, keep the original
			return match
		}

		// Generate Astro Image component
		return fmt.Sprintf("\n<Image\n  src={%s}\n  alt=\"%s\"\n  position=\"%s\"\n/>\n", varName, alt, position)
	})

	return markdown
}

// ImageURLToVariable converts an image filename to a camelCase variable name
func ImageURLToVariable(url string) string {
	// Extract filename from URL
	parts := strings.Split(url, "/")
	filename := parts[len(parts)-1]

	// Remove extension
	if idx := strings.LastIndex(filename, "."); idx != -1 {
		filename = filename[:idx]
	}

	// Convert to camelCase
	words := strings.FieldsFunc(filename, func(r rune) bool {
		return r == '-' || r == '_' || r == ' '
	})

	if len(words) == 0 {
		return "image"
	}

	// First word lowercase, rest capitalized
	result := strings.ToLower(words[0])
	for i := 1; i < len(words); i++ {
		if len(words[i]) > 0 {
			result += strings.ToUpper(words[i][:1]) + strings.ToLower(words[i][1:])
		}
	}

	return result
}
