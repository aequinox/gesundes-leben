package images

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/config"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/converter"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/models"
)

// Downloader handles image downloads
type Downloader struct {
	config     *config.Config
	httpClient *http.Client
	stats      DownloadStats
	mu         sync.Mutex
}

// DownloadStats tracks download statistics
type DownloadStats struct {
	Downloaded int
	Failed     int
	Skipped    int
	TotalBytes int64
}

// New creates a new image downloader
func New(cfg *config.Config) *Downloader {
	return &Downloader{
		config: cfg,
		httpClient: &http.Client{
			Timeout: cfg.Timeout,
		},
		stats: DownloadStats{},
	}
}

// ProcessPost processes all images for a post
func (d *Downloader) ProcessPost(post *models.Post, outputDir string) error {
	if !d.config.DownloadImages {
		return nil
	}

	// Create images directory
	imagesDir := filepath.Join(outputDir, "images")
	if err := os.MkdirAll(imagesDir, 0755); err != nil {
		return fmt.Errorf("failed to create images directory: %w", err)
	}

	// Process hero image
	if post.HeroImage != nil && d.config.DownloadAttached {
		if err := d.downloadImage(post.HeroImage, imagesDir); err != nil {
			// Log error but continue
			d.recordFailure()
		}
	}

	// Process content images
	if d.config.DownloadScraped {
		contentImages := converter.ExtractImages(post.Content)
		for _, img := range contentImages {
			imgRef := &models.ImageRef{
				URL:      img.URL,
				Alt:      img.Alt,
				Position: img.Position,
			}
			if err := d.downloadImage(imgRef, imagesDir); err != nil {
				// Log error but continue
				d.recordFailure()
			} else {
				post.Images = append(post.Images, *imgRef)
			}
		}
	}

	return nil
}

// downloadImage downloads a single image
func (d *Downloader) downloadImage(img *models.ImageRef, outputDir string) error {
	if img.URL == "" {
		return fmt.Errorf("empty image URL")
	}

	// Normalize URL
	url := img.URL
	if strings.HasPrefix(url, "//") {
		url = "https:" + url
	} else if !strings.HasPrefix(url, "http") {
		if d.config.ImageBaseURL != "" {
			url = d.config.ImageBaseURL + url
		} else {
			return fmt.Errorf("relative URL without base URL: %s", url)
		}
	}

	// Extract filename
	filename := extractFilename(url)
	if filename == "" {
		filename = fmt.Sprintf("image-%s.jpg", time.Now().Format("20060102-150405"))
	}

	// Set local path
	localPath := filepath.Join(outputDir, filename)
	img.LocalPath = "./images/" + filename
	img.Variable = converter.ImageURLToVariable(filename)

	// Skip if already exists and not forcing
	if _, err := os.Stat(localPath); err == nil && !d.config.Force {
		d.recordSkip()
		img.Downloaded = true
		return nil
	}

	// Download the image
	if err := d.download(url, localPath); err != nil {
		return fmt.Errorf("failed to download %s: %w", url, err)
	}

	img.Downloaded = true
	d.recordSuccess()

	return nil
}

// download performs the actual HTTP download
func (d *Downloader) download(url, dest string) error {
	resp, err := d.httpClient.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}

	// Create output file
	out, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer out.Close()

	// Copy data
	written, err := io.Copy(out, resp.Body)
	if err != nil {
		return err
	}

	d.recordBytes(written)

	return nil
}

// extractFilename extracts filename from URL
func extractFilename(url string) string {
	// Remove query parameters
	if idx := strings.Index(url, "?"); idx != -1 {
		url = url[:idx]
	}

	// Get last path component
	parts := strings.Split(url, "/")
	if len(parts) == 0 {
		return ""
	}

	filename := parts[len(parts)-1]

	// Validate extension
	validExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
	hasValidExt := false
	for _, ext := range validExts {
		if strings.HasSuffix(strings.ToLower(filename), ext) {
			hasValidExt = true
			break
		}
	}

	if !hasValidExt {
		filename += ".jpg"
	}

	return filename
}

// recordSuccess records a successful download
func (d *Downloader) recordSuccess() {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.stats.Downloaded++
}

// recordFailure records a failed download
func (d *Downloader) recordFailure() {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.stats.Failed++
}

// recordSkip records a skipped download
func (d *Downloader) recordSkip() {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.stats.Skipped++
}

// recordBytes records downloaded bytes
func (d *Downloader) recordBytes(bytes int64) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.stats.TotalBytes += bytes
}

// GetStats returns download statistics
func (d *Downloader) GetStats() DownloadStats {
	d.mu.Lock()
	defer d.mu.Unlock()
	return d.stats
}

// GenerateImports generates import statements for images
func GenerateImports(post *models.Post) string {
	var imports []string

	// Always import Image component
	imports = append(imports, `import Image from "@/components/elements/Image.astro";`)

	// Add hero image import
	if post.HeroImage != nil && post.HeroImage.Downloaded {
		imports = append(imports, fmt.Sprintf("import %s from \"%s\";",
			post.HeroImage.Variable, post.HeroImage.LocalPath))
	}

	// Add content image imports
	seen := make(map[string]bool)
	for _, img := range post.Images {
		if img.Downloaded && !seen[img.Variable] {
			imports = append(imports, fmt.Sprintf("import %s from \"%s\";",
				img.Variable, img.LocalPath))
			seen[img.Variable] = true
		}
	}

	if len(imports) <= 1 {
		return ""
	}

	return strings.Join(imports, "\n")
}
