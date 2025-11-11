package config

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

// Config holds all configuration options for the converter
type Config struct {
	// Input/Output
	InputFile  string
	OutputDir  string

	// Organization
	YearFolders   bool
	MonthFolders  bool
	PostFolders   bool
	PrefixDate    bool

	// Image Processing
	DownloadImages   bool
	DownloadAttached bool
	DownloadScraped  bool
	ImageQuality     int
	MaxImageWidth    int
	ImageBaseURL     string

	// Processing
	Concurrency    int
	IncludeDrafts  bool
	IncludePages   bool
	IncludeTypes   bool

	// Output Control
	DryRun  bool
	Verbose bool
	Quiet   bool
	Force   bool

	// Advanced
	AuthorMapping   map[string]string
	CategoryMapping map[string]string
	Timeout         time.Duration
}

// DefaultConfig returns configuration with sensible defaults
func DefaultConfig() *Config {
	return &Config{
		OutputDir:        "./output",
		YearFolders:      false,
		MonthFolders:     false,
		PostFolders:      true,
		PrefixDate:       true,
		DownloadImages:   true,
		DownloadAttached: true,
		DownloadScraped:  true,
		ImageQuality:     85,
		MaxImageWidth:    2000,
		Concurrency:      5,
		IncludeDrafts:    false,
		IncludePages:     false,
		IncludeTypes:     false,
		DryRun:           false,
		Verbose:          false,
		Quiet:            false,
		Force:            false,
		Timeout:          30 * time.Second,
		AuthorMapping:    make(map[string]string),
		CategoryMapping:  getDefaultCategoryMapping(),
	}
}

// getDefaultCategoryMapping returns the default WordPress to German category mapping
func getDefaultCategoryMapping() map[string]string {
	return map[string]string{
		// English to German
		"nutrition":        "Ernährung",
		"health":           "Gesundheit",
		"wellness":         "Wellness",
		"mental health":    "Lifestyle & Psyche",
		"fitness":          "Lifestyle & Psyche",
		"immune system":    "Immunsystem",
		"prevention":       "Wissenswertes",
		"natural remedies": "Wissenswertes",
		"micronutrients":   "Mikronährstoffe",
		"organs":           "Organsysteme",
		"scientific":       "Wissenschaftliches",
		"interesting":      "Lesenswertes",

		// German categories (pass-through)
		"ernährung":          "Ernährung",
		"immunsystem":        "Immunsystem",
		"lesenswertes":       "Lesenswertes",
		"lifestyle & psyche": "Lifestyle & Psyche",
		"mikronährstoffe":    "Mikronährstoffe",
		"organsysteme":       "Organsysteme",
		"wissenschaftliches": "Wissenschaftliches",
		"wissenswertes":      "Wissenswertes",
	}
}

// Validate checks if the configuration is valid
func (c *Config) Validate() error {
	if c.InputFile == "" {
		return fmt.Errorf("input file is required")
	}

	if _, err := os.Stat(c.InputFile); os.IsNotExist(err) {
		return fmt.Errorf("input file does not exist: %s", c.InputFile)
	}

	if c.OutputDir == "" {
		return fmt.Errorf("output directory is required")
	}

	if c.Concurrency < 1 {
		return fmt.Errorf("concurrency must be at least 1")
	}

	if c.ImageQuality < 1 || c.ImageQuality > 100 {
		return fmt.Errorf("image quality must be between 1 and 100")
	}

	if c.MaxImageWidth < 100 {
		return fmt.Errorf("max image width must be at least 100")
	}

	return nil
}

// LoadAuthorMapping loads author mapping from a JSON file
func (c *Config) LoadAuthorMapping(filename string) error {
	if filename == "" {
		return nil
	}

	data, err := os.ReadFile(filename)
	if err != nil {
		return fmt.Errorf("failed to read author mapping: %w", err)
	}

	var mapping map[string]string
	if err := json.Unmarshal(data, &mapping); err != nil {
		return fmt.Errorf("failed to parse author mapping: %w", err)
	}

	c.AuthorMapping = mapping
	return nil
}

// LoadCategoryMapping loads category mapping from a JSON file
func (c *Config) LoadCategoryMapping(filename string) error {
	if filename == "" {
		return nil
	}

	data, err := os.ReadFile(filename)
	if err != nil {
		return fmt.Errorf("failed to read category mapping: %w", err)
	}

	var mapping map[string]string
	if err := json.Unmarshal(data, &mapping); err != nil {
		return fmt.Errorf("failed to parse category mapping: %w", err)
	}

	// Merge with defaults
	for k, v := range mapping {
		c.CategoryMapping[k] = v
	}

	return nil
}

// GetAuthor returns the mapped author name or the original if no mapping exists
func (c *Config) GetAuthor(original string) string {
	if mapped, ok := c.AuthorMapping[original]; ok {
		return mapped
	}
	return original
}

// GetCategory returns the mapped category or the original if no mapping exists
func (c *Config) GetCategory(original string) string {
	if mapped, ok := c.CategoryMapping[original]; ok {
		return mapped
	}
	return original
}
