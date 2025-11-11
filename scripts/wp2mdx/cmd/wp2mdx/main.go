package main

import (
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/config"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/frontmatter"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/images"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/models"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/parser"
	"github.com/aequinox/gesundes-leben/wp2mdx/pkg/writer"
	"github.com/schollz/progressbar/v3"
	"github.com/spf13/cobra"
)

var (
	cfg     *config.Config
	version = "1.0.0"
)

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

var rootCmd = &cobra.Command{
	Use:     "wp2mdx",
	Short:   "WordPress XML to MDX converter",
	Long:    "A high-performance tool for converting WordPress XML exports to MDX files for the Gesundes Leben blog.",
	Version: version,
}

var convertCmd = &cobra.Command{
	Use:   "convert",
	Short: "Convert WordPress XML to MDX files",
	Long:  "Converts a WordPress XML export file to MDX files with frontmatter and image processing.",
	RunE:  runConvert,
}

var validateCmd = &cobra.Command{
	Use:   "validate",
	Short: "Validate WordPress XML file",
	Long:  "Validates the structure of a WordPress XML export file.",
	RunE:  runValidate,
}

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List posts in WordPress XML file",
	Long:  "Lists all posts found in the WordPress XML export file.",
	RunE:  runList,
}

var categoriesCmd = &cobra.Command{
	Use:   "categories",
	Short: "Show category mapping",
	Long:  "Displays the WordPress to German category mapping.",
	Run:   runCategories,
}

func init() {
	cfg = config.DefaultConfig()

	// Root command flags
	rootCmd.PersistentFlags().BoolVarP(&cfg.Verbose, "verbose", "v", cfg.Verbose, "verbose output")
	rootCmd.PersistentFlags().BoolVarP(&cfg.Quiet, "quiet", "q", cfg.Quiet, "quiet mode (errors only)")

	// Convert command flags
	convertCmd.Flags().StringVarP(&cfg.InputFile, "input", "i", "", "input WordPress XML file (required)")
	convertCmd.Flags().StringVarP(&cfg.OutputDir, "output", "o", cfg.OutputDir, "output directory")

	// Organization flags
	convertCmd.Flags().BoolVar(&cfg.YearFolders, "year-folders", cfg.YearFolders, "organize posts into year folders")
	convertCmd.Flags().BoolVar(&cfg.MonthFolders, "month-folders", cfg.MonthFolders, "organize into month folders (requires --year-folders)")
	convertCmd.Flags().BoolVar(&cfg.PostFolders, "post-folders", cfg.PostFolders, "create individual folder per post")
	convertCmd.Flags().BoolVar(&cfg.PrefixDate, "prefix-date", cfg.PrefixDate, "prefix filenames with date")

	// Image processing flags
	convertCmd.Flags().BoolVar(&cfg.DownloadImages, "download-images", cfg.DownloadImages, "download images")
	convertCmd.Flags().BoolVar(&cfg.DownloadAttached, "download-attached", cfg.DownloadAttached, "download attached images")
	convertCmd.Flags().BoolVar(&cfg.DownloadScraped, "download-scraped", cfg.DownloadScraped, "download content images")
	convertCmd.Flags().IntVar(&cfg.ImageQuality, "image-quality", cfg.ImageQuality, "image quality (1-100)")
	convertCmd.Flags().IntVar(&cfg.MaxImageWidth, "max-image-width", cfg.MaxImageWidth, "maximum image width")
	convertCmd.Flags().StringVar(&cfg.ImageBaseURL, "image-base-url", cfg.ImageBaseURL, "base URL for relative image paths")

	// Processing flags
	convertCmd.Flags().IntVar(&cfg.Concurrency, "concurrency", cfg.Concurrency, "number of concurrent workers")
	convertCmd.Flags().BoolVar(&cfg.IncludeDrafts, "include-drafts", cfg.IncludeDrafts, "include draft posts")
	convertCmd.Flags().BoolVar(&cfg.IncludePages, "include-pages", cfg.IncludePages, "include pages")
	convertCmd.Flags().BoolVar(&cfg.IncludeTypes, "include-types", cfg.IncludeTypes, "include custom post types")

	// Output control flags
	convertCmd.Flags().BoolVar(&cfg.DryRun, "dry-run", cfg.DryRun, "preview without writing files")
	convertCmd.Flags().BoolVar(&cfg.Force, "force", cfg.Force, "overwrite existing files")

	// Advanced flags
	var authorMappingFile, categoryMappingFile string
	var timeoutSecs int
	convertCmd.Flags().StringVar(&authorMappingFile, "author-mapping", "", "JSON file for author mapping")
	convertCmd.Flags().StringVar(&categoryMappingFile, "category-mapping", "", "JSON file for category mapping")
	convertCmd.Flags().IntVar(&timeoutSecs, "timeout", 30, "HTTP timeout in seconds")

	// Mark required flags
	convertCmd.MarkFlagRequired("input")

	// Add commands
	rootCmd.AddCommand(convertCmd)
	rootCmd.AddCommand(validateCmd)
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(categoriesCmd)

	// Validate and list use the same input flag
	validateCmd.Flags().StringVarP(&cfg.InputFile, "input", "i", "", "input WordPress XML file (required)")
	validateCmd.MarkFlagRequired("input")

	listCmd.Flags().StringVarP(&cfg.InputFile, "input", "i", "", "input WordPress XML file (required)")
	listCmd.MarkFlagRequired("input")
}

func runConvert(cmd *cobra.Command, args []string) error {
	startTime := time.Now()

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		return fmt.Errorf("invalid configuration: %w", err)
	}

	logInfo("🚀 WordPress XML to MDX Converter v%s", version)
	logInfo("📁 Input: %s", cfg.InputFile)
	logInfo("📁 Output: %s", cfg.OutputDir)

	// Parse XML
	logInfo("📖 Parsing WordPress XML...")
	p := parser.New(cfg.InputFile)
	export, err := p.Parse()
	if err != nil {
		return fmt.Errorf("failed to parse XML: %w", err)
	}

	// Filter posts
	logInfo("🔍 Filtering posts...")
	items := parser.FilterPosts(export.Channel.Items, cfg.IncludeDrafts, cfg.IncludePages, cfg.IncludeTypes)
	logInfo("📝 Found %d posts to process", len(items))

	if len(items) == 0 {
		logInfo("⚠️  No posts to process")
		return nil
	}

	// Build posts
	logInfo("🏗️  Building post models...")
	gen := frontmatter.New(cfg)
	posts := make([]*models.Post, 0, len(items))

	for i := range items {
		post, err := gen.BuildPost(&items[i], export.Channel.Items)
		if err != nil {
			logWarn("Failed to build post %d: %v", items[i].PostID, err)
			continue
		}
		posts = append(posts, post)
	}

	logInfo("✅ Built %d post models", len(posts))

	// Process posts concurrently
	logInfo("⚙️  Processing posts...")
	stats, err := processPosts(posts)
	if err != nil {
		return fmt.Errorf("failed to process posts: %w", err)
	}

	// Print statistics
	duration := time.Since(startTime)
	logInfo("✨ Conversion complete!")
	logInfo("📊 Statistics:")
	logInfo("   Posts processed: %d", stats.PostsProcessed)
	logInfo("   Posts skipped: %d", stats.PostsSkipped)
	logInfo("   Images downloaded: %d", stats.ImagesDownloaded)
	logInfo("   Images failed: %d", stats.ImagesFailed)
	logInfo("   Duration: %v", duration.Round(time.Millisecond))
	logInfo("   Rate: %.1f posts/sec", float64(stats.PostsProcessed)/duration.Seconds())

	if len(stats.Errors) > 0 {
		logWarn("⚠️  %d errors occurred during conversion", len(stats.Errors))
		for _, err := range stats.Errors {
			logError("  - %v", err)
		}
	}

	return nil
}

func processPosts(posts []*models.Post) (*models.ConversionStats, error) {
	stats := &models.ConversionStats{
		StartTime: time.Now(),
	}

	// Create workers
	w := writer.New(cfg)
	imgDownloader := images.New(cfg)

	// Progress bar
	var bar *progressbar.ProgressBar
	if !cfg.Quiet {
		bar = progressbar.Default(int64(len(posts)), "Processing")
	}

	// Process posts with concurrency
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, cfg.Concurrency)
	var mu sync.Mutex

	for _, post := range posts {
		wg.Add(1)
		go func(p *models.Post) {
			defer wg.Done()
			semaphore <- struct{}{}        // Acquire
			defer func() { <-semaphore }() // Release

			// Determine output directory for images
			outputDir, _ := w.GetOutputDirectory(p)

			// Download images
			if err := imgDownloader.ProcessPost(p, outputDir); err != nil {
				mu.Lock()
				stats.Errors = append(stats.Errors, fmt.Errorf("image processing failed for %s: %w", p.Title, err))
				mu.Unlock()
			}

			// Write MDX file
			if err := w.WritePost(p); err != nil {
				mu.Lock()
				stats.Errors = append(stats.Errors, fmt.Errorf("write failed for %s: %w", p.Title, err))
				stats.PostsSkipped++
				mu.Unlock()
			} else {
				mu.Lock()
				stats.PostsProcessed++
				mu.Unlock()
			}

			if bar != nil {
				bar.Add(1)
			}
		}(post)
	}

	wg.Wait()
	stats.EndTime = time.Now()

	// Get image stats
	imgStats := imgDownloader.GetStats()
	stats.ImagesDownloaded = imgStats.Downloaded
	stats.ImagesFailed = imgStats.Failed

	return stats, nil
}

func runValidate(cmd *cobra.Command, args []string) error {
	logInfo("🔍 Validating WordPress XML file...")

	p := parser.New(cfg.InputFile)
	export, err := p.Parse()
	if err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	logInfo("✅ XML file is valid")
	logInfo("📊 Summary:")
	logInfo("   Site: %s", export.Channel.Title)
	logInfo("   Language: %s", export.Channel.Language)
	logInfo("   Total items: %d", len(export.Channel.Items))
	logInfo("   Authors: %d", len(export.Channel.Authors))

	// Count by type
	typeCounts := make(map[string]int)
	for _, item := range export.Channel.Items {
		typeCounts[item.PostType]++
	}

	logInfo("   By type:")
	for postType, count := range typeCounts {
		logInfo("     - %s: %d", postType, count)
	}

	return nil
}

func runList(cmd *cobra.Command, args []string) error {
	p := parser.New(cfg.InputFile)
	export, err := p.Parse()
	if err != nil {
		return fmt.Errorf("failed to parse XML: %w", err)
	}

	items := parser.FilterPosts(export.Channel.Items, true, true, true)

	fmt.Printf("Found %d posts:\n\n", len(items))
	for i, item := range items {
		fmt.Printf("%4d. [%s] %s\n", i+1, item.PostType, item.Title)
		fmt.Printf("       ID: %d | Status: %s | Date: %s\n", item.PostID, item.Status, item.PubDate)
	}

	return nil
}

func runCategories(cmd *cobra.Command, args []string) {
	fmt.Println("Category Mapping (WordPress → German):")
	fmt.Println()

	for wp, de := range cfg.CategoryMapping {
		fmt.Printf("  %-20s → %s\n", wp, de)
	}
}

func logInfo(format string, args ...interface{}) {
	if !cfg.Quiet {
		fmt.Printf(format+"\n", args...)
	}
}

func logWarn(format string, args ...interface{}) {
	if !cfg.Quiet {
		fmt.Fprintf(os.Stderr, "⚠️  "+format+"\n", args...)
	}
}

func logError(format string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, "❌ "+format+"\n", args...)
}

