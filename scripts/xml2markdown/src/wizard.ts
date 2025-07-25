import fs from "fs";
import { createRequire } from "module";
import path from "path";

import camelcase from "camelcase";
import { Command } from "commander";
import inquirer from "inquirer";

import { ConversionError } from "./errors.js";
import logger from "./logger.js";
import type { WizardOption, XmlConverterConfig } from "./types.js";

const require = createRequire(import.meta.url);
const pkgJson = require("../package.json");

const options: WizardOption[] = [
  // wizard must always be first
  {
    name: "wizard",
    type: "boolean",
    description: "Use wizard",
    default: true,
  },
  {
    name: "input",
    type: "file",
    description: "Path to WordPress export file",
    default: "export.xml",
  },
  {
    name: "output",
    type: "folder",
    description: "Path to output folder",
    default: "output",
  },
  {
    name: "year-folders",
    aliases: ["yearfolders", "yearmonthfolders"],
    type: "boolean",
    description: "Create year folders",
    default: false,
  },
  {
    name: "month-folders",
    aliases: ["yearmonthfolders"],
    type: "boolean",
    description: "Create month folders",
    default: false,
  },
  {
    name: "post-folders",
    aliases: ["postfolders"],
    type: "boolean",
    description: "Create a folder for each post",
    default: true,
  },
  {
    name: "prefix-date",
    aliases: ["prefixdate"],
    type: "boolean",
    description: "Prefix post folders/files with date",
    default: false,
  },
  {
    name: "save-attached-images",
    aliases: ["saveimages"],
    type: "boolean",
    description: "Save images attached to posts",
    default: true,
  },
  {
    name: "save-scraped-images",
    aliases: ["addcontentimages"],
    type: "boolean",
    description: "Save images scraped from post body content",
    default: true,
  },
  {
    name: "include-other-types",
    type: "boolean",
    description: "Include custom post types and pages",
    default: false,
  },
];

/**
 * Get configuration from command line arguments or wizard
 * @param {string[]} argv - Command line arguments
 * @returns {Promise<XmlConverterConfig>} Configuration object
 * @throws {ConversionError} When configuration fails
 */
async function getConfig(argv: string[]): Promise<XmlConverterConfig> {
  try {
    extendOptionsData();
    const unaliasedArgv = replaceAliases(argv);
    const program = parseCommandLine(unaliasedArgv);

    let answers: Record<string, unknown> = {};
    if (program.wizard) {
      logger.info("\nStarting wizard...");
      const questions = options.map(option => ({
        when: option.name !== "wizard" && !option.isProvided,
        name: camelcase(option.name),
        type: option.prompt,
        message: `${option.description}?`,
        default: option.default,
        filter: option.coerce,
        validate: option.validate,
      }));
      answers = (await inquirer.prompt(questions)) as Record<string, unknown>;
    } else {
      logger.info("\nSkipping wizard...");
    }

    return { ...program.opts(), ...answers } as unknown as XmlConverterConfig;
  } catch (error) {
    throw new ConversionError(
      "Failed to get configuration",
      error as Record<string, unknown>
    );
  }
}

/**
 * Extend options with type-specific data
 */
function extendOptionsData(): void {
  const map = {
    boolean: {
      prompt: "confirm",
      coerce: coerceBoolean,
    },
    file: {
      prompt: "input",
      coerce: coercePath,
      validate: validateFile,
    },
    folder: {
      prompt: "input",
      coerce: coercePath,
    },
  };

  options.forEach(option => {
    Object.assign(option, map[option.type]);
  });
}

/**
 * Replace alias arguments with their primary names
 * @param {string[]} argv - Command line arguments
 * @returns {string[]} Arguments with aliases replaced
 */
function replaceAliases(argv: string[]): string[] {
  const paths = argv.slice(0, 2);
  const replaced: string[] = [];
  const unmodified: string[] = [];

  argv.slice(2).forEach(arg => {
    let aliasFound = false;

    // this loop does not short circuit because an alias can map to multiple options
    options.forEach(option => {
      const aliases = option.aliases || [];
      aliases.forEach(alias => {
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
 * Parse command line arguments
 * @param {string[]} argv - Command line arguments
 * @returns {Command} Parsed command object
 */
function parseCommandLine(argv: string[]): { 
  opts(): Record<string, unknown>; 
  wizard?: boolean;
} {
  // setup for help output
  const program = new Command();
  program
    .name("node index.js")
    .version(`v${pkgJson.version}`, "-v, --version", "Display version number")
    .helpOption("-h, --help", "See the thing you're looking at right now")
    .on("--help", () => {
      logger.info(
        "\nMore documentation is at https://github.com/lonekorean/wordpress-export-to-markdown"
      );
    });

  options.forEach(input => {
    const flag = `--${input.name} <${input.type}>`;
    const coerce = (value: string) => {
      // commander only calls coerce when an input is provided on the command line
      // which makes for an easy way to flag (for later) if it should be excluded from the wizard
      input.isProvided = true;
      return input.coerce!(value);
    };
    program.option(flag, input.description, coerce, input.default);
  });

  program.parse(argv);
  return program;
}

/**
 * Coerce value to boolean
 * @param {string} value - Value to coerce
 * @returns {boolean} Coerced boolean value
 */
function coerceBoolean(value: string): boolean {
  return !["false", "no", "0"].includes(value.toLowerCase());
}

/**
 * Normalize file/folder path
 * @param {string} value - Path to normalize
 * @returns {string} Normalized path
 */
function coercePath(value: string): string {
  return path.normalize(value);
}

/**
 * Validate file exists
 * @param {string} value - File path to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
function validateFile(value: string): boolean | string {
  let isValid: boolean;
  try {
    isValid = fs.existsSync(value) && fs.statSync(value).isFile();
  } catch (_ex) {
    logger.error("Error validating file:", _ex);
    isValid = false;
  }

  return isValid ? true : `Unable to find file: ${path.resolve(value)}`;
}

export { getConfig };
