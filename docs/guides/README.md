# 📚 HRIS Microservices - Guides

This directory contains comprehensive guides and documentation for the HRIS Microservices project.

## 📖 Available Guides

### Conventional Commits

A complete guide to writing standardized commit messages for the project.

#### 🚀 [Quick Start](./conventional-commits-quickstart.md)
**Start here!** Get up and running with conventional commits in 2 minutes.

- Quick reference for commit format
- Common types and scopes
- Valid and invalid examples
- How to use interactive commits

#### 📘 [Complete Guide](./conventional-commits.md)
**Comprehensive documentation** covering everything about conventional commits.

- Detailed explanation of commit format
- All commit types with examples
- Project-specific scopes
- Breaking changes handling
- Best practices and anti-patterns
- Tooling setup instructions
- Training exercises

#### 📋 [Cheat Sheet](./conventional-commits-cheatsheet.md)
**Quick reference card** for experienced users.

- One-page reference
- All types and scopes
- Common patterns
- Quick validation checklist

#### ✅ [Setup Guide](./conventional-commits-setup.md)
**Setup confirmation and troubleshooting** guide.

- Installation verification
- Configuration details
- Testing instructions
- Troubleshooting tips
- What happens on commit

---

## 🎯 Which Guide Should I Read?

### I'm New to Conventional Commits
👉 Start with **[Quick Start](./conventional-commits-quickstart.md)**

Then read the **[Complete Guide](./conventional-commits.md)** when you have time.

### I Know Conventional Commits
👉 Check the **[Cheat Sheet](./conventional-commits-cheatsheet.md)** for project-specific scopes

### I Need to Set Up the Tools
👉 Follow the **[Setup Guide](./conventional-commits-setup.md)**

### I Want to Learn Everything
👉 Read the **[Complete Guide](./conventional-commits.md)** from start to finish

---

## 🛠️ Quick Commands

```bash
# Interactive commit (recommended for beginners)
npm run commit

# Manual commit
git commit -m "feat(auth): add login endpoint"

# Test commitlint
echo "feat(auth): test" | npx commitlint

# View commit template
git commit
```

---

## 📂 File Structure

```
docs/guides/
├── README.md                              # This file
├── conventional-commits-quickstart.md     # Quick start guide
├── conventional-commits.md                # Complete guide
├── conventional-commits-cheatsheet.md     # Quick reference
└── conventional-commits-setup.md          # Setup & troubleshooting
```

---

## 🤝 Contributing

When adding new guides:

1. Create the guide in this directory
2. Update this README with a link
3. Follow the same structure and formatting
4. Include practical examples
5. Add to the "Which Guide Should I Read?" section

---

## 📞 Support

If you have questions about:

- **Conventional Commits**: Check the guides above
- **Project Setup**: See [Setup Guide](./conventional-commits-setup.md)
- **Specific Scopes**: See [Cheat Sheet](./conventional-commits-cheatsheet.md)

---

**Last Updated**: 2026-02-13
