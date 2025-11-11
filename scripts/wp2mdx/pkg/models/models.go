package models

import "time"

// WordPressExport represents the root WordPress export structure
type WordPressExport struct {
	Channel Channel `xml:"channel"`
}

// Channel contains all WordPress site data
type Channel struct {
	Title       string   `xml:"title"`
	Link        string   `xml:"link"`
	Description string   `xml:"description"`
	Language    string   `xml:"language"`
	Items       []Item   `xml:"item"`
	Authors     []Author `xml:"author"`
}

// Author represents a WordPress author
type Author struct {
	ID          int    `xml:"author_id"`
	Login       string `xml:"author_login"`
	Email       string `xml:"author_email"`
	DisplayName string `xml:"author_display_name"`
	FirstName   string `xml:"author_first_name"`
	LastName    string `xml:"author_last_name"`
}

// Item represents a WordPress post/page/attachment
type Item struct {
	Title       string     `xml:"title"`
	Link        string     `xml:"link"`
	PubDate     string     `xml:"pubDate"`
	Creator     string     `xml:"http://purl.org/dc/elements/1.1/ creator"`
	GUID        string     `xml:"guid"`
	Description string     `xml:"description"`
	Content     string     `xml:"http://purl.org/rss/1.0/modules/content/ encoded"`
	Excerpt     string     `xml:"http://wordpress.org/export/1.2/excerpt/ encoded"`
	PostID      int        `xml:"http://wordpress.org/export/1.2/ post_id"`
	PostName    string     `xml:"http://wordpress.org/export/1.2/ post_name"`
	PostType    string     `xml:"http://wordpress.org/export/1.2/ post_type"`
	Status      string     `xml:"http://wordpress.org/export/1.2/ status"`
	PostParent  int        `xml:"http://wordpress.org/export/1.2/ post_parent"`
	IsSticky    int        `xml:"http://wordpress.org/export/1.2/ is_sticky"`
	Categories  []Category `xml:"category"`
	PostMeta    []PostMeta `xml:"http://wordpress.org/export/1.2/ postmeta"`
	Comments    []Comment  `xml:"http://wordpress.org/export/1.2/ comment"`
}

// Category represents a WordPress category or tag
type Category struct {
	Domain   string `xml:"domain,attr"`
	Nicename string `xml:"nicename,attr"`
	Value    string `xml:",chardata"`
}

// PostMeta represents WordPress post metadata
type PostMeta struct {
	Key   string `xml:"http://wordpress.org/export/1.2/ meta_key"`
	Value string `xml:"http://wordpress.org/export/1.2/ meta_value"`
}

// Comment represents a WordPress comment
type Comment struct {
	ID          int    `xml:"http://wordpress.org/export/1.2/ comment_id"`
	Author      string `xml:"http://wordpress.org/export/1.2/ comment_author"`
	AuthorEmail string `xml:"http://wordpress.org/export/1.2/ comment_author_email"`
	AuthorURL   string `xml:"http://wordpress.org/export/1.2/ comment_author_url"`
	Date        string `xml:"http://wordpress.org/export/1.2/ comment_date"`
	Content     string `xml:"http://wordpress.org/export/1.2/ comment_content"`
	Approved    string `xml:"http://wordpress.org/export/1.2/ comment_approved"`
	Type        string `xml:"http://wordpress.org/export/1.2/ comment_type"`
	Parent      int    `xml:"http://wordpress.org/export/1.2/ comment_parent"`
}

// Post represents a processed blog post ready for MDX generation
type Post struct {
	ID          string
	Title       string
	Slug        string
	Author      string
	Content     string
	Excerpt     string
	PubDate     time.Time
	ModDate     time.Time
	Status      string
	Type        string
	Categories  []string
	Tags        []string
	Keywords    []string
	Group       string
	Featured    bool
	Draft       bool
	HeroImage   *ImageRef
	Images      []ImageRef
	Frontmatter map[string]interface{}
	RawItem     *Item
}

// ImageRef represents an image reference in the post
type ImageRef struct {
	ID           string
	URL          string
	LocalPath    string
	Variable     string
	Alt          string
	Position     string
	OriginalName string
	Downloaded   bool
}

// Frontmatter represents the MDX frontmatter structure
type Frontmatter struct {
	ID          string                 `yaml:"id"`
	Title       string                 `yaml:"title"`
	Author      string                 `yaml:"author"`
	PubDatetime string                 `yaml:"pubDatetime"`
	ModDatetime string                 `yaml:"modDatetime"`
	Description string                 `yaml:"description"`
	Keywords    []string               `yaml:"keywords,omitempty"`
	Categories  []string               `yaml:"categories,omitempty"`
	Group       string                 `yaml:"group"`
	Tags        []string               `yaml:"tags,omitempty"`
	HeroImage   *HeroImage             `yaml:"heroImage,omitempty"`
	Draft       bool                   `yaml:"draft"`
	Featured    bool                   `yaml:"featured"`
	References  []string               `yaml:"references,omitempty"`
	Extra       map[string]interface{} `yaml:",inline"`
}

// HeroImage represents the hero image configuration
type HeroImage struct {
	Src string `yaml:"src"`
	Alt string `yaml:"alt"`
}

// ConversionStats tracks conversion statistics
type ConversionStats struct {
	PostsProcessed   int
	PostsSkipped     int
	ImagesDownloaded int
	ImagesFailed     int
	Errors           []error
	StartTime        time.Time
	EndTime          time.Time
}

// Duration returns the total conversion duration
func (s *ConversionStats) Duration() time.Duration {
	return s.EndTime.Sub(s.StartTime)
}
