#!/usr/bin/env bun

/**
 * XML to MDX Converter CLI
 * Modern CLI tool for converting WordPress XML exports to Astro-compatible MDX files
 */

import { resolve } from 'path';

import { Command } from 'commander';

import { logger } from '@/utils/logger';

import { convertXmlToMdxWithErrorHandling, validateXmlFile, ensureOutputDirectory } from './xml2markdown/src/converter.js';
import type { XmlConverterConfig } from './xml2markdown/src/types.js';

// Configure logger for CLI
const cliLogger = logger.configure({
  component: 'xml-cli',
  minLevel: 'INFO' as const,
  timestampFormat: 'time'
});

/**
 * CLI program configuration
 */
const program = new Command();

program
  .name('xml-converter')
  .description('Convert WordPress XML exports to Astro-compatible MDX files for the Healthy Life blog')
  .version('2.0.0')
  .option('-i, --input <file>', 'Input XML file path')
  .option('-o, --output <dir>', 'Output directory path', './src/data/blog')
  .option('--year-folders', 'Organize posts into year folders')
  .option('--month-folders', 'Organize posts into month folders (requires --year-folders)')
  .option('--post-folders', 'Create individual folders for each post', false)
  .option('--prefix-date', 'Add date prefix to post filenames/folders')
  .option('--save-attached-images', 'Download attached images', true)
  .option('--save-scraped-images', 'Download images from post content', true)
  .option('--include-other-types', 'Include custom post types and pages')
  .option('--dry-run', 'Show what would be converted without actually converting')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Suppress non-error output')
  .helpOption('-h, --help', 'Display help information')
  .action(async (options) => {
    try {
      // Configure logging based on options
      if (options.verbose) {
        cliLogger.configure({ minLevel: 'DEBUG' as const });
      } else if (options.quiet) {
        cliLogger.configure({ minLevel: 'ERROR' as const });
      }

      cliLogger.info('🚀 XML to MDX Converter v2.0.0');
      cliLogger.info('🏥 Healthy Life Blog - WordPress Export Processor');
      
      // Validate required options
      if (!options.input) {
        cliLogger.error('❌ Input file is required. Use -i or --input to specify the XML file.');
        process.exit(1);
      }

      // Resolve paths
      const inputPath = resolve(options.input);
      const outputPath = resolve(options.output);

      cliLogger.info(`📁 Input: ${inputPath}`);
      cliLogger.info(`📁 Output: ${outputPath}`);

      // Validate XML file
      cliLogger.info('🔍 Validating XML file...');
      const isValidFile = await validateXmlFile(inputPath);
      if (!isValidFile) {
        cliLogger.error('❌ Invalid or inaccessible XML file:', inputPath);
        process.exit(1);
      }

      // Ensure output directory exists
      cliLogger.info('📁 Preparing output directory...');
      await ensureOutputDirectory(outputPath);

      // Build configuration
      const config: Partial<XmlConverterConfig> = {
        input: inputPath,
        output: outputPath,
        yearFolders: options.yearFolders,
        monthFolders: options.monthFolders,
        postFolders: options.postFolders,
        prefixDate: options.prefixDate,
        saveAttachedImages: options.saveAttachedImages,
        saveScrapedImages: options.saveScrapedImages,
        includeOtherTypes: options.includeOtherTypes,
      };

      // Show configuration in verbose mode
      if (options.verbose) {
        cliLogger.debug('⚙️ Configuration:', config);
      }

      // Dry run mode
      if (options.dryRun) {
        cliLogger.info('🔍 DRY RUN MODE - No files will be created');
        cliLogger.info('📋 Configuration summary:');
        cliLogger.info(`  • Input file: ${inputPath}`);
        cliLogger.info(`  • Output directory: ${outputPath}`);
        cliLogger.info(`  • Year folders: ${config.yearFolders ? '✅' : '❌'}`);
        cliLogger.info(`  • Month folders: ${config.monthFolders ? '✅' : '❌'}`);
        cliLogger.info(`  • Post folders: ${config.postFolders ? '✅' : '❌'}`);
        cliLogger.info(`  • Date prefix: ${config.prefixDate ? '✅' : '❌'}`);
        cliLogger.info(`  • Download images: ${config.saveAttachedImages ? '✅' : '❌'}`);
        cliLogger.info(`  • Process content images: ${config.saveScrapedImages ? '✅' : '❌'}`);
        cliLogger.info(`  • Include other types: ${config.includeOtherTypes ? '✅' : '❌'}`);
        process.exit(0);
      }

      // Start conversion
      cliLogger.info('⚡ Starting conversion process...');
      const startTime = Date.now();

      const result = await convertXmlToMdxWithErrorHandling(config);

      const duration = Date.now() - startTime;
      const durationSeconds = (duration / 1000).toFixed(2);

      // Report results
      if (result.errors.length === 0) {
        cliLogger.info('🎉 Conversion completed successfully!');
        cliLogger.info(`📊 Results:`);
        cliLogger.info(`  • Posts processed: ${result.postsProcessed}`);
        cliLogger.info(`  • Images downloaded: ${result.imagesDownloaded}`);
        cliLogger.info(`  • Duration: ${durationSeconds}s`);
        cliLogger.info(`✨ Your WordPress content is now ready for Astro!`);
      } else {
        cliLogger.warn('⚠️ Conversion completed with errors:');
        cliLogger.info(`📊 Results:`);
        cliLogger.info(`  • Posts processed: ${result.postsProcessed}`);
        cliLogger.info(`  • Images downloaded: ${result.imagesDownloaded}`);
        cliLogger.info(`  • Errors encountered: ${result.errors.length}`);
        cliLogger.info(`  • Duration: ${durationSeconds}s`);

        if (options.verbose) {
          cliLogger.error('🐛 Error details:');
          result.errors.forEach((error, index) => {
            cliLogger.error(`  ${index + 1}. ${error.message}`);
            if (error.context) {
              cliLogger.debug('    Context:', error.context);
            }
          });
        }

        process.exit(1);
      }

    } catch (error) {
      cliLogger.error('💥 Fatal error:', error);
      
      if (options.verbose && error instanceof Error) {
        cliLogger.error('Stack trace:', error.stack);
      }
      
      process.exit(1);
    }
  });

// Add example usage
program.addHelpText('after', `
Examples:
  # Basic conversion
  $ bun xml-converter -i export.xml -o ./src/data/blog

  # With year/month organization and date prefixes
  $ bun xml-converter -i export.xml --year-folders --month-folders --prefix-date

  # Dry run to see what would happen
  $ bun xml-converter -i export.xml --dry-run

  # Verbose output for debugging
  $ bun xml-converter -i export.xml -v

  # Process custom post types and pages
  $ bun xml-converter -i export.xml --include-other-types

For more information, visit: https://github.com/your-org/healthy-life-blog
`);

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}