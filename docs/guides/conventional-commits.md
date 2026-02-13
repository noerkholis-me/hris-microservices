# Conventional Commits Guide

## 📖 Overview

This guide establishes commit message conventions for the HRIS Microservices project using the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Why Conventional Commits?

✅ **Automated Changelogs** - Generate changelogs from commit history  
✅ **Semantic Versioning** - Automatically determine version bumps  
✅ **Better Git History** - Clear, searchable commit messages  
✅ **Team Communication** - Standardized format for all contributors  
✅ **CI/CD Integration** - Trigger builds based on commit types  
✅ **Professional Portfolio** - Shows attention to best practices

---

## 🎯 Commit Message Format

### Basic Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Rules

1. **Header** (required): `<type>(<scope>): <subject>`
   - Max 100 characters
   - Lowercase for type and scope
   - Imperative mood for subject ("add" not "added")
   - No period at the end

2. **Body** (optional):
   - Blank line after header
   - Explain **what** and **why**, not **how**
   - Wrap at 72 characters

3. **Footer** (optional):
   - Reference issues: `Closes #123`
   - Breaking changes: `BREAKING CHANGE: description`

---

## 📋 Commit Types

### Primary Types (Use These Most)

| Type | Description | When to Use | Semver Impact |
|------|-------------|-------------|---------------|
| `feat` | New feature | Add new functionality | MINOR |
| `fix` | Bug fix | Fix a bug | PATCH |
| `docs` | Documentation | Update documentation only | - |
| `refactor` | Code refactoring | Restructure code without changing behavior | - |
| `test` | Tests | Add or update tests | - |
| `chore` | Maintenance | Routine tasks, dependencies | - |

### Secondary Types

| Type | Description | When to Use |
|------|-------------|-------------|
| `style` | Formatting | Code style, formatting, whitespace |
| `perf` | Performance | Performance improvements |
| `build` | Build system | Build scripts, dependencies, Turborepo |
| `ci` | CI/CD | GitHub Actions, deployment scripts |
| `revert` | Revert | Revert a previous commit |

---

## 🎯 Scopes for HRIS Project

### Service Scopes

Use the service name without `-service` suffix:

- `auth` - Authentication & authorization service
- `employee` - Employee management service
- `attendance` - Attendance tracking service
- `leave` - Leave management service
- `payroll` - Payroll processing service
- `notification` - Notification service
- `gateway` - API Gateway

### Application Scopes

- `web` - Next.js frontend application

### Shared Package Scopes

- `common` - Shared utilities package
- `contracts` - DTOs and interfaces package
- `events` - Event definitions package
- `eslint-config` - ESLint configuration
- `ts-config` - TypeScript configuration
- `prettier-config` - Prettier configuration

### Infrastructure Scopes

- `docker` - Docker and docker-compose
- `prisma` - Prisma schemas and migrations
- `turborepo` - Turborepo configuration
- `deps` - Root dependencies
- `ci` - CI/CD pipeline

### Special Scopes

- `*` - Changes affecting multiple scopes
- Leave empty for global changes

---

## 💡 Examples by Type

### `feat` - New Features

```bash
# Add new endpoint
feat(auth): add password reset endpoint

# Add new component
feat(web): add employee profile card component

# Add new service
feat(payroll): implement salary calculation logic

Implement monthly salary calculation including:
- Base salary
- Overtime pay
- Deductions (tax, insurance)
- Allowances and bonuses

# With breaking change
feat(auth)!: change JWT payload structure

BREAKING CHANGE: JWT payload now includes `roles` array instead of single `role` field.
Migration guide: Update client code to read `roles[0]` instead of `role`.
```

### `fix` - Bug Fixes

```bash
# Simple fix
fix(attendance): correct clock-out time calculation

# Detailed fix
fix(leave): prevent negative leave balance

Fixed an issue where approving leave requests could
result in negative balance when the employee has
insufficient days remaining.

Closes #156

# Critical fix
fix(auth): patch JWT token expiration vulnerability

SECURITY: Tokens were not properly validating expiration.
This fix ensures all expired tokens are rejected.
```

### `docs` - Documentation

```bash
# Update README
docs: add Turborepo setup instructions

# API documentation
docs(api): update Swagger specs for auth endpoints

# Add code comments
docs(payroll): add JSDoc comments to calculation functions
```

### `refactor` - Code Restructuring

```bash
# Extract function
refactor(employee): extract validation to separate service

# Reorganize files
refactor(web): reorganize components into feature folders

# Simplify logic
refactor(attendance): simplify overtime calculation logic

Reduced cyclomatic complexity from 15 to 6 by
extracting helper functions and removing nested ifs.
```

### `test` - Tests

```bash
# Add tests
test(auth): add unit tests for login service

# Increase coverage
test(employee): add integration tests for CRUD operations

Coverage increased from 65% to 82%

# Fix flaky test
test(leave): fix flaky approval workflow test
```

### `chore` - Maintenance

```bash
# Update dependencies
chore(deps): update NestJS to v10.3.0

# Configuration
chore(eslint-config): update rules for Prettier compatibility

# Scripts
chore: add health check script for infrastructure
```

### `style` - Code Formatting

```bash
# Formatting
style(auth): format code with Prettier

# Linting
style(web): fix ESLint warnings

# Naming
style(employee): rename variables for clarity
```

### `perf` - Performance

```bash
# Optimization
perf(payroll): optimize salary calculation query

Reduced execution time from 2.5s to 400ms by
adding database index on employee_id column.

# Caching
perf(gateway): add Redis caching for user permissions
```

### `build` - Build System

```bash
# Turborepo
build(turborepo): update pipeline configuration

# Docker
build(docker): optimize Dockerfile for faster builds

# Dependencies
build: migrate to npm workspaces from Yarn
```

### `ci` - CI/CD

```bash
# GitHub Actions
ci: add automated testing workflow

# Deployment
ci: configure Railway deployment

# Scripts
ci: add pre-commit hooks with Husky
```

### `revert` - Revert Commits

```bash
# Revert format
revert: feat(auth): add password reset endpoint

This reverts commit 1a2b3c4d5e6f7g8h9i0j.

Reason: Implementation caused security issues.
```

---

## 🚨 Breaking Changes

### Option 1: Exclamation Mark

```bash
feat(auth)!: change authentication flow

BREAKING CHANGE: Session-based auth replaced with JWT.
All clients must update to use Authorization header.
```

### Option 2: Footer Only

```bash
feat(auth): implement new role system

BREAKING CHANGE: Roles are now hierarchical.
Update all permission checks to use new hasRole() method.
```

### When to Mark as Breaking

- API changes (endpoints, payloads)
- Database schema changes
- Configuration changes
- Dependency version bumps with breaking changes
- Removed features

---

## ✅ Best Practices

### DO ✅

```bash
# Good: Clear, specific, imperative
feat(auth): add two-factor authentication

# Good: Reference issue
fix(leave): prevent double approval
Closes #245

# Good: Explain why
refactor(payroll): extract tax calculation

Tax calculation logic was duplicated across 3 files.
Extracted to shared service for maintainability.

# Good: Atomic commits
feat(employee): add department field to schema
feat(employee): add department CRUD endpoints
feat(web): add department selector component
```

### DON'T ❌

```bash
# Bad: Past tense
feat(auth): added login endpoint

# Bad: Too vague
fix: bug fix

# Bad: Multiple unrelated changes
feat(auth): add login, update UI, fix tests

# Bad: Unnecessary details
fix(leave): fixed the issue where leave balance
was showing incorrect value after approval because
the calculation was using wrong formula and...

# Bad: Non-imperative
docs: updating README
```

---

## 📏 Length Guidelines

### Subject Line

```bash
# ✅ Good: Under 50 characters
feat(auth): add password reset endpoint

# ❌ Bad: Over 100 characters
feat(auth): implement comprehensive password reset functionality with email verification and token expiration
```

### Body

```bash
# Wrap at 72 characters
feat(payroll): implement salary calculation

Calculate monthly salary including base pay, overtime,
deductions, and allowances. The calculation follows
the company's payroll policy documented in HR-2024-01.

Implementation details:
- Overtime calculated at 1.5x rate
- Tax deducted based on income bracket
- Insurance deduction fixed at 5%
```

---

## 🎨 Multi-Scope Commits

### Multiple Services

```bash
# Option 1: Use wildcard
feat(*): add health check endpoints

# Option 2: List scopes (if only a few)
feat(auth,employee,attendance): add service health checks

# Option 3: Use high-level scope
feat(services): add standardized error handling
```

### Entire Codebase

```bash
# No scope needed
chore: update dependencies to latest versions

# Or use project scope
chore(deps): upgrade all NestJS packages
```

---

## 🔧 Tooling Setup

### Step 1: Install Commitlint

```bash
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```

### Step 2: Create `commitlint.config.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        // Services
        'auth',
        'employee',
        'attendance',
        'leave',
        'payroll',
        'notification',
        'gateway',
        // Apps
        'web',
        // Packages
        'common',
        'contracts',
        'events',
        'eslint-config',
        'ts-config',
        'prettier-config',
        // Infrastructure
        'docker',
        'prisma',
        'turborepo',
        'deps',
        'ci',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
```

### Step 3: Update Husky Hook

Already configured in `.husky/commit-msg`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

### Step 4: Install Commitizen (Optional)

```bash
npm install --save-dev commitizen cz-conventional-changelog
```

Add to `package.json`:

```json
{
  "scripts": {
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}
```

Usage:

```bash
# Instead of git commit
npm run commit
```

---

## 🎯 VS Code Integration

### Recommended Extension

Install: [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)

```bash
code --install-extension vivaxy.vscode-conventional-commits
```

### Git Commit Template

Create `.gitmessage` in project root:

```
# <type>(<scope>): <subject>
# |<----  Max 50 chars  ---->|

# Body (optional)
# |<----  Wrap at 72 chars  ----------------------------->|

# Footer (optional)
# Reference issues: Closes #123
# Breaking changes: BREAKING CHANGE: description

# --- TYPES ---
# feat:     New feature
# fix:      Bug fix
# docs:     Documentation
# style:    Formatting, missing semi-colons, etc.
# refactor: Restructuring code
# perf:     Performance improvement
# test:     Adding or updating tests
# build:    Build system or dependencies
# ci:       CI/CD changes
# chore:    Maintenance
# revert:   Revert previous commit

# --- SCOPES ---
# auth, employee, attendance, leave, payroll, notification
# gateway, web, common, contracts, events
# docker, prisma, turborepo, deps, ci

# --- REMEMBER ---
# - Use imperative mood ("add" not "added")
# - Don't capitalize first letter
# - No period at the end
# - Separate subject from body with blank line
```

Configure git:

```bash
git config commit.template .gitmessage
```

---

## 📊 Commit Message Examples by Scenario

### Adding a New Feature

```bash
# Small feature
feat(auth): add remember me checkbox

# Medium feature with details
feat(employee): add bulk employee import

Implement CSV upload functionality for importing
multiple employees at once. Validates all rows
before committing to database.

Features:
- CSV validation with error reporting
- Preview before import
- Rollback on any error

# Large feature with breaking change
feat(payroll)!: implement new tax calculation system

BREAKING CHANGE: Tax rates now vary by location.
All salary calculations must include location parameter.

Migration:
1. Update all payroll.calculate() calls
2. Add location field to employee records
3. Run migration script: npm run migrate:payroll
```

### Fixing Bugs

```bash
# Simple fix
fix(leave): correct balance calculation

# Fix with reproduction steps
fix(attendance): resolve clock-in button disabled state

Fixed issue where clock-in button remained disabled
after failed attempt.

Steps to reproduce:
1. Attempt clock-in without internet
2. Reconnect internet
3. Button was still disabled

Root cause: Error state not cleared on retry

Closes #234

# Urgent security fix
fix(auth)!: patch SQL injection vulnerability

SECURITY: User input in login endpoint was not sanitized.
All deployments must be updated immediately.

CVE: Pending
```

### Documentation Updates

```bash
# README update
docs: add Turborepo migration guide

# API documentation
docs(api): update Swagger for v2 endpoints

# Code documentation
docs(payroll): add calculation formula comments

Added detailed comments explaining tax calculation
formulas to help onboarding developers.
```

### Refactoring

```bash
# Extract component
refactor(web): extract EmployeeCard component

# Move files
refactor(auth): reorganize auth module structure

Before: services/auth/everything.ts
After: services/auth/{guards,strategies,decorators}

# Simplify
refactor(leave): simplify approval workflow

Reduced nested if statements from 5 levels to 2
by using early returns and guard clauses.
```

### Testing

```bash
# Add missing tests
test(employee): add tests for department CRUD

Coverage:
- Before: 45%
- After: 87%

# Fix flaky test
test(payroll): fix intermittent calculation test

Test was failing ~30% of time due to floating
point precision issues. Now using .toBeCloseTo().

# Integration tests
test(e2e): add leave approval workflow test

Tests the complete flow from submission to approval
across employee, leave, and notification services.
```

### Infrastructure & Tooling

```bash
# Docker
build(docker): add multi-stage builds

Reduced image size from 1.2GB to 400MB

# Turborepo
build(turborepo): enable remote caching

# Dependencies
chore(deps): update Prisma to v5.8.0

# CI/CD
ci: add automated e2e tests to pipeline

E2E tests now run on every PR to main branch
```

---

## 🚀 Quick Reference

### Commit Checklist

Before committing, ask:

- [ ] Is the type correct?
- [ ] Is the scope appropriate?
- [ ] Is the subject in imperative mood?
- [ ] Is the subject under 50 characters?
- [ ] Did I explain **why**, not **how**?
- [ ] Did I reference related issues?
- [ ] Is this a breaking change? (add `!` or footer)
- [ ] Is the commit atomic? (one logical change)

### Common Patterns

```bash
# New endpoint
feat(service): add GET /resource endpoint

# Database change
feat(service): add column to schema
chore(prisma): run migration for new column

# UI component
feat(web): add ResourceList component
style(web): style ResourceList with Tailwind

# Bug + test
fix(service): resolve edge case in calculation
test(service): add test for edge case

# Documentation
docs(service): add API documentation
docs: update README with new setup steps
```

---

## 📖 Learning Resources

### Official Specification
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)

### Tools
- [Commitlint](https://commitlint.js.org/)
- [Commitizen](https://github.com/commitizen/cz-cli)
- [Husky](https://typicode.github.io/husky/)

### Examples
- [Angular Commits](https://github.com/angular/angular/commits/main)
- [Electron Commits](https://github.com/electron/electron/commits/main)

---

## 🎓 Training Exercise

Practice writing commits for these scenarios:

### Scenario 1
> You added a new feature to the auth service that allows users to enable two-factor authentication via email.

<details>
<summary>Answer</summary>

```bash
feat(auth): add email-based two-factor authentication

Implements 2FA using email verification codes.
Users can enable 2FA in their account settings.

Features:
- Generate 6-digit verification codes
- Send codes via email
- Validate codes on login
- Remember trusted devices for 30 days

Closes #189
```
</details>

### Scenario 2
> You fixed a bug where the payroll service was calculating overtime incorrectly for employees working on weekends.

<details>
<summary>Answer</summary>

```bash
fix(payroll): correct weekend overtime calculation

Weekend overtime was calculated at 1.5x instead of 2x.

Root cause: Overtime multiplier logic did not check
for weekend days (Saturday, Sunday).

Fix: Added day-of-week check before applying multiplier.

Closes #245
```
</details>

### Scenario 3
> You updated the README to include instructions for setting up Turborepo.

<details>
<summary>Answer</summary>

```bash
docs: add Turborepo setup instructions to README

Added section explaining:
- Why we chose Turborepo
- Installation steps
- Basic commands (dev, build, test)
- Troubleshooting tips
```
</details>

---

## 📞 Questions?

If you're unsure about a commit message:

1. Check this guide's examples
2. Look at recent commits in the repo: `git log --oneline`
3. Ask in PR review
4. When in doubt, be descriptive rather than clever

---

**Remember**: Good commit messages help your future self and your team understand **why** changes were made, not just **what** changed.

---

**Last Updated**: February 13, 2026  
**Version**: 1.0.0
