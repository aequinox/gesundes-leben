/**
 * Example usage of the improved WordPress to MDX converter
 */
import { MockImageDownloader } from "./image-downloader";
import { WordPressToAstroConverter } from "./index";
import {
  ContentProcessorPipeline,
  GermanContentProcessor,
  ShortcodeProcessor,
} from "./processors";
import type { ConversionConfig } from "./types";

// Example 1: Basic usage with defaults
async function basicExample() {
  const config: ConversionConfig = {
    inputFile: "/path/to/wordpress-export.xml",
    outputDir: "/path/to/output",
    downloadImages: true,
    dryRun: false,
    skipDrafts: true,
    generateTOC: true,
    smartImagePositioning: {
      enableSmartPositioning: true,
      squareThreshold: 0.1,
      portraitThreshold: 0.75,
      landscapeThreshold: 1.5,
      smallImageThreshold: 400,
    },
  };

  const converter = new WordPressToAstroConverter();
  const result = await converter.convert(config);

  if (result.success) {
    console.log(`✅ Conversion successful!`);
    console.log(`📝 ${result.postsConverted} posts converted`);
    console.log(`🖼️  ${result.imagesDownloaded} images downloaded`);
  } else {
    console.error(`❌ Conversion failed with ${result.errors.length} errors`);
    result.errors.forEach(error => {
      console.error(`  - [${error.type}] ${error.message}`);
    });
  }
}

// Example 2: Custom processor pipeline
async function customProcessorExample() {
  // Create custom processor pipeline
  const customPipeline = new ContentProcessorPipeline()
    .addProcessor(new ShortcodeProcessor())
    .addProcessor(new GermanContentProcessor());

  // Note: This shows how you could extend the system
  // In practice, you'd need to modify the ContentTranslator constructor
  // to accept a custom pipeline
}

// Example 3: Testing with mock downloader
async function testingExample() {
  const config: ConversionConfig = {
    inputFile: "/path/to/test-export.xml",
    outputDir: "/tmp/test-output",
    downloadImages: false, // Use mock downloader
    dryRun: true,
    skipDrafts: true,
    generateTOC: false,
  };

  const converter = new WordPressToAstroConverter();
  const result = await converter.convert(config);

  // In dry run mode, files aren't actually written
  console.log(
    `Dry run completed: ${result.postsConverted} posts would be converted`
  );
}

// Example 4: Error handling and recovery
async function errorHandlingExample() {
  const config: ConversionConfig = {
    inputFile: "/path/to/problematic-export.xml",
    outputDir: "/path/to/output",
    downloadImages: true,
    dryRun: false,
    skipDrafts: true,
    generateTOC: true,
  };

  try {
    const converter = new WordPressToAstroConverter();
    const result = await converter.convert(config);

    // Even if some posts fail, the converter continues processing others
    console.log(`Conversion completed:`);
    console.log(`  ✅ ${result.postsConverted} posts converted successfully`);
    console.log(`  ⚠️  ${result.postsSkipped} posts skipped due to errors`);
    console.log(`  🔴 ${result.errors.length} total errors encountered`);

    if (result.errors.length > 0) {
      console.log(`\nError summary:`);
      const errorsByType = result.errors.reduce(
        (acc, error) => {
          acc[error.type] = (acc[error.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      Object.entries(errorsByType).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} errors`);
      });
    }

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  ${result.warnings.length} warnings:`);
      result.warnings.slice(0, 5).forEach(warning => {
        console.log(`  - ${warning}`);
      });
      if (result.warnings.length > 5) {
        console.log(`  ... and ${result.warnings.length - 5} more warnings`);
      }
    }
  } catch (error) {
    console.error(`Fatal conversion error: ${error}`);
  }
}

// Example 5: Custom author and category mappings
async function customMappingExample() {
  const config: ConversionConfig = {
    inputFile: "/path/to/wordpress-export.xml",
    outputDir: "/path/to/output",
    downloadImages: true,
    dryRun: false,
    skipDrafts: true,
    generateTOC: true,

    // Custom author mapping
    authorMapping: {
      "john.doe": "john-doe",
      "jane.smith": "jane-smith",
      admin: "site-admin",
    },

    // Custom category mapping
    categoryMapping: {
      "my-custom-category": ["Wissenswertes"],
      recipes: ["Ernährung"],
      workouts: ["Lifestyle & Psyche"],
    },
  };

  const converter = new WordPressToAstroConverter();
  const result = await converter.convert(config);

  console.log(
    `Conversion with custom mappings: ${result.success ? "Success" : "Failed"}`
  );
}

// Export examples for documentation
export {
  basicExample,
  customProcessorExample,
  testingExample,
  errorHandlingExample,
  customMappingExample,
};

// Run basic example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  basicExample().catch(console.error);
}
