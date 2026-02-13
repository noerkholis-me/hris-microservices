# Conventional Commits - Quick Reference

## 📋 Commit Format

```
<type>(<scope>): <subject>
```

**Example**: `feat(auth): add password reset endpoint`

---

## 🎯 Types

| Type | Use For | Example |
|------|---------|---------|
| `feat` | New feature | `feat(leave): add bulk approval` |
| `fix` | Bug fix | `fix(payroll): correct tax calculation` |
| `docs` | Documentation | `docs(api): update Swagger specs` |
| `style` | Formatting | `style(web): apply Prettier` |
| `refactor` | Restructure code | `refactor(auth): extract validation` |
| `perf` | Performance | `perf(employee): optimize queries` |
| `test` | Tests | `test(attendance): add unit tests` |
| `build` | Build system | `build(docker): optimize Dockerfile` |
| `ci` | CI/CD | `ci: add deployment workflow` |
| `chore` | Maintenance | `chore(deps): update NestJS` |

---

## 🔖 Scopes (HRIS Project)

### Services
`auth`, `employee`, `attendance`, `leave`, `payroll`, `notification`, `gateway`

### Apps
`web`

### Packages
`common`, `contracts`, `events`, `eslint-config`, `ts-config`

### Infrastructure
`docker`, `prisma`, `turborepo`, `deps`, `ci`

---

## 📏 Rules

✅ **DO**
- Use imperative mood: "add" not "added"
- Keep subject under 50 characters
- Don't end subject with period
- Use lowercase for type and scope
- Reference issues: `Closes #123`

❌ **DON'T**
- Past tense: ~~`added feature`~~
- Vague: ~~`fix: bug fix`~~
- Too long: ~~`feat(auth): implement comprehensive authentication system with multiple providers`~~

---

## 🚨 Breaking Changes

Add `!` after scope or use `BREAKING CHANGE:` footer

```bash
feat(auth)!: change JWT payload structure

BREAKING CHANGE: JWT now uses `roles` array instead of `role` string
```

---

## 💡 Common Patterns

```bash
# New endpoint
feat(employee): add GET /employees/:id endpoint

# Bug fix with issue
fix(leave): prevent negative balance
Closes #234

# Update documentation
docs: add Turborepo migration guide

# Refactor
refactor(payroll): extract tax calculation service

# Add tests
test(auth): add login integration tests

# Update dependencies
chore(deps): update Prisma to v5.8.0

# CI/CD
ci: add automated deployment to Railway

# Performance
perf(attendance): add database indexes
```

---

## 🎓 Examples by Service

### Auth Service
```bash
feat(auth): add two-factor authentication
fix(auth): resolve token expiration bug
refactor(auth): simplify permission checking
test(auth): add RBAC unit tests
```

### Employee Service
```bash
feat(employee): implement bulk import from CSV
fix(employee): correct department hierarchy query
docs(employee): add API documentation
perf(employee): optimize employee search query
```

### Payroll Service
```bash
feat(payroll): add overtime calculation
fix(payroll): correct tax deduction formula
refactor(payroll): extract salary components
test(payroll): add payslip generation tests
```

### Web (Frontend)
```bash
feat(web): add employee dashboard
fix(web): resolve responsive layout issue
style(web): apply new design system
refactor(web): extract reusable components
```

---

## ⚡ Quick Commands

```bash
# Install tools
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Configure git template
git config commit.template .gitmessage

# Interactive commit (if using Commitizen)
npm run commit

# View commit history
git log --oneline
```

---

## 🔍 Validation

Before committing:
1. Type is from allowed list ✅
2. Scope matches project structure ✅
3. Subject is imperative, lowercase ✅
4. Subject under 50 chars ✅
5. Breaking change marked ✅

---

## 📖 Full Guide

For detailed explanations and more examples, see:
[Conventional Commits Guide](./conventional-commits.md)

---

**Quick Tip**: When in doubt, be clear and specific. Your future self will thank you! 🙏
