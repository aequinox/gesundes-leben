import camelcase from 'camelcase';
import commander from 'commander';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { ConfigurationError } from '../error/ErrorService';
import { loggerService } from '../logger/LoggerService';

/**
 * Enum representing the different types of configuration options.
 */
export enum OptionType {
  BOOLEAN = 'boolean',
  FILE = 'file',
  FOLDER = 'folder',
  STRING = 'string',
  NUMBER = 'number',
}

/**
 * Interface for configuration option definitions.
 */
export interface IOption {
  name: string;
  type: OptionType;
  description: string;
  default: unknown;
  aliases?: string[];
  prompt?: string;
  coerce?: (value: string) => unknown;
  validate?: (value: string) => boolean | string;
  isProvided?: boolean;
}

/**
 * Interface for the configuration object returned by the wizard.
 */
export interface IConfig {
  wizard: boolean;
  input: string;
  output: string;
  yearFolders: boolean;
  monthFolders: boolean;
  postFolders: boolean;
  prefixDate: boolean;
  saveAttachedImages: boolean;
  saveScrapedImages: boolean;
  includeOtherTypes: boolean;
  [key: string]: unknown;
}

/**
 * Interface for the settings object.
 */
export interface ISettings {
  frontmatter_fields: string[];
  image_file_request_delay: number;
  image_download_timeout: number;
  markdown_file_write_delay: number;
  include_time_with_date: boolean;
  custom_date_formatting: string;
  custom_date_timezone: string;
  filter_categories: string[];
  strict_ssl: boolean;
}

/**
 * Service responsible for validating configuration values.
 */
export class ValidationService {
  /**
   * Validates that a file exists at the given path.
   * @param value - File path to validate
   * @returns True if valid, error message if invalid
   */
  public validateFile(value: string): boolean | string {
    try {
      const isValid = fs.existsSync(value) && fs.statSync(value).isFile();
      return isValid ? true : `Unable to find file: ${path.resolve(value)}`;
    } catch (error) {
      loggerService.error('Error validating file:', error);
      return `Error validating file: ${path.resolve(value)}`;
    }
  }

  /**
   * Validates that a value is a positive number.
   * @param value - Value to validate
   * @returns True if valid, error message if invalid
   */
  public validatePositiveNumber(value: string): boolean | string {
    const num = Number(value);
    return !isNaN(num) && num > 0 ? true : 'Value must be a positive number';
  }

  /**
   * Validates that a value is a boolean.
   * @param value - Value to validate
   * @returns True if valid, error message if invalid
   */
  public validateBoolean(value: string): boolean | string {
    return ['true', 'false', '0', '1', 'yes', 'no'].includes(value.toLowerCase())
      ? true
      : 'Value must be a boolean (true/false, yes/no, 1/0)';
  }
}

/**
 * Service responsible for coercing configuration values to their proper types.
 */
export class CoercionService {
  /**
   * Coerces a value to boolean.
   * @param value - Value to coerce
   * @returns Coerced boolean value
   */
  public coerceBoolean(value: string): boolean {
    return !['false', 'no', '0'].includes(value.toLowerCase());
  }

  /**
   * Coerces a value to number.
   * @param value - Value to coerce
   * @returns Coerced number value
   */
  public coerceNumber(value: string): number {
    return Number(value);
  }

  /**
   * Normalizes a file/folder path.
   * @param value - Path to normalize
   * @returns Normalized path
   */
  public coercePath(value: string): string {
    return path.normalize(value);
  }
}

/**
 * Repository for managing configuration options.
 */
export class OptionRepository {
  private options: IOption[];
  private readonly validationService: ValidationService;
  private readonly coercionService: CoercionService;

  /**
   * Creates an instance of OptionRepository.
   * @param validationService - Service for validating option values
   * @param coercionService - Service for coercing option values
   */
  constructor(
    validationService: ValidationService,
    coercionService: CoercionService
  ) {
    this.validationService = validationService;
    this.coercionService = coercionService;
    this.options = this.initializeOptions();
  }

  /**
   * Gets all configuration options.
   * @returns Array of configuration options
   */
  public getOptions(): IOption[] {
    return this.options;
  }

  /**
   * Extends options with type-specific data.
   */
  public extendOptionsData(): void {
    const map: Record<OptionType, Partial<IOption>> = {
      [OptionType.BOOLEAN]: {
        prompt: 'confirm',
        coerce: this.coercionService.coerceBoolean,
        validate: this.validationService.validateBoolean,
      },
      [OptionType.FILE]: {
        prompt: 'input',
        coerce: this.coercionService.coercePath,
        validate: this.validationService.validateFile,
      },
      [OptionType.FOLDER]: {
        prompt: 'input',
        coerce: this.coercionService.coercePath,
      },
      [OptionType.STRING]: {
        prompt: 'input',
      },
      [OptionType.NUMBER]: {
        prompt: 'input',
        coerce: this.coercionService.coerceNumber,
        validate: this.validationService.validatePositiveNumber,
      },
    };

    this.options.forEach((option) => {
      Object.assign(option, map[option.type as OptionType]);
    });
  }

  /**
   * Initializes the default configuration options.
   * @returns Array of configuration options
   */
  private initializeOptions(): IOption[] {
    return [
      // wizard must always be first
      {
        name: 'wizard',
        type: OptionType.BOOLEAN,
        description: 'Use wizard',
        default: true,
      },
      {
        name: 'input',
        type: OptionType.FILE,
        description: 'Path to WordPress export file',
        default: 'export.xml',
      },
      {
        name: 'output',
        type: OptionType.FOLDER,
        description: 'Path to output folder',
        default: 'output',
      },
      {
        name: 'year-folders',
        aliases: ['yearfolders', 'yearmonthfolders'],
        type: OptionType.BOOLEAN,
        description: 'Create year folders',
        default: false,
      },
      {
        name: 'month-folders',
        aliases: ['yearmonthfolders'],
        type: OptionType.BOOLEAN,
        description: 'Create month folders',
        default: false,
      },
      {
        name: 'post-folders',
        aliases: ['postfolders'],
        type: OptionType.BOOLEAN,
        description: 'Create a folder for each post',
        default: true,
      },
      {
        name: 'prefix-date',
        aliases: ['prefixdate'],
        type: OptionType.BOOLEAN,
        description: 'Prefix post folders/files with date',
        default: false,
      },
      {
        name: 'save-attached-images',
        aliases: ['saveimages'],
        type: OptionType.BOOLEAN,
        description: 'Save images attached to posts',
        default: true,
      },
      {
        name: 'save-scraped-images',
        aliases: ['addcontentimages'],
        type: OptionType.BOOLEAN,
        description: 'Save images scraped from post body content',
        default: true,
      },
      {
        name: 'include-other-types',
        type: OptionType.BOOLEAN,
        description: 'Include custom post types and pages',
        default: false,
      },
      {
        name: 'image-request-delay',
        type: OptionType.NUMBER,
        description: 'Delay between image requests (ms)',
        default: 500,
      },
      {
        name: 'image-download-timeout',
        type: OptionType.NUMBER,
        description: 'Image download timeout (ms)',
        default: 30000,
      },
      {
        name: 'markdown-write-delay',
        type: OptionType.NUMBER,
        description: 'Delay between markdown file writes (ms)',
        default: 25,
      },
      {
        name: 'include-time-with-date',
        type: OptionType.BOOLEAN,
        description: 'Include time with post dates',
        default: true,
      },
      {
        name: 'custom-date-formatting',
        type: OptionType.STRING,
        description: 'Custom date formatting string',
        default: '',
      },
      {
        name: 'custom-date-timezone',
        type: OptionType.STRING,
        description: 'Custom date timezone',
        default: 'utc',
      },
      {
        name: 'strict-ssl',
        type: OptionType.BOOLEAN,
        description: 'Enforce strict SSL when downloading images',
        default: true,
      },
    ];
  }
}

/**
 * Service responsible for handling command line arguments.
 */
export class CommandLineService {
  private readonly optionRepository: OptionRepository;
  private readonly packageJson: { version: string };

  /**
   * Creates an instance of CommandLineService.
   * @param optionRepository - Repository for configuration options
   * @param packageJsonPath - Path to package.json file
   */
  constructor(optionRepository: OptionRepository, packageJsonPath: string) {
    this.optionRepository = optionRepository;
    this.packageJson = this.loadPackageJson(packageJsonPath);
  }

  /**
   * Replaces alias arguments with their primary names.
   * @param argv - Command line arguments
   * @returns Arguments with aliases replaced
   */
  public replaceAliases(argv: string[]): string[] {
    const paths = argv.slice(0, 2);
    const replaced: string[] = [];
    const unmodified: string[] = [];

    argv.slice(2).forEach((arg) => {
      let aliasFound = false;

      // this loop does not short circuit because an alias can map to multiple options
      this.optionRepository.getOptions().forEach((option) => {
        const aliases = option.aliases || [];
        aliases.forEach((alias) => {
          if (arg.includes(`--${alias}`)) {
            replaced.push(arg.replace(`--${alias}`, `--${option.name}`));
            aliasFound = true;
          }
        });
      });

      if (!aliasFound) {
        unmodified.push(arg);
      }
    });

    return [...paths, ...replaced, ...unmodified];
  }

  /**
   * Parse command line arguments.
   * @param argv - Command line arguments
   * @returns Parsed command object
   */
  public parseCommandLine(argv: string[]): commander.Command {
    // setup for help output
    const program = new commander.Command()
      .name('node index.js')
      .version(`v${this.packageJson.version}`, '-v, --version', 'Display version number')
      .helpOption('-h, --help', "See the thing you're looking at right now")
      .on('--help', () => {
        console.log(
          '\nMore documentation is at https://github.com/lonekorean/wordpress-export-to-markdown'
        );
      });

    this.optionRepository.getOptions().forEach((option) => {
      const flag = `--${option.name} <${option.type}>`;
      const coerce = (value: string): unknown => {
        // commander only calls coerce when an input is provided on the command line
        // which makes for an easy way to flag (for later) if it should be excluded from the wizard
        option.isProvided = true;
        return option.coerce ? option.coerce(value) : value;
      };
      program.option(flag, option.description, coerce, option.default);
    });

    return program.parse(argv);
  }

  /**
   * Loads the package.json file.
   * @param packageJsonPath - Path to package.json file
   * @returns Package.json content
   */
  private loadPackageJson(packageJsonPath: string): { version: string } {
    try {
      return require(packageJsonPath);
    } catch (error) {
      loggerService.error('Failed to load package.json', error);
      return { version: '0.0.0' };
    }
  }
}

/**
 * Service responsible for handling the interactive wizard.
 */
export class WizardService {
  private readonly optionRepository: OptionRepository;

  /**
   * Creates an instance of WizardService.
   * @param optionRepository - Repository for configuration options
   */
  constructor(optionRepository: OptionRepository) {
    this.optionRepository = optionRepository;
  }

  /**
   * Runs the interactive wizard to collect configuration options.
   * @param program - Parsed command object
   * @returns Configuration object
   */
  public async runWizard(program: commander.Command): Promise<IConfig> {
    if (program.opts().wizard) {
      loggerService.info('Starting wizard...');
      const questions = this.optionRepository.getOptions()
        .filter(option => option.name !== 'wizard' && !option.isProvided)
        .map((option) => ({
          name: camelcase(option.name),
          type: option.prompt,
          message: `${option.description}?`,
          default: option.default,
          filter: option.coerce,
          validate: option.validate,
        }));
      const answers = await inquirer.prompt(questions as any);
      return { ...program.opts(), ...answers } as IConfig;
    } else {
      loggerService.info('Skipping wizard...');
      return program.opts() as IConfig;
    }
  }
}

/**
 * Service for managing application settings.
 */
export class SettingsService {
  private settings: ISettings;

  /**
   * Creates an instance of SettingsService.
   * @param settings - Optional settings to initialize with.
   */
  constructor(settings?: Partial<ISettings>) {
    this.settings = {
      frontmatter_fields: [
        'id',
        'title',
        'author',
        'date',
        'pubDatetime',
        'modDatetime',
        'slug',
        'excerpt:description',
        'categories',
        'taxonomy:group',
        'tags',
        'coverImage:heroImage',
      ],
      image_file_request_delay: 500,
      image_download_timeout: 30000,
      markdown_file_write_delay: 25,
      include_time_with_date: true,
      custom_date_formatting: '',
      custom_date_timezone: 'utc',
      filter_categories: ['uncategorized'],
      strict_ssl: true,
      ...settings,
    };
  }

  /**
   * Gets the current settings.
   * @returns The current settings.
   */
  public getSettings(): ISettings {
    return { ...this.settings };
  }

  /**
   * Updates the settings.
   * @param settings - Partial settings to update.
   */
  public updateSettings(settings: Partial<ISettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Updates settings from a configuration object.
   * @param config - Configuration object.
   */
  public updateFromConfig(config: IConfig): void {
    // Map config properties to settings
    const settingsUpdate: Partial<ISettings> = {};
    
    // Only add properties that exist in the config
    if (typeof config.imageRequestDelay === 'number') {
      settingsUpdate.image_file_request_delay = config.imageRequestDelay;
    }
    
    if (typeof config.imageDownloadTimeout === 'number') {
      settingsUpdate.image_download_timeout = config.imageDownloadTimeout;
    }
    
    if (typeof config.markdownWriteDelay === 'number') {
      settingsUpdate.markdown_file_write_delay = config.markdownWriteDelay;
    }
    
    if (typeof config.includeTimeWithDate === 'boolean') {
      settingsUpdate.include_time_with_date = config.includeTimeWithDate;
    }
    
    if (typeof config.customDateFormatting === 'string') {
      settingsUpdate.custom_date_formatting = config.customDateFormatting;
    }
    
    if (typeof config.customDateTimezone === 'string') {
      settingsUpdate.custom_date_timezone = config.customDateTimezone;
    }
    
    if (typeof config.strictSsl === 'boolean') {
      settingsUpdate.strict_ssl = config.strictSsl;
    }

    // Apply the settings update directly
    this.updateSettings(settingsUpdate);
  }
}

/**
 * Facade service that orchestrates the configuration process.
 */
export class ConfigService {
  private readonly optionRepository: OptionRepository;
  private readonly commandLineService: CommandLineService;
  private readonly wizardService: WizardService;
  private readonly settingsService: SettingsService;

  /**
   * Creates an instance of ConfigService.
   * @param optionRepository - Repository for configuration options
   * @param commandLineService - Service for handling command line arguments
   * @param wizardService - Service for handling the interactive wizard
   * @param settingsService - Service for managing application settings
   */
  constructor(
    optionRepository: OptionRepository,
    commandLineService: CommandLineService,
    wizardService: WizardService,
    settingsService: SettingsService
  ) {
    this.optionRepository = optionRepository;
    this.commandLineService = commandLineService;
    this.wizardService = wizardService;
    this.settingsService = settingsService;
  }

  /**
   * Gets configuration from command line arguments or wizard.
   * @param argv - Command line arguments
   * @returns Configuration object
   * @throws {ConfigurationError} When configuration fails
   */
  public async getConfig(argv: string[]): Promise<IConfig> {
    try {
      this.optionRepository.extendOptionsData();
      const unaliasedArgv = this.commandLineService.replaceAliases(argv);
      const program = this.commandLineService.parseCommandLine(unaliasedArgv);
      const config = await this.wizardService.runWizard(program);
      
      // Update settings from config
      this.settingsService.updateFromConfig(config);
      
      return config;
    } catch (error) {
      throw new ConfigurationError('Failed to get configuration', error);
    }
  }

  /**
   * Gets the current settings.
   * @returns The current settings.
   */
  public getSettings(): ISettings {
    return this.settingsService.getSettings();
  }

  /**
   * Updates the settings.
   * @param settings - Partial settings to update.
   */
  public updateSettings(settings: Partial<ISettings>): void {
    this.settingsService.updateSettings(settings);
  }
}

// Create instances of services
const validationService = new ValidationService();
const coercionService = new CoercionService();
const optionRepository = new OptionRepository(validationService, coercionService);
const commandLineService = new CommandLineService(optionRepository, '../../../package.json');
const wizardService = new WizardService(optionRepository);
const settingsService = new SettingsService();
const configService = new ConfigService(
  optionRepository,
  commandLineService,
  wizardService,
  settingsService
);

// Export the singleton instance
export default configService;
