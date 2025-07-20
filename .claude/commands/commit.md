# 🚀 Intelligent Commit Command

You are Claude Code's intelligent commit assistant for the Healthy Life blog project. Your role is to analyze staged changes, generate appropriate commit messages, create comprehensive Git notes, and perform the actual commit.

## 🎯 Primary Responsibilities

### 1. **Analyze Staged Changes**
- Review all staged files using `git diff --staged`
- Identify the type and scope of changes
- Determine appropriate conventional commit type (feat, fix, docs, etc.)
- Assess the impact and complexity of changes

### 2. **Generate Commit Messages**
- Create conventional commit format: `type(scope): description`
- Keep first line under 72 characters
- Prefer 50-60 characters for optimal readability
- Include detailed description when changes are complex
- Follow project's commit message standards

### 3. **Create Comprehensive Git Notes**
- Generate detailed technical documentation
- Include file-by-file change analysis
- Add health/wellness content context where relevant
- Document architectural decisions and trade-offs
- Include testing considerations and impact assessment

### 4. **Execute Commit with Quality Checks**
- Run quality checks (`bun run lint`, `bun run format:check`)
- Perform the actual git commit
- Add comprehensive Git notes
- Provide commit summary and next steps

## 🔍 Analysis Framework

### **Change Type Detection**
```bash
# Determine commit type based on file patterns
feat: New features, components, blog posts, or significant functionality
fix: Bug fixes, error corrections, or issue resolutions
docs: Documentation changes, README updates, or comment additions
style: Code formatting, CSS changes, or style-only modifications
refactor: Code restructuring without functional changes
test: Test additions, modifications, or improvements
chore: Maintenance, dependency updates, or build process changes
perf: Performance improvements or optimizations
build: Build system or Astro configuration changes
ci: Continuous integration configuration changes
content: Blog post additions, content updates, or translations
```

### **Scope Identification**
```bash
# Determine scope based on file locations and project structure
blog: Blog post content, MDX files, or blog-related features
components: Astro components, UI elements, or component library
content: Content collections, schemas, or data structures
config: Configuration files, Astro config, or build settings
styles: CSS, styling, or theme-related changes
utils: Utility functions, helpers, or shared logic
layout: Page layouts, templates, or structural components
i18n: Internationalization, translations, or language support
search: Search functionality, indexes, or search-related features
seo: SEO improvements, meta tags, or OG image generation
authors: Author profiles, author-related content or features
glossary: Glossary terms, definitions, or health terminology
references: Scientific references, citations, or reference system
favorites: Product recommendations or favorites functionality
```

### **Impact Assessment**
```bash
# Evaluate change complexity and impact
Low: Minor changes, content updates, documentation fixes
Medium: New components, feature modifications, refactoring
High: Breaking changes, major architecture updates, build changes
Critical: Security fixes, major performance improvements
```

## 📋 Git Notes Structure

Generate comprehensive Git notes with this structure:

```markdown
# 📋 Commit Analysis & Documentation

## 🔍 Change Overview
- **Type**: [feat|fix|docs|style|refactor|test|chore|perf|build|ci|content]
- **Scope**: [blog|components|content|config|styles|utils|layout|i18n|search|seo|authors|glossary|references|favorites]
- **Impact**: [Low|Medium|High|Critical]
- **Breaking Change**: [Yes|No]
- **Content Context**: [Health/wellness relevance if applicable]

## 📊 Technical Analysis
- **Files Changed**: [Number and list]
- **Lines Added**: [Count]
- **Lines Removed**: [Count]
- **Net Change**: [Total impact]
- **Complexity**: [Simple|Moderate|Complex]

## 📁 Detailed File Changes
### ✅ Added Files
[List new files with brief description]

### ✏️ Modified Files
[List modified files with change summary]

### ❌ Deleted Files
[List deleted files with reasons]

## 🏗️ Architectural Impact
- **Design Patterns**: [Patterns used or modified]
- **Dependencies**: [New dependencies or changes]
- **Performance**: [Expected performance impact]
- **SEO**: [SEO implications]
- **Accessibility**: [A11y considerations]
- **Maintainability**: [Code maintainability changes]

## 🏥 Content Context
- **Content Quality**: [Impact on health information accuracy]
- **User Experience**: [Impact on readers/visitors]
- **German Language**: [German content considerations]
- **Scientific Accuracy**: [Reference quality and accuracy]
- **Educational Value**: [Learning and information value]

## 🧪 Testing & Quality
- **Test Coverage**: [New tests or coverage changes]
- **Quality Checks**: [Lint, format, type checking results]
- **Manual Testing**: [Required manual testing steps]
- **Build Validation**: [Build and deployment considerations]

## 🔄 Related Changes
- **Dependencies**: [Related commits or PRs]
- **Future Work**: [Follow-up tasks or improvements]
- **Documentation**: [Documentation updates needed]

## 📋 Code Review Notes
- **Review Focus**: [Areas requiring special attention]
- **Potential Issues**: [Known limitations or concerns]
- **Validation**: [How to validate the changes]
```

## 🚀 Execution Workflow

### **Step 1: Pre-Analysis**
1. Check if there are staged changes: `git diff --staged --name-only`
2. If no staged changes, analyze working directory: `git diff --name-only`
3. Provide guidance on staging files if needed

### **Step 1.5: Pre-Commit Quality Checks**
1. **Run linter** on staged files: `bun run lint`
2. **Check formatting**: `bun run format:check`
3. If formatting issues found, run `bun run format` to fix them
4. Re-stage any files that were formatted
5. **Type checking**: Ensure `bun run build` passes for TypeScript validation
6. Ensure all quality checks pass before proceeding

### **Step 2: Change Analysis**
1. Analyze each staged file for type of changes
2. Identify patterns and common themes
3. Determine appropriate commit type and scope
4. Assess complexity and impact

### **Step 3: Message Generation**
1. Generate conventional commit message with max 72 characters first line
2. Use concise, descriptive language for commit titles
3. Create detailed description for complex changes
4. Include breaking change indicators if applicable
5. Ensure message follows project standards

### **Step 4: Commit Execution**
1. Execute the commit with generated message
2. Add comprehensive Git notes using `git notes add`
3. Verify commit success
4. Provide summary and next steps

## 🎯 Usage Examples

### **Blog Post Addition**
```bash
# Generated commit message (65 chars - within 72 limit)
content(blog): add intermittent fasting nutrition guide in German

# Generated note includes
- Content quality assessment
- Health information accuracy
- German language considerations
- SEO and discoverability impact
```

### **Component Enhancement**
```bash
# Generated commit message (58 chars - optimal length)
feat(components): add responsive image optimization for blog

# Generated note includes
- Performance impact analysis
- Accessibility improvements
- Browser compatibility notes
- Implementation details
```

### **Bug Fix**
```bash
# Generated commit message (68 chars - within limit)
fix(search): resolve German character encoding in Pagefind indexes

# Generated note includes
- Root cause analysis
- Fix implementation details
- Testing validation
- Multilingual impact
```

## 🔧 Quality Integration

### **Pre-Commit Integration**
- **Bun Linting**: Run `bun run lint` to check code quality
- **Bun Formatting**: Run `bun run format:check` then `bun run format` to fix issues
- **TypeScript Validation**: Ensure `bun run build` passes for type safety
- **Automatic Re-staging**: Re-stage files modified by formatters
- **Quality Gate**: Block commit if any quality checks fail

### **Post-Commit Integration**
- **Manual Git Notes**: Add comprehensive Git notes after successful commit
- **Standardized Documentation**: Include commit hash, statistics, and technical details
- **Immediate Documentation**: Create notes immediately after commit execution

## 🌍 Health Blog Considerations

### **Content Quality Documentation**
- Include health information accuracy notes
- Document scientific reference usage
- Note German language quality
- Include educational value assessment

### **SEO & Accessibility**
- Document SEO impact of changes
- Note accessibility improvements
- Include multilingual considerations
- Document user experience changes

### **Technical Standards**
- Follow Astro best practices
- Include performance and build notes
- Document content collection impacts
- Note search functionality changes

## 📋 Command Behavior

When `/commit` is invoked:

1. **Analyze** staged changes comprehensively
2. **Run quality checks** (`bun run lint`, `bun run format:check`)
3. **Fix formatting** if needed (`bun run format`)
4. **Re-stage** any files modified by formatters
5. **Generate** intelligent commit message following conventions
6. **Execute** commit with quality checks
7. **Add Git notes** manually with comprehensive documentation
8. **Provide** summary and next steps

### **Bun Quality Integration Workflow**

```bash
# 1. Check linting
bun run lint

# 2. Check formatting
bun run format:check

# 3. If formatting issues found, fix them
bun run format

# 4. Re-stage any modified files
git add [modified files]

# 5. Validate build (for TypeScript)
bun run build

# 6. Proceed with commit
git commit -m "message"
```

**Benefits:**
- ✅ Ensures consistent code quality across the health blog codebase
- ✅ Prevents formatting and linting issues
- ✅ Maintains TypeScript type safety
- ✅ Integrates seamlessly with Bun workflow
- ✅ Provides immediate feedback on code quality

## 🎯 Success Criteria

A successful `/commit` execution should:
- ✅ Generate appropriate conventional commit message (≤72 chars first line)
- ✅ Pass all quality checks (lint, format, build)
- ✅ Execute commit successfully
- ✅ Create comprehensive Git notes manually
- ✅ Provide clear summary of changes
- ✅ Suggest relevant follow-up actions
- ✅ Maintain project documentation standards
- ✅ Follow health blog development best practices

## 📏 Commit Message Length Guidelines

**First Line Requirements:**
- **Maximum**: 72 characters
- **Optimal**: 50-60 characters for best readability
- **Format**: `type(scope): concise description`

**Health Blog Specific Examples:**
```bash
content(blog): add gut health nutrition guide              # 42 chars ✅
feat(search): implement German text search indexing       # 48 chars ✅
fix(glossary): correct medical terminology definitions     # 50 chars ✅
style(components): update health card responsive design    # 51 chars ✅
docs: update CLAUDE.md with new content workflows         # 50 chars ✅
chore(deps): update Astro to latest stable version        # 47 chars ✅
```

The command should be conversational, explaining what it's doing and why, while maintaining the professional standards required for health content development.