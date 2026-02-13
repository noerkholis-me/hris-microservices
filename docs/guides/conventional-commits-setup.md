# Conventional Commits Setup - Complete ✅

This document confirms the conventional commits setup for the HRIS Microservices project.

## 📦 Installed Tools

All required tools are installed and configured:

- ✅ **@commitlint/cli** (v20.4.1) - Validates commit messages
- ✅ **@commitlint/config-conventional** (v20.4.1) - Conventional commits rules
- ✅ **commitizen** (v4.3.1) - Interactive commit helper
- ✅ **cz-conventional-changelog** (v3.3.0) - Commitizen adapter
- ✅ **husky** (v8.0.0) - Git hooks manager
- ✅ **lint-staged** (v16.2.7) - Run linters on staged files

## 🔧 Configuration Files

### 1. commitlint.config.js
Defines commit message rules and allowed types/scopes for the HRIS project.

**Location**: `./commitlint.config.js`

**Allowed Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Allowed Scopes**: 
- Services: `auth`, `employee`, `attendance`, `leave`, `payroll`, `notification`, `gateway`
- Apps: `web`
- Packages: `common`, `contracts`, `events`, `eslint-config`, `ts-config`, `prettier-config`
- Infrastructure: `docker`, `prisma`, `turborepo`, `deps`, `ci`
- Others: `migration`, `seed`, `e2e`, `unit`, `integration`, `readme`, `adr`, `api-docs`

### 2. .gitmessage
Git commit message template with helpful reminders.

**Location**: `./.gitmessage`

**Configured**: ✅ `git config commit.template .gitmessage`

### 3. .husky/commit-msg
Git hook that validates commit messages before they're accepted.

**Location**: `./.husky/commit-msg`

**Action**: Runs `commitlint` on every commit

### 4. .husky/pre-commit
Git hook that runs before commit to format and lint staged files.

**Location**: `./.husky/pre-commit`

**Action**: Runs `lint-staged` to format and lint files

### 5. .lintstagedrc.json
Configuration for lint-staged to format and lint files before commit.

**Location**: `./.lintstagedrc.json`

**Actions**:
- TypeScript/JavaScript files: ESLint + Prettier
- JSON/Markdown/YAML files: Prettier

### 6. package.json
Commitizen configuration for interactive commits.

**Script**: `npm run commit` - Interactive commit helper

## 🚀 How to Use

### Method 1: Interactive Commit (Recommended for Beginners)

```bash
# Stage your changes
git add .

# Use interactive commit helper
npm run commit
```

This will guide you through:
1. Selecting commit type
2. Entering scope
3. Writing subject
4. Adding body (optional)
5. Referencing issues (optional)
6. Marking breaking changes (optional)

### Method 2: Manual Commit (For Experienced Users)

```bash
# Stage your changes
git add .

# Commit with conventional format
git commit -m "feat(auth): add password reset endpoint"
```

The commit template will appear if you use `git commit` without `-m`.

### Method 3: Using VS Code Extension

Install the **Conventional Commits** extension:

```bash
code --install-extension vivaxy.vscode-conventional-commits
```

Then use the command palette (Ctrl+Shift+P) and search for "Conventional Commits".

## ✅ What Happens on Commit

### Pre-commit Hook
1. **Lint-staged** runs automatically
2. Formats code with **Prettier**
3. Lints code with **ESLint**
4. Fixes auto-fixable issues

### Commit-msg Hook
1. **Commitlint** validates your commit message
2. Checks if type is allowed
3. Checks if scope is allowed
4. Validates format and length
5. Rejects commit if validation fails

## 🧪 Testing the Setup

### Test 1: Valid Commit

```bash
# This should PASS
git commit -m "feat(auth): add login endpoint"
```

Expected: ✅ Commit accepted

### Test 2: Invalid Type

```bash
# This should FAIL
git commit -m "feature(auth): add login endpoint"
```

Expected: ❌ Commit rejected - "feature" is not a valid type

### Test 3: Invalid Scope

```bash
# This should FAIL
git commit -m "feat(authentication): add login endpoint"
```

Expected: ❌ Commit rejected - "authentication" is not a valid scope (use "auth")

### Test 4: Missing Subject

```bash
# This should FAIL
git commit -m "feat(auth):"
```

Expected: ❌ Commit rejected - subject is required

### Test 5: Subject Too Long

```bash
# This should FAIL
git commit -m "feat(auth): implement comprehensive authentication system with multiple providers and advanced security features"
```

Expected: ❌ Commit rejected - subject exceeds 100 characters

## 📚 Quick Reference

### Common Commit Patterns

```bash
# New feature
feat(employee): add bulk import from CSV

# Bug fix
fix(payroll): correct overtime calculation

# Documentation
docs(readme): update setup instructions

# Refactoring
refactor(auth): extract validation logic

# Tests
test(leave): add approval workflow tests

# Dependencies
chore(deps): update NestJS to v10.3.0

# Breaking change
feat(auth)!: change JWT payload structure

BREAKING CHANGE: JWT now uses roles array instead of role string
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Rules**:
- Type: lowercase, from allowed list
- Scope: lowercase, from allowed list
- Subject: lowercase, imperative mood, max 100 chars, no period
- Body: optional, wrap at 72 chars
- Footer: optional, reference issues or breaking changes

## 🔍 Troubleshooting

### Husky hooks not running

```bash
# Reinstall husky
npm run prepare
```

### Commitlint not validating

```bash
# Test commitlint manually
echo "feat(auth): test commit" | npx commitlint
```

### Lint-staged not running

```bash
# Test lint-staged manually
npx lint-staged
```

### Git template not showing

```bash
# Reconfigure git template
git config commit.template .gitmessage

# Verify configuration
git config commit.template
```

## 📖 Documentation

For detailed information, see:

- **Full Guide**: [docs/guides/conventional-commits.md](./docs/guides/conventional-commits.md)
- **Quick Reference**: [docs/guides/conventional-commits-cheatsheet.md](./docs/guides/conventional-commits-cheatsheet.md)

## 🎯 Next Steps

1. **Practice**: Try making a few commits to get familiar with the format
2. **Share**: Make sure all team members read the documentation
3. **Enforce**: The hooks will automatically enforce the rules
4. **Review**: Check commit history regularly to ensure compliance

## ✨ Benefits

With this setup, you get:

- ✅ **Automated validation** - Invalid commits are rejected
- ✅ **Consistent formatting** - All code is auto-formatted
- ✅ **Clean history** - Easy to read and understand
- ✅ **Automated changelogs** - Generate from commit history
- ✅ **Semantic versioning** - Determine version bumps automatically
- ✅ **Better collaboration** - Clear communication through commits

---

**Setup completed on**: 2026-02-13

**Status**: ✅ Ready to use

**Team**: Start using conventional commits for all new commits!
