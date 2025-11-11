package writer

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/config"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/converter"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/frontmatter"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/images"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/models"
)

// Writer handles writing MDX files
type Writer struct {
	config    *config.Config
	generator *frontmatter.Generator
	converter *converter.Converter
}

// New creates a new MDX writer
func New(cfg *config.Config) *Writer {
	return &Writer{
		config:    cfg,
		generator: frontmatter.New(cfg),
		converter: converter.New(),
	}
}

// WritePost writes a single post to an MDX file
func (w *Writer) WritePost(post *models.Post) error {
	// Determine output directory for this post
	outputDir, err := w.GetOutputDirectory(post)
	if err != nil {
		return fmt.Errorf("failed to determine output directory: %w", err)
	}

	// Create output directory
	if !w.config.DryRun {
		if err := os.MkdirAll(outputDir, 0755); err != nil {
			return fmt.Errorf("failed to create output directory: %w", err)
		}
	}

	// Generate frontmatter
	fm, err := w.generator.Generate(post)
	if err != nil {
		return fmt.Errorf("failed to generate frontmatter: %w", err)
	}

	// Convert content to Markdown
	markdown, err := w.converter.Convert(post.Content)
	if err != nil {
		return fmt.Errorf("failed to convert content: %w", err)
	}

	// Build image variable map
	imageVars := make(map[string]string)
	if post.HeroImage != nil {
		imageVars[post.HeroImage.URL] = post.HeroImage.Variable
	}
	for _, img := range post.Images {
		imageVars[img.URL] = img.Variable
	}

	// Replace markdown images with Astro Image components
	markdown = converter.ConvertToImageComponent(markdown, imageVars)

	// Generate the complete MDX file
	mdxContent := w.buildMDX(fm, post, markdown)

	// Determine filename
	filename := w.getFilename(post)
	filepath := filepath.Join(outputDir, filename)

	// Write file
	if w.config.DryRun {
		fmt.Printf("[DRY RUN] Would write: %s\n", filepath)
		return nil
	}

	// Check if file exists and we're not forcing
	if _, err := os.Stat(filepath); err == nil && !w.config.Force {
		return fmt.Errorf("file already exists (use --force to overwrite): %s", filepath)
	}

	if err := os.WriteFile(filepath, []byte(mdxContent), 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

// GetOutputDirectory determines the output directory for a post
func (w *Writer) GetOutputDirectory(post *models.Post) (string, error) {
	base := w.config.OutputDir

	// Add year folder if configured
	if w.config.YearFolders {
		year := post.PubDate.Format("2006")
		base = filepath.Join(base, year)
	}

	// Add month folder if configured
	if w.config.MonthFolders {
		if !w.config.YearFolders {
			return "", fmt.Errorf("month folders require year folders to be enabled")
		}
		month := post.PubDate.Format("01")
		base = filepath.Join(base, month)
	}

	// Add post folder if configured
	if w.config.PostFolders {
		folderName := post.Slug
		if w.config.PrefixDate {
			datePrefix := post.PubDate.Format("2006-01-02")
			folderName = datePrefix + "-" + post.Slug
		}
		base = filepath.Join(base, folderName)
	}

	return base, nil
}

// getFilename determines the filename for a post
func (w *Writer) getFilename(post *models.Post) string {
	if w.config.PostFolders {
		// When using post folders, file is always index.mdx
		return "index.mdx"
	}

	// Build filename from slug
	filename := post.Slug

	// Add date prefix if configured
	if w.config.PrefixDate {
		datePrefix := post.PubDate.Format("2006-01-02")
		filename = datePrefix + "-" + filename
	}

	return filename + ".mdx"
}

// buildMDX constructs the complete MDX file content
func (w *Writer) buildMDX(fm *models.Frontmatter, post *models.Post, markdown string) string {
	var sb strings.Builder

	// Write frontmatter
	sb.WriteString("---\n")
	yamlStr, _ := w.generator.ToYAML(fm)
	sb.WriteString(yamlStr)
	sb.WriteString("---\n\n")

	// Write imports
	importsStr := images.GenerateImports(post)
	if importsStr != "" {
		sb.WriteString(importsStr)
		sb.WriteString("\n\n")
	}

	// Write content
	sb.WriteString(markdown)
	sb.WriteString("\n")

	return sb.String()
}

// CleanOutput removes all files from the output directory
func (w *Writer) CleanOutput() error {
	if w.config.DryRun {
		fmt.Printf("[DRY RUN] Would clean: %s\n", w.config.OutputDir)
		return nil
	}

	if _, err := os.Stat(w.config.OutputDir); os.IsNotExist(err) {
		// Directory doesn't exist, nothing to clean
		return nil
	}

	return os.RemoveAll(w.config.OutputDir)
}
