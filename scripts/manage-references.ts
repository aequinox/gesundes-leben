#!/usr/bin/env bun

/**
 * Reference Management CLI Tool
 * Comprehensive tool for managing scientific references
 */

import { writeFile } from "node:fs/promises";

import {
  getAllReferences,
  getReferenceById,
  searchReferences,
  getReferenceStats,
  createReference,
  // updateReference, // Unused in current implementation
  deleteReference,
  generateReferenceId,
  validateReferenceData,
  findDuplicateReferences,
  type ReferenceData,
  type ReferenceType,
  type ReferenceSearchOptions,
} from "../src/utils/references";

// CLI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

// Reference templates
const templates: Record<ReferenceType, Partial<ReferenceData>> = {
  journal: {
    type: "journal",
    title: "",
    authors: [],
    year: new Date().getFullYear(),
    journal: "",
    volume: undefined,
    issue: undefined,
    pages: "",
    doi: "",
    keywords: [],
    abstract: "",
  },
  website: {
    type: "website",
    title: "",
    authors: [],
    year: new Date().getFullYear(),
    url: "",
    keywords: [],
    abstract: "",
  },
  book: {
    type: "book",
    title: "",
    authors: [],
    year: new Date().getFullYear(),
    publisher: "",
    location: "",
    edition: "",
    isbn: "",
    keywords: [],
    abstract: "",
  },
  report: {
    // Add properties for report type here
    type: "report",
    title: "",
    authors: [],
    year: new Date().getFullYear(),
    // Add other properties as needed
  },
  other: {
    // Add properties for other type here
    type: "other",
    title: "",
    authors: [],
    year: new Date().getFullYear(),
    // Add other properties as needed
  },
};

// Interactive prompts
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    console.log(`${question  } `);
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function promptArray(question: string): Promise<string[]> {
  const input = await prompt(`${question  } (comma-separated)`);
  return input
    .split(",")
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

async function promptNumber(question: string): Promise<number | undefined> {
  const input = await prompt(`${question  } (optional)`);
  if (!input) {return undefined;}
  const num = parseInt(input, 10);
  return isNaN(num) ? undefined : num;
}

// Commands
async function listReferences(options: { type?: ReferenceType; limit?: number } = {}) {
  console.log(colorize("📚 References List", "bright"));
  console.log("");

  const references = await getAllReferences();
  let filtered = references;

  if (options.type) {
    filtered = references.filter(ref => ref.type === options.type);
  }

  if (options.limit !== undefined) {
    filtered = filtered.slice(0, options.limit);
  }

  filtered.forEach(ref => {
    const typeIcon = ref.type === "journal" ? "📄" : ref.type === "book" ? "📖" : "🌐";
    const authorsStr = ref.authors.slice(0, 2).join(", ") + (ref.authors.length > 2 ? " et al." : "");
    
    console.log(`${typeIcon} ${colorize(ref.id, "cyan")}`);
    console.log(`   ${colorize(ref.title, "bright")} (${ref.year})`);
    console.log(`   ${authorsStr}`);
    if (ref.journal !== undefined) {console.log(`   ${colorize(ref.journal, "magenta")}`);}
    console.log("");
  });

  console.log(colorize(`Total: ${filtered.length} references`, "blue"));
}

async function showReference(id: string) {
  const ref = await getReferenceById(id);
  
  if (ref === null) {
    console.log(colorize(`❌ Reference not found: ${id}`, "red"));
    return;
  }

  const typeIcon = ref.type === "journal" ? "📄" : ref.type === "book" ? "📖" : "🌐";
  
  console.log(colorize(`${typeIcon} Reference Details`, "bright"));
  console.log("");
  console.log(colorize("ID:", "blue"), ref.id);
  console.log(colorize("Type:", "blue"), ref.type);
  console.log(colorize("Title:", "blue"), ref.title);
  console.log(colorize("Authors:", "blue"), ref.authors.join(", "));
  console.log(colorize("Year:", "blue"), ref.year);
  
  if (ref.journal !== undefined) {console.log(colorize("Journal:", "blue"), ref.journal);}
  if (ref.volume !== undefined) {console.log(colorize("Volume:", "blue"), ref.volume);}
  if (ref.issue !== undefined) {console.log(colorize("Issue:", "blue"), ref.issue);}
  if (ref.pages !== undefined) {console.log(colorize("Pages:", "blue"), ref.pages);}
  if (ref.doi !== undefined) {console.log(colorize("DOI:", "blue"), ref.doi);}
  if (ref.publisher !== undefined) {console.log(colorize("Publisher:", "blue"), ref.publisher);}
  if (ref.location !== undefined) {console.log(colorize("Location:", "blue"), ref.location);}
  if (ref.edition !== undefined) {console.log(colorize("Edition:", "blue"), ref.edition);}
  if (ref.isbn !== undefined) {console.log(colorize("ISBN:", "blue"), ref.isbn);}
  if (ref.url !== undefined) {console.log(colorize("URL:", "blue"), ref.url);}
  if (ref.pmid !== undefined) {console.log(colorize("PMID:", "blue"), ref.pmid);}
  
  if (ref.keywords !== undefined && ref.keywords.length > 0) {
    console.log(colorize("Keywords:", "blue"), ref.keywords.join(", "));
  }
  
  if (ref.abstract !== undefined) {
    console.log(colorize("Abstract:", "blue"));
    console.log(`   ${ref.abstract}`);
  }
}

async function searchReferencesCommand(query: string, options: { type?: ReferenceType; limit?: number } = {}) {
  console.log(colorize(`🔍 Searching for: "${query}"`, "bright"));
  console.log("");

  const searchOptions: ReferenceSearchOptions = {
    title: query,
    limit: options.limit ?? 10,
  };

  if (options.type) {
    searchOptions.type = options.type;
  }

  const results = await searchReferences(searchOptions);
  
  if (results.length === 0) {
    console.log(colorize("No references found matching the query.", "yellow"));
    return;
  }

  results.forEach(ref => {
    const typeIcon = ref.type === "journal" ? "📄" : ref.type === "book" ? "📖" : "🌐";
    const authorsStr = ref.authors.slice(0, 2).join(", ") + (ref.authors.length > 2 ? " et al." : "");
    
    console.log(`${typeIcon} ${colorize(ref.id, "cyan")}`);
    console.log(`   ${colorize(ref.title, "bright")} (${ref.year})`);
    console.log(`   ${authorsStr}`);
    console.log("");
  });

  console.log(colorize(`Found: ${results.length} references`, "blue"));
}

async function addReference(type?: ReferenceType) {
  console.log(colorize("➕ Add New Reference", "bright"));
  console.log("");

  // Get reference type
  if (!type) {
    console.log("Available types: journal, website, book");
    const typeInput = await prompt("Reference type:");
    if (!["journal", "website", "book"].includes(typeInput)) {
      console.log(colorize("❌ Invalid type. Must be 'journal', 'website', or 'book'", "red"));
      return;
    }
    type = typeInput as ReferenceType;
  }

  // Start with template
  const template = { ...templates[type] };
  const data: Partial<ReferenceData> = { ...template };

  // Collect basic information
  data.title = await prompt("Title:");
  if (!data.title) {
    console.log(colorize("❌ Title is required", "red"));
    return;
  }

  data.authors = await promptArray("Authors");
  if (data.authors === undefined || data.authors.length === 0) {
    console.log(colorize("❌ At least one author is required", "red"));
    return;
  }

  const yearInput = await prompt(`Year (${new Date().getFullYear()}):`);
  data.year = yearInput ? parseInt(yearInput, 10) : new Date().getFullYear();

  // Type-specific fields
  if (type === "journal") {
    data.journal = await prompt("Journal name:");
    data.volume = await promptNumber("Volume");
    data.issue = await promptNumber("Issue");
    data.pages = await prompt("Pages:");
    data.doi = await prompt("DOI:");
  } else if (type === "book") {
    data.publisher = await prompt("Publisher:");
    data.location = await prompt("Location:");
    data.edition = await prompt("Edition:");
    data.isbn = await prompt("ISBN:");
  }

  // Common fields
  data.url = await prompt("URL:");
  data.pmid = await prompt("PMID:");
  data.keywords = await promptArray("Keywords");
  data.abstract = await prompt("Abstract:");

  // Generate ID
  const id = generateReferenceId(data as ReferenceData);
  console.log(colorize(`Generated ID: ${id}`, "blue"));

  const customId = await prompt(`Use custom ID? (current: ${id}):`);
  const finalId = customId ?? id;

  // Validate data
  const errors = validateReferenceData(data as ReferenceData);
  if (errors.length > 0) {
    console.log(colorize("❌ Validation errors:", "red"));
    errors.forEach(error => {
      console.log(`   • ${error.field}: ${error.message}`);
    });
    return;
  }

  try {
    await createReference(finalId, data as ReferenceData);
    console.log(colorize(`✅ Reference created: ${finalId}`, "green"));
  } catch (error) {
    console.log(colorize(`❌ Failed to create reference: ${error}`, "red"));
  }
}

async function deleteReferenceCommand(id: string) {
  const ref = await getReferenceById(id);
  
  if (!ref) {
    console.log(colorize(`❌ Reference not found: ${id}`, "red"));
    return;
  }

  console.log(colorize("🗑️  Delete Reference", "bright"));
  console.log("");
  console.log(colorize("Title:", "blue"), ref.title);
  console.log(colorize("Authors:", "blue"), ref.authors.join(", "));
  console.log(colorize("Year:", "blue"), ref.year);
  console.log("");

  const confirm = await prompt("Are you sure you want to delete this reference? (y/N):");
  
  if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
    console.log(colorize("❌ Deletion cancelled", "yellow"));
    return;
  }

  try {
    await deleteReference(id);
    console.log(colorize(`✅ Reference deleted: ${id}`, "green"));
  } catch (error) {
    console.log(colorize(`❌ Failed to delete reference: ${error}`, "red"));
  }
}

async function showStats() {
  console.log(colorize("📊 Reference Statistics", "bright"));
  console.log("");

  const stats = await getReferenceStats();
  
  console.log(colorize("Overview:", "blue"));
  console.log(`   Total references: ${stats.total}`);
  console.log(`   Average year: ${stats.averageYear}`);
  console.log(`   Year range: ${stats.oldestYear} - ${stats.mostRecentYear}`);
  console.log("");

  console.log(colorize("By Type:", "blue"));
  Object.entries(stats.byType).forEach(([type, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    const icon = type === "journal" ? "📄" : type === "book" ? "📖" : "🌐";
    console.log(`   ${icon} ${type}: ${count} (${percentage}%)`);
  });
  console.log("");

  if (stats.topKeywords.length > 0) {
    console.log(colorize("Top Keywords:", "blue"));
    stats.topKeywords.slice(0, 10).forEach(({ keyword, count }) => {
      console.log(`   ${keyword}: ${count}`);
    });
    console.log("");
  }

  if (stats.topAuthors.length > 0) {
    console.log(colorize("Top Authors:", "blue"));
    stats.topAuthors.slice(0, 10).forEach(({ author, count }) => {
      console.log(`   ${author}: ${count}`);
    });
  }
}

async function checkDuplicates() {
  console.log(colorize("🔍 Checking for Duplicates", "bright"));
  console.log("");

  const duplicates = await findDuplicateReferences();
  
  if (duplicates.length === 0) {
    console.log(colorize("✅ No duplicates found!", "green"));
    return;
  }

  duplicates.forEach((group, index) => {
    console.log(colorize(`Group ${index + 1}: ${group.reason}`, "yellow"));
    group.references.forEach(ref => {
      console.log(`   • ${colorize(ref.id, "cyan")}: "${ref.title}" (${ref.year})`);
    });
    console.log("");
  });

  console.log(colorize(`Found ${duplicates.length} potential duplicate groups`, "red"));
}

async function exportReferences(format: "json" | "csv" | "bibtex" = "json") {
  console.log(colorize(`📤 Exporting References (${format.toUpperCase()})`, "bright"));
  
  const references = await getAllReferences();
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `references-export-${timestamp}.${format}`;
  
  let content: string;
  
  if (format === "json") {
    content = JSON.stringify(references, null, 2);
  } else if (format === "csv") {
    const headers = ["id", "type", "title", "authors", "year", "journal", "publisher", "doi", "url"];
    const csvRows = [headers.join(",")];
    
    references.forEach(ref => {
      const row = headers.map(header => {
        let value = ref[header as keyof typeof ref];
        if (Array.isArray(value)) {value = value.join("; ");}
        if (typeof value === "string") {value = `"${value.replace(/"/g, '""')}"`;}
        return value ?? "";
      });
      csvRows.push(row.join(","));
    });
    
    content = csvRows.join("\n");
  } else if (format === "bibtex") {
    const bibtexEntries = references.map(ref => {
      const type = ref.type === "journal" ? "article" : ref.type === "book" ? "book" : "misc";
      const authors = ref.authors.join(" and ");
      
      let entry = `@${type}{${ref.id},\n`;
      entry += `  title = {${ref.title}},\n`;
      entry += `  author = {${authors}},\n`;
      entry += `  year = {${ref.year}},\n`;
      
      if (ref.journal !== undefined) {entry += `  journal = {${ref.journal}},\n`;}
      if (ref.volume !== undefined) {entry += `  volume = {${ref.volume}},\n`;}
      if (ref.issue !== undefined) {entry += `  number = {${ref.issue}},\n`;}
      if (ref.pages !== undefined) {entry += `  pages = {${ref.pages}},\n`;}
      if (ref.doi !== undefined) {entry += `  doi = {${ref.doi}},\n`;}
      if (ref.publisher !== undefined) {entry += `  publisher = {${ref.publisher}},\n`;}
      if (ref.url !== undefined) {entry += `  url = {${ref.url}},\n`;}
      
      entry += "}";
      return entry;
    });
    
    content = bibtexEntries.join("\n\n");
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }
  
  await writeFile(filename, content, "utf8");
  console.log(colorize(`✅ Export completed: ${filename}`, "green"));
}

// CLI interface
function showHelp() {
  console.log(`
${colorize("📚 Reference Management CLI", "bright")}

${colorize("Usage:", "blue")} bun run scripts/manage-references.ts <command> [options]

${colorize("Commands:", "blue")}
  ${colorize("list", "green")} [--type TYPE] [--limit N]    List references
  ${colorize("show", "green")} <id>                         Show reference details
  ${colorize("search", "green")} <query> [--type TYPE]      Search references
  ${colorize("add", "green")} [--type TYPE]                Add new reference
  ${colorize("delete", "green")} <id>                      Delete reference
  ${colorize("stats", "green")}                            Show statistics
  ${colorize("duplicates", "green")}                       Check for duplicates
  ${colorize("export", "green")} [--format FORMAT]         Export references
  ${colorize("help", "green")}                             Show this help

${colorize("Options:", "blue")}
  --type TYPE      Filter by type (journal, website, book)
  --limit N        Limit number of results
  --format FORMAT  Export format (json, csv, bibtex)

${colorize("Examples:", "blue")}
  bun run scripts/manage-references.ts list --type journal --limit 10
  bun run scripts/manage-references.ts search "vitamin c" --type journal
  bun run scripts/manage-references.ts add --type journal
  bun run scripts/manage-references.ts show 2022-levy-vitamin-c-benefits
  bun run scripts/manage-references.ts export --format bibtex
  `);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Parse options
  const options: Record<string, string | number | boolean> = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith("--")) {
        options[key] = isNaN(Number(value)) ? value : Number(value);
        i++; // Skip next arg since it's the value
      } else {
        options[key] = true;
      }
    }
  }

  try {
    switch (command) {
      case "list":
        await listReferences({
          type: options.type as ReferenceType,
          limit: options.limit as number,
        });
        break;
        
      case "show":
        if (!args[1]) {
          console.log(colorize("❌ Reference ID required", "red"));
          process.exit(1);
        }
        await showReference(args[1]);
        break;
        
      case "search":
        if (!args[1]) {
          console.log(colorize("❌ Search query required", "red"));
          process.exit(1);
        }
        await searchReferencesCommand(args[1], {
          type: options.type as ReferenceType,
          limit: options.limit as number,
        });
        break;
        
      case "add":
        await addReference(options.type as ReferenceType);
        break;
        
      case "delete":
        if (!args[1]) {
          console.log(colorize("❌ Reference ID required", "red"));
          process.exit(1);
        }
        await deleteReferenceCommand(args[1]);
        break;
        
      case "stats":
        await showStats();
        break;
        
      case "duplicates":
        await checkDuplicates();
        break;
        
      case "export":
        const format = (options.format as string) || "json";
        if (!["json", "csv", "bibtex"].includes(format)) {
          console.log(colorize("❌ Invalid format. Use: json, csv, bibtex", "red"));
          process.exit(1);
        }
        await exportReferences(format as "json" | "csv" | "bibtex");
        break;
        
      case "help":
      case command:
        showHelp();
        break;
        
      default:
        console.log(colorize(`❌ Unknown command: ${command}`, "red"));
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.log(colorize(`❌ Error: ${error}`, "red"));
    process.exit(1);
  }
}

if (import.meta.main) {
  // Setup stdin for interactive prompts
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  
  void main().finally(() => {
    process.stdin.pause();
  });
}