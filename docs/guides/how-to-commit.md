# 🎯 How to Make Commits - Step by Step Guide

This guide shows you **exactly** how to make commits using conventional commits in this project.

---

## 📝 Method 1: Interactive Mode (RECOMMENDED ⭐)

**This is the EASIEST way!** The tool will ask you questions and build the commit message for you.

### Steps:

```bash
# 1. Stage your files
git add .

# 2. Run the interactive commit tool
npm run commit
```

### What happens:

1. **Select type**: Choose from `feat`, `fix`, `docs`, etc.
2. **Enter scope**: Type the scope (e.g., `auth`, `employee`, `web`)
3. **Write subject**: Short description (e.g., "add login endpoint")
4. **Add body** (optional): Longer explanation
5. **Reference issues** (optional): e.g., "Closes #123"
6. **Breaking changes** (optional): If this breaks existing code

### Example Session:

```
? Select the type of change: feat
? What is the scope: auth
? Write a short description: add password reset endpoint
? Provide a longer description: (press enter to skip)
? Are there any breaking changes? No
? Does this close any issues? (press enter to skip)

✔ Commit created: feat(auth): add password reset endpoint
```

---

## 📝 Method 2: Direct Command Line (QUICK)

**Use this when you know the format well.**

### Steps:

```bash
# 1. Stage your files
git add .

# 2. Commit with message in one line
git commit -m "feat(auth): add login endpoint"
```

### Format:

```
git commit -m "<type>(<scope>): <subject>"
```

### Examples:

```bash
# New feature
git commit -m "feat(employee): add bulk import feature"

# Bug fix
git commit -m "fix(payroll): correct overtime calculation"

# Documentation
git commit -m "docs(readme): update setup instructions"

# Refactoring
git commit -m "refactor(auth): extract validation service"

# Tests
git commit -m "test(leave): add approval workflow tests"

# Dependencies
git commit -m "chore(deps): update NestJS to v10.3.0"
```

### With Body and Footer:

```bash
git commit -m "feat(auth): add password reset" -m "Implement email-based password reset with token expiration" -m "Closes #234"
```

---

## 📝 Method 3: Using Git Editor (ADVANCED)

**Use this for commits with detailed body and footer.**

### Steps:

```bash
# 1. Stage your files
git add .

# 2. Open git editor
git commit
```

### What happens:

Your editor will open with the commit template. You'll see:

```
feat(scope): add your feature description here

# ==================== BODY (Optional) ====================
# Explain WHY this change is being made (not HOW)
# Wrap lines at 72 characters
# =========================================================


# ==================== FOOTER (Optional) ====================
# Reference issues: Closes #123
# Breaking changes: BREAKING CHANGE: description
# ===========================================================
```

### How to use it:

1. **Replace the example line** with your actual commit:
   ```
   feat(auth): add password reset endpoint
   ```

2. **Add body** (optional) - explain WHY:
   ```
   feat(auth): add password reset endpoint
   
   Users were unable to recover their accounts when they
   forgot passwords. This implements email-based reset
   with secure token generation.
   ```

3. **Add footer** (optional) - reference issues:
   ```
   feat(auth): add password reset endpoint
   
   Users were unable to recover their accounts when they
   forgot passwords. This implements email-based reset
   with secure token generation.
   
   Closes #234
   ```

4. **Save and close** the editor:
   - In VS Code: Save (Ctrl+S) and close the tab
   - In nano: Ctrl+O (save), Enter, Ctrl+X (exit)
   - In vim: Press Esc, type `:wq`, press Enter

---

## ✅ Valid Commit Examples

```bash
# Simple feature
git commit -m "feat(auth): add login endpoint"

# Bug fix
git commit -m "fix(payroll): correct tax calculation"

# Documentation
git commit -m "docs(readme): add deployment guide"

# Refactoring
git commit -m "refactor(employee): extract validation logic"

# Tests
git commit -m "test(leave): add unit tests for approval"

# Chore
git commit -m "chore(deps): update Prisma to v5.8.0"

# Performance
git commit -m "perf(attendance): add database indexes"

# Build
git commit -m "build(docker): optimize Dockerfile"

# CI/CD
git commit -m "ci: add automated deployment"
```

---

## ❌ Common Mistakes

### ❌ Wrong Type
```bash
# BAD - "feature" is not a valid type
git commit -m "feature(auth): add login"

# GOOD - use "feat"
git commit -m "feat(auth): add login"
```

### ❌ Wrong Scope
```bash
# BAD - "authentication" is not in allowed scopes
git commit -m "feat(authentication): add login"

# GOOD - use "auth"
git commit -m "feat(auth): add login"
```

### ❌ Past Tense
```bash
# BAD - past tense
git commit -m "feat(auth): added login"

# GOOD - imperative mood
git commit -m "feat(auth): add login"
```

### ❌ Capitalized
```bash
# BAD - capitalized
git commit -m "Feat(auth): Add login"

# GOOD - lowercase
git commit -m "feat(auth): add login"
```

### ❌ Period at End
```bash
# BAD - has period
git commit -m "feat(auth): add login."

# GOOD - no period
git commit -m "feat(auth): add login"
```

### ❌ Too Long
```bash
# BAD - over 100 characters
git commit -m "feat(auth): implement comprehensive authentication system with multiple providers and security"

# GOOD - concise
git commit -m "feat(auth): add multi-provider authentication"
```

---

## 🚨 Breaking Changes

When you make changes that break existing functionality:

### Option 1: Add `!` after scope

```bash
git commit -m "feat(auth)!: change JWT payload structure"
```

### Option 2: Add BREAKING CHANGE in footer

```bash
git commit -m "feat(auth): change JWT payload" -m "BREAKING CHANGE: JWT now uses roles array instead of role string"
```

---

## 🎯 Quick Reference

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code restructure
- `test` - Tests
- `chore` - Maintenance
- `perf` - Performance
- `build` - Build system
- `ci` - CI/CD

### Scopes (Common)
- **Services**: `auth`, `employee`, `attendance`, `leave`, `payroll`, `notification`, `gateway`
- **Apps**: `web`
- **Packages**: `common`, `contracts`, `events`
- **Infrastructure**: `docker`, `prisma`, `turborepo`, `deps`, `ci`

---

## 🧪 Test Your Commit Message

Before committing, you can test if your message is valid:

```bash
echo "feat(auth): add login endpoint" | npx commitlint
```

If valid, you'll see no output. If invalid, you'll see error messages.

---

## 💡 Pro Tips

1. **Start with interactive mode** (`npm run commit`) until you're comfortable
2. **Keep subjects short** - under 50 characters is ideal
3. **Use imperative mood** - "add" not "added" or "adding"
4. **Explain WHY in the body**, not HOW (code shows how)
5. **Reference issues** - helps track work
6. **One logical change per commit** - don't mix unrelated changes

---

## 🆘 Troubleshooting

### Commit was rejected

If you see errors like:
```
✖   type must be one of [feat, fix, docs, ...]
```

**Solution**: Check your commit message format. Use `npm run commit` for help.

### Editor won't close

If using `git commit` and the editor won't close:

- **VS Code**: Save (Ctrl+S) and close the tab
- **Nano**: Ctrl+O, Enter, Ctrl+X
- **Vim**: Esc, `:wq`, Enter

### Want to change editor back to VS Code

```bash
git config --global core.editor "code --wait"
```

---

## 🎓 Practice Exercise

Try making a commit for the setup files we just created:

```bash
# Stage the files
git add .

# Use interactive mode
npm run commit

# When prompted:
# Type: chore
# Scope: deps
# Subject: add commitlint and husky for commit validation
# Body: (optional) Setup conventional commits with automated validation
# Issues: (press enter to skip)
```

Or use direct command:

```bash
git add .
git commit -m "chore(deps): add commitlint and husky for commit validation"
```

---

## 📚 Need More Help?

- **Quick Reference**: [conventional-commits-cheatsheet.md](./conventional-commits-cheatsheet.md)
- **Complete Guide**: [conventional-commits.md](./conventional-commits.md)
- **Setup Details**: [conventional-commits-setup.md](./conventional-commits-setup.md)

---

**Remember**: When in doubt, use `npm run commit` - it will guide you through the process! 🎉
