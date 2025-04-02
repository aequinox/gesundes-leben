#!/usr/bin/env node

import "reflect-metadata";
import { Container } from "inversify";
import { IConfigurationService } from "./domain/interfaces/IConfigurationService.js";
import { IImageService } from "./domain/interfaces/IImageService.js";
import { ILoggerService } from "./domain/interfaces/ILoggerService.js";
import { IMarkdownService } from "./domain/interfaces/IMarkdownService.js";
import { IWordPressService } from "./domain/interfaces/IWordPressService.js";
import { ConfigurationService } from "./services/ConfigurationService.js";
import { ImageService } from "./services/ImageService.js";
import { LoggerService } from "./services/LoggerService.js";
import { MarkdownService } from "./services/MarkdownService.js";
import { WordPressService } from "./services/WordPressService.js";
import { Result } from "./utils/Result.js";

/**
 * Main entry point for the WordPress to Markdown exporter
 */
async function main(): Promise<void> {
  // Create dependency injection container
  const container = new Container();
  
  // Register services
  container.bind<ILoggerService>("ILoggerService").to(LoggerService).inSingletonScope();
  container.bind<IConfigurationService>("IConfigurationService").to(ConfigurationService).inSingletonScope();
  container.bind<IWordPressService>("IWordPressService").to(WordPressService).inSingletonScope();
  container.bind<IMarkdownService>("IMarkdownService").to(MarkdownService).inSingletonScope();
  container.bind<IImageService>("IImageService").to(ImageService).inSingletonScope();
  
  // Get services
  const loggerService = container.get<ILoggerService>("ILoggerService");
  const configService = container.get<IConfigurationService>("IConfigurationService");
  const wordpressService = container.get<IWordPressService>("IWordPressService");
  const markdownService = container.get<IMarkdownService>("IMarkdownService");
  const imageService = container.get<IImageService>("IImageService");
  
  try {
    loggerService.info("WordPress to Markdown Exporter");
    
    // Get configuration
    const configResult = await configService.getConfig(process.argv);
    if (configResult.isFailure) {
      loggerService.error(configResult.error);
      process.exit(1);
    }
    const config = configResult.value;
    
    // Parse WordPress export
    const postsResult = await wordpressService.parseExport(config);
    if (postsResult.isFailure) {
      loggerService.error(postsResult.error);
      process.exit(1);
    }
    const posts = postsResult.value;
    
    // Write markdown files
    const writeResult = await markdownService.writeFiles(posts, config);
    if (writeResult.isFailure) {
      loggerService.error(writeResult.error);
      process.exit(1);
    }
    
    // Process images
    const imageResult = await imageService.processImages(posts, config);
    if (imageResult.isFailure) {
      loggerService.error(imageResult.error);
      process.exit(1);
    }
    
    // Display completion message
    loggerService.success(`Conversion complete! Output files located at: ${config.output}`);
  } catch (error) {
    if (error instanceof Error) {
      loggerService.error("An unexpected error occurred", error);
    } else {
      loggerService.error(`An unexpected error occurred: ${String(error)}`);
    }
    process.exit(1);
  }
}

// Execute main function
main().catch((error) => {
  console.error("Fatal error occurred", error);
  process.exit(1);
});
