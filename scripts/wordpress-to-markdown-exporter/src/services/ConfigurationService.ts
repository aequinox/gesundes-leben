import { Command } from "commander";
import inquirer from "inquirer";
import { inject, injectable } from "inversify";
import { IConfigurationService } from "../domain/interfaces/IConfigurationService.js";
import { ILoggerService } from "../domain/interfaces/ILoggerService.js";
import { Configuration, DEFAULT_CONFIGURATION } from "../domain/models/Configuration.js";
import { PathUtils } from "../utils/PathUtils.js";
import { Result } from "../utils/Result.js";

/**
 * Implementation of the configuration service
 */
@injectable()
export class ConfigurationService implements IConfigurationService {
  /**
   * Creates a new configuration service
   * @param loggerService Logger service
   */
  constructor(
    @inject("ILoggerService") private readonly loggerService: ILoggerService
  ) {}

  /**
   * Get configuration from command line arguments or interactive wizard
   * @param argv Command line arguments
   * @returns Result containing the configuration or an error
   */
  public async getConfig(argv: string[]): Promise<Result<Configuration>> {
    try {
      this.loggerService.debug("Getting configuration...");
      
      // Parse command line arguments
      const program = new Command();
      
      // Add version and help options
      program
        .name("wordpress-to-markdown-exporter")
        .description("Convert WordPress export XML to Markdown for Astro")
        .version("1.0.0");
      
      // Add configuration options
      this.addConfigOptions(program);
      
      // Parse arguments
      program.parse(argv);
      const options = program.opts();
      
      // Check if wizard should be used
      if (options.wizard) {
        this.loggerService.info("Starting configuration wizard...");
        const wizardConfig = await this.runWizard(options);
        const mergedConfig = this.mergeWithDefaults(wizardConfig);
        return this.validateConfig(mergedConfig);
      } else {
        this.loggerService.info("Using command line configuration...");
        const mergedConfig = this.mergeWithDefaults(options);
        return this.validateConfig(mergedConfig);
      }
    } catch (error) {
      return Result.failure("Failed to get configuration", error as Error);
    }
  }

  /**
   * Validate configuration
   * @param config Configuration to validate
   * @returns Result containing the validated configuration or an error
   */
  public validateConfig(config: Configuration): Result<Configuration> {
    try {
      // Validate input file
      if (!PathUtils.fileExists(config.input)) {
        return Result.failure(`Input file not found: ${config.input}`);
      }
      
      // Validate output directory
      if (!PathUtils.ensureDirectoryExists(config.output)) {
        return Result.failure(`Failed to create output directory: ${config.output}`);
      }
      
      // Validate image file request delay
      if (config.imageFileRequestDelay < 0) {
        return Result.failure("Image file request delay must be non-negative");
      }
      
      // Validate markdown file write delay
      if (config.markdownFileWriteDelay < 0) {
        return Result.failure("Markdown file write delay must be non-negative");
      }
      
      return Result.success(config);
    } catch (error) {
      return Result.failure("Failed to validate configuration", error as Error);
    }
  }

  /**
   * Get default configuration
   * @returns Default configuration
   */
  public getDefaultConfig(): Configuration {
    return { ...DEFAULT_CONFIGURATION };
  }

  /**
   * Merge configuration with defaults
   * @param config Partial configuration
   * @returns Complete configuration with defaults applied
   */
  public mergeWithDefaults(config: Partial<Configuration>): Configuration {
    const defaultConfig = this.getDefaultConfig();
    
    // Handle nested astro configuration
    const astroConfig = {
      ...defaultConfig.astro,
      ...(config.astro || {}),
    };
    
    return {
      ...defaultConfig,
      ...config,
      astro: astroConfig,
    };
  }

  /**
   * Add configuration options to command
   * @param program Command instance
   */
  private addConfigOptions(program: Command): void {
    program
      .option("-i, --input <path>", "Path to WordPress export XML file", DEFAULT_CONFIGURATION.input)
      .option("-o, --output <path>", "Path to output directory", DEFAULT_CONFIGURATION.output)
      .option("-y, --year-folders", "Create year folders", DEFAULT_CONFIGURATION.yearFolders)
      .option("-m, --month-folders", "Create month folders", DEFAULT_CONFIGURATION.monthFolders)
      .option("-p, --post-folders", "Create a folder for each post", DEFAULT_CONFIGURATION.postFolders)
      .option("-d, --prefix-date", "Prefix post folders/files with date", DEFAULT_CONFIGURATION.prefixDate)
      .option("-a, --save-attached-images", "Save images attached to posts", DEFAULT_CONFIGURATION.saveAttachedImages)
      .option("-s, --save-scraped-images", "Save images scraped from post body content", DEFAULT_CONFIGURATION.saveScrapedImages)
      .option("-t, --include-other-types", "Include custom post types and pages", DEFAULT_CONFIGURATION.includeOtherTypes)
      .option("-w, --wizard", "Use interactive wizard", DEFAULT_CONFIGURATION.wizard)
      .option("--no-wizard", "Skip interactive wizard")
      .option("--strict-ssl", "Enforce strict SSL when downloading images", DEFAULT_CONFIGURATION.strictSsl)
      .option("--no-strict-ssl", "Disable strict SSL when downloading images");
  }

  /**
   * Run interactive configuration wizard
   * @param cliOptions Command line options
   * @returns Configuration from wizard
   */
  private async runWizard(cliOptions: any): Promise<Partial<Configuration>> {
    // Only ask for options that weren't provided via CLI
    const questions = [
      {
        type: "input",
        name: "input",
        message: "Path to WordPress export XML file:",
        default: DEFAULT_CONFIGURATION.input,
        when: !cliOptions.input,
        validate: (value: string) => {
          if (PathUtils.fileExists(value)) {
            return true;
          }
          return `File not found: ${value}`;
        },
      },
      {
        type: "input",
        name: "output",
        message: "Path to output directory:",
        default: DEFAULT_CONFIGURATION.output,
        when: !cliOptions.output,
      },
      {
        type: "confirm",
        name: "yearFolders",
        message: "Create year folders?",
        default: DEFAULT_CONFIGURATION.yearFolders,
        when: cliOptions.yearFolders === undefined,
      },
      {
        type: "confirm",
        name: "monthFolders",
        message: "Create month folders?",
        default: DEFAULT_CONFIGURATION.monthFolders,
        when: cliOptions.monthFolders === undefined,
      },
      {
        type: "confirm",
        name: "postFolders",
        message: "Create a folder for each post?",
        default: DEFAULT_CONFIGURATION.postFolders,
        when: cliOptions.postFolders === undefined,
      },
      {
        type: "confirm",
        name: "prefixDate",
        message: "Prefix post folders/files with date?",
        default: DEFAULT_CONFIGURATION.prefixDate,
        when: cliOptions.prefixDate === undefined,
      },
      {
        type: "confirm",
        name: "saveAttachedImages",
        message: "Save images attached to posts?",
        default: DEFAULT_CONFIGURATION.saveAttachedImages,
        when: cliOptions.saveAttachedImages === undefined,
      },
      {
        type: "confirm",
        name: "saveScrapedImages",
        message: "Save images scraped from post body content?",
        default: DEFAULT_CONFIGURATION.saveScrapedImages,
        when: cliOptions.saveScrapedImages === undefined,
      },
      {
        type: "confirm",
        name: "includeOtherTypes",
        message: "Include custom post types and pages?",
        default: DEFAULT_CONFIGURATION.includeOtherTypes,
        when: cliOptions.includeOtherTypes === undefined,
      },
      {
        type: "confirm",
        name: "strictSsl",
        message: "Enforce strict SSL when downloading images?",
        default: DEFAULT_CONFIGURATION.strictSsl,
        when: cliOptions.strictSsl === undefined,
      },
      {
        type: "list",
        name: "astro.fileExtension",
        message: "File extension for markdown files:",
        choices: [".md", ".mdx"],
        default: DEFAULT_CONFIGURATION.astro.fileExtension,
        when: !cliOptions.astro?.fileExtension,
      },
      {
        type: "input",
        name: "astro.contentCollection",
        message: "Astro content collection name:",
        default: DEFAULT_CONFIGURATION.astro.contentCollection,
        when: !cliOptions.astro?.contentCollection,
      },
    ];

    const answers = await inquirer.prompt<Record<string, any>>(questions as any);
    
    // Merge CLI options with wizard answers
    return { ...cliOptions, ...answers };
  }
}
