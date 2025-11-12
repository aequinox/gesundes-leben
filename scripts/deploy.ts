#!/usr/bin/env bun
import { execSync } from "child_process";
import { existsSync } from "fs";

interface DeployConfig {
  remote: string;
  branch: string;
  buildDir: string;
  requireClean: boolean;
  runTests: boolean;
  dryRun: boolean;
}

const config: DeployConfig = {
  remote: "github",
  branch: "gh-pages",
  buildDir: "dist",
  requireClean: true,
  runTests: !process.argv.includes("--skip-tests"),
  dryRun: process.argv.includes("--dry-run"),
};

/**
 * Execute a shell command and return output
 * @param command Shell command to execute
 * @returns Command output
 */
function exec(command: string): string {
  try {
    return execSync(command, { encoding: "utf-8", stdio: "pipe" });
  } catch (error) {
    const err = error as Error & { stderr?: string };
    throw new Error(`Command failed: ${command}\n${err.stderr || err.message}`);
  }
}

/**
 * Execute a shell command with live output
 * @param command Shell command to execute
 */
function execLive(command: string): void {
  try {
    execSync(command, { encoding: "utf-8", stdio: "inherit" });
  } catch (error) {
    throw new Error(`Command failed: ${command}`);
  }
}

/**
 * Check if the git working tree is clean
 * @throws Error if working tree has uncommitted changes
 */
function checkWorkingTreeClean(): void {
  const status = exec("git status --porcelain");
  if (status.trim() && config.requireClean) {
    console.error("❌ Working tree not clean. Commit or stash changes first.");
    console.log("\nUncommitted changes:");
    console.log(status);
    throw new Error("Working tree not clean");
  }
}

/**
 * Get the current git branch name
 * @returns Current branch name
 */
function getCurrentBranch(): string {
  return exec("git branch --show-current").trim();
}

/**
 * Get the current git commit SHA
 * @returns Short commit SHA (7 characters)
 */
function getCommitSHA(): string {
  return exec("git rev-parse HEAD").trim().slice(0, 7);
}

/**
 * Check if a git branch exists
 * @param branchName Branch name to check
 * @returns True if branch exists
 */
function branchExists(branchName: string): boolean {
  try {
    exec(`git rev-parse --verify ${branchName}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Main deployment function
 */
async function deployToGitHub(): Promise<void> {
  console.log("🚀 Starting deployment process...\n");

  const originalBranch = getCurrentBranch();
  const timestamp = new Date().toISOString();
  const commitSHA = getCommitSHA();

  if (config.dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be pushed\n");
  }

  try {
    // Step 1: Pre-deployment checks
    console.log("📋 Step 1/9: Checking working tree...");
    checkWorkingTreeClean();
    console.log("   ✅ Working tree is clean\n");

    // Step 2: Verify build directory exists
    console.log("📋 Step 2/9: Verifying build directory...");
    if (!existsSync(config.buildDir)) {
      throw new Error(
        `Build directory '${config.buildDir}' not found. Run 'bun run build' first.`
      );
    }
    console.log(`   ✅ Build directory '${config.buildDir}' exists\n`);

    // Step 3: Run tests if configured
    if (config.runTests) {
      console.log("📋 Step 3/9: Running tests...");
      execLive("bun run test:run");
      console.log("   ✅ All tests passed\n");
    } else {
      console.log("📋 Step 3/9: Skipping tests (--skip-tests flag)\n");
    }

    // Step 4: Build project
    console.log("📋 Step 4/9: Building project...");
    execLive("bun run build");
    console.log("   ✅ Build completed successfully\n");

    // Step 5: Cleanup old deployment branch if exists
    console.log(`📋 Step 5/9: Cleaning up old ${config.branch} branch...`);
    if (branchExists(config.branch)) {
      exec(`git branch -D ${config.branch}`);
      console.log(`   ✅ Deleted old ${config.branch} branch\n`);
    } else {
      console.log(`   ℹ️  No existing ${config.branch} branch to clean up\n`);
    }

    // Step 6: Create orphan branch
    console.log(`📋 Step 6/9: Creating ${config.branch} branch...`);
    exec(`git checkout --orphan ${config.branch}`);
    console.log(`   ✅ Created orphan branch ${config.branch}\n`);

    // Step 7: Add built files
    console.log("📋 Step 7/9: Adding built files...");
    exec(`git --work-tree ${config.buildDir} add --all`);
    const filesAdded = exec(
      `git --work-tree ${config.buildDir} diff --cached --numstat | wc -l`
    ).trim();
    console.log(`   ✅ Added ${filesAdded} files from ${config.buildDir}\n`);

    // Step 8: Commit with metadata
    console.log("📋 Step 8/9: Creating deployment commit...");
    const commitMessage = [
      `Deploy: ${commitSHA} at ${timestamp}`,
      "",
      `Deployed from: ${originalBranch}`,
      `Build directory: ${config.buildDir}`,
      `Tests run: ${config.runTests ? "yes" : "no"}`,
    ].join("\n");

    exec(`git --work-tree ${config.buildDir} commit -m "${commitMessage}"`);
    console.log("   ✅ Created deployment commit\n");

    // Step 9: Push to remote
    console.log(`📋 Step 9/9: Pushing to ${config.remote}/${config.branch}...`);
    if (config.dryRun) {
      console.log(
        `   🔍 DRY RUN: Would push to ${config.remote} ${config.branch} --force\n`
      );
    } else {
      exec(`git push ${config.remote} ${config.branch} --force`);
      console.log(
        `   ✅ Pushed to ${config.remote}/${config.branch} successfully\n`
      );
    }

    console.log("═".repeat(60));
    console.log("✅ DEPLOYMENT SUCCESSFUL!");
    console.log("═".repeat(60));
    console.log(`📦 Commit SHA: ${commitSHA}`);
    console.log(`🌿 Branch: ${originalBranch}`);
    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`🎯 Remote: ${config.remote}/${config.branch}`);
    if (config.dryRun) {
      console.log("🔍 Mode: DRY RUN (no changes pushed)");
    }
    console.log("═".repeat(60) + "\n");
  } catch (error) {
    console.error("\n" + "═".repeat(60));
    console.error("❌ DEPLOYMENT FAILED");
    console.error("═".repeat(60));
    console.error(error instanceof Error ? error.message : String(error));
    console.error("═".repeat(60) + "\n");
    process.exit(1);
  } finally {
    // Always cleanup - return to original branch
    console.log("🧹 Cleaning up...");
    try {
      exec(`git checkout -f ${originalBranch}`);
      console.log(`   ✅ Returned to ${originalBranch} branch`);

      if (branchExists(config.branch)) {
        exec(`git branch -D ${config.branch}`);
        console.log(`   ✅ Deleted ${config.branch} branch`);
      }
      console.log("");
    } catch (error) {
      console.error(
        "   ⚠️  Warning: Could not complete cleanup. Manual intervention may be needed."
      );
      console.error(
        `   Run: git checkout ${originalBranch} && git branch -D ${config.branch}\n`
      );
    }
  }
}

// Help message
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Usage: bun run scripts/deploy.ts [options]

Options:
  --skip-tests    Skip running tests before deployment
  --dry-run       Run deployment process without pushing to remote
  -h, --help      Show this help message

Examples:
  bun run deploy              # Full deployment with tests
  bun run deploy:skip-tests   # Deploy without running tests
  bun run deploy:dry-run      # Test deployment process without pushing
`);
  process.exit(0);
}

// Run deployment
deployToGitHub();
