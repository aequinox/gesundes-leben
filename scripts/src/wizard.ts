import camelcase from 'camelcase';
import commander from 'commander';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { ConversionError } from './errors';
import logger from './logger';

/**
 * Enum representing the different types of configuration options.
 */
export enum OptionType {
  BOOLEAN = 'boolean',
  FILE = 'file',
  FOLDER = 'folder',
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
      logger.error('Error validating file:', error);
      return `Error validating file: ${path.resolve(value)}`;
    }
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
      logger.error('Failed to load package.json', error);
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
      logger.info('Starting wizard...');
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
      logger.info('Skipping wizard...');
      return program.opts() as IConfig;
    }
  }
}

/**
 * Facade service that orchestrates the configuration process.
 */
export class ConfigurationService {
  private readonly optionRepository: OptionRepository;
  private readonly commandLineService: CommandLineService;
  private readonly wizardService: WizardService;

  /**
   * Creates an instance of ConfigurationService.
   * @param optionRepository - Repository for configuration options
   * @param commandLineService - Service for handling command line arguments
   * @param wizardService - Service for handling the interactive wizard
   */
  constructor(
    optionRepository: OptionRepository,
    commandLineService: CommandLineService,
    wizardService: WizardService
  ) {
    this.optionRepository = optionRepository;
    this.commandLineService = commandLineService;
    this.wizardService = wizardService;
  }

  /**
   * Gets configuration from command line arguments or wizard.
   * @param argv - Command line arguments
   * @returns Configuration object
   * @throws {ConversionError} When configuration fails
   */
  public async getConfig(argv: string[]): Promise<IConfig> {
    try {
      this.optionRepository.extendOptionsData();
      const unaliasedArgv = this.commandLineService.replaceAliases(argv);
      const program = this.commandLineService.parseCommandLine(unaliasedArgv);
      return await this.wizardService.runWizard(program);
    } catch (error) {
      throw new ConversionError('Failed to get configuration', error);
    }
  }
}

// Create instances of services
const validationService = new ValidationService();
const coercionService = new CoercionService();
const optionRepository = new OptionRepository(validationService, coercionService);
const commandLineService = new CommandLineService(optionRepository, '../package.json');
const wizardService = new WizardService(optionRepository);
const configurationService = new ConfigurationService(
  optionRepository,
  commandLineService,
  wizardService
);

/**
 * Get configuration from command line arguments or wizard.
 * @param argv - Command line arguments
 * @returns Configuration object
 * @throws {ConversionError} When configuration fails
 */
export async function getConfig(argv: string[]): Promise<IConfig> {
  return configurationService.getConfig(argv);
}
