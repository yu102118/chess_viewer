# Contributing Guide

Thank you for considering contributing to **FENForsty Pro**!  
We appreciate all contributions — bug reports, feature requests, documentation improvements, and code contributions.

---

## 📌 Ways to Contribute

You can contribute by:

- **Reporting bugs** — Help us identify and fix issues
- **Suggesting features** — Share ideas for new functionality
- **Improving code** — Fix bugs, optimize performance, or refactor
- **Enhancing UI/UX** — Make the interface more intuitive and visually appealing
- **Writing documentation** — Improve guides, comments, and examples
- **Reviewing pull requests** — Provide feedback on proposed changes

---

## 🐞 Reporting Bugs

Before creating a new issue:

1. **Search existing issues** to avoid duplicates
2. **Verify the bug** on the latest version
3. **Open a new issue** with the following information:
   - **Clear description** of the problem
   - **Steps to reproduce** the issue
   - **Expected behavior** vs **actual behavior**
   - **Screenshots or GIFs** (if applicable)
   - **Environment details**:
     - Browser (name and version)
     - Operating system
     - FENForsty Pro version (if applicable)

➡️ **Submit bug reports here:**  
[GitHub Issues](https://github.com/BilgeGates/chess_viewer/issues)

---

## ✨ Feature Requests

We welcome feature requests that improve FENForsty Pro!

When submitting a feature request, please include:

- **Clear description** of the proposed feature
- **Use case** — Explain why it would be useful
- **Expected behavior** — How should it work?
- **Examples or mockups** (optional but helpful)
- **Potential implementation** (if you have ideas)

Feature discussions help us prioritize development and ensure we're building what users need.

---

## 🧑‍💻 Development Setup

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (LTS version recommended — v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

```bash
git clone https://github.com/YOUR_USERNAME/chess_viewer.git
cd chess_viewer
```

3. **Install dependencies:**

```bash
pnpm install
```

4. **Start the development server:**

```bash
pnpm dev
```

5. **Open your browser** and navigate to the local development URL (typically `http://localhost:3000`)

### Project Structure

```
chess_viewer/
│
├── 📂 public/
│   ├── index.html
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
│
├── 📂 src/
│   │
│   ├── 📂 components/
│   │   │
│   │   ├── 📂 board/              # Chess Board Rendering
│   │   │   ├── BoardSquare.jsx
│   │   │   ├── BoardGrid.jsx
│   │   │   ├── ChessBoard.jsx
│   │   │   ├── MiniChessPreview.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── 📂 features/           # Feature Modules
│   │   │   ├── (export, theme, fen, color-picker modules)
│   │   │   └── index.js
│   │   │
│   │   ├── 📂 interactions/       # Interactive Components
│   │   │   └── index.js
│   │   │
│   │   ├── 📂 layout/             # Layout Components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── 📂 ui/                 # Reusable UI Components
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Input.jsx
│   │   │   └── index.js
│   │   │
│   │   └── index.js
│   │
│   ├── 📂 pages/                  # Application Pages
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── AdvancedFENInputPage.jsx
│   │   ├── DownloadPage.jsx
│   │   ├── FENHistoryPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── SupportPage.jsx
│   │   ├── ThemeCustomizerPage.jsx
│   │   └── index.js
│   │
│   ├── 📂 hooks/                  # Custom React Hooks
│   │   ├── useChessBoard.js
│   │   ├── usePieceImages.js
│   │   ├── useFENHistory.js
│   │   ├── useTheme.js
│   │   ├── useNotifications.js
│   │   ├── useLocalStorage.js
│   │   ├── useColorState.js
│   │   ├── useColorConversion.js
│   │   ├── useCanvasPicker.js
│   │   ├── useInteractiveBoard.js
│   │   ├── useIntersectionObserver.js
│   │   ├── useOutsideClick.js
│   │   ├── usePerformance.js
│   │   ├── useScrollLock.js
│   │   └── index.js
│   │
│   ├── 📂 utils/                  # Utility Functions
│   │   ├── fenParser.js
│   │   ├── colorUtils.js
│   │   ├── coordinateCalculations.js
│   │   ├── canvasExporter.js
│   │   ├── advancedExport.js
│   │   ├── imageOptimizer.js
│   │   ├── pieceImageCache.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   ├── eventUtils.js
│   │   ├── logger.js
│   │   ├── performance.js
│   │   ├── classNames.js
│   │   └── index.js
│   │
│   ├── 📂 contexts/               # React Contexts
│   │   ├── ThemeSettingsContext.jsx
│   │   └── index.js
│   │
│   ├── 📂 constants/              # Application Constants
│   │   └── chessConstants.js
│   │
│   ├── 📂 routes/                 # Routing Configuration
│   │   └── Router.jsx
│   │
│   ├── App.jsx                    # Root component
│   ├── index.js                   # Entry point
│   └── index.css                  # Global styles
│
├── 📂 docs/                       # Documentation
│   ├── ACCESSIBILITY.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── DECISIONS.md
│   ├── DESIGN_ERRORS_ANALYSIS.md
│   ├── EXPORT_PIPELINE.md
│   ├── FAQ.md
│   ├── FEN.md
│   ├── KNOWN_ISSUES.md
│   ├── LINTING_SETUP.md
│   ├── PERFORMANCE.md
│   ├── README.md
│   ├── ROADMAP.md
│   └── STATE_MANAGEMENT.md
│
├── 📂 dist/                       # Vite build output (gitignored)
│
├── 📄 package.json
├── 📄 vite.config.js
├── 📄 eslint.config.js
├── 📄 jsconfig.json
├── 📄 tailwind.config.js
├── 📄 postcss.config.js
├── 📄 vercel.json
├── 📄 README.md
├── 📄 LICENSE
├── 📄 CONTRIBUTING.md
├── 📄 CODE_OF_CONDUCT.md
└── 📄 SECURITY.md
```

### Architecture Highlights

- **Feature-Based**: Components organized by domain (export, theme, fen, color-picker)
- **Page-Based Routing**: Dedicated pages for different app views
- **Barrel Exports**: Clean imports via `index.js` in each directory
- **Hooks & Utils**: Global access from `src/hooks` and `src/utils`
- **Comprehensive Docs**: Detailed documentation in `docs/` folder

---

## 🔧 Making Changes

### Workflow

1. **Create a new branch** for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

2. **Make your changes** with clear, focused commits:

```bash
git add .
git commit -m "Add: brief description of changes"
```

3. **Follow coding standards:**
   - Use consistent formatting (Prettier/ESLint if configured)
   - Write clear, descriptive variable and function names
   - Add comments for complex logic
   - Keep functions small and focused

4. **Test your changes** thoroughly:
   - Verify functionality works as expected
   - Check for console errors
   - Test on different browsers if possible

5. **Push to your fork:**

```bash
git push origin feature/your-feature-name
```

### Commit Message Guidelines

Use clear, descriptive commit messages:

- **Add:** for new features
- **Fix:** for bug fixes
- **Update:** for modifications to existing features
- **Refactor:** for code improvements without changing functionality
- **Docs:** for documentation changes

**Example:**

```
Add: board flip functionality
Fix: piece drag-and-drop on mobile devices
Update: improve move validation performance
```

---

## 🚀 Submitting a Pull Request

1. **Push your changes** to your forked repository
2. **Open a pull request** on the main repository
3. **Provide a clear description:**
   - What changes were made
   - Why the changes are necessary
   - Any related issues (use `Fixes #123` to auto-close issues)
   - Screenshots (for UI changes)

4. **Wait for review** — maintainers will review your PR and may request changes
5. **Address feedback** — make requested changes and push updates
6. **Celebrate!** 🎉 Once approved, your contribution will be merged

### Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows project style and conventions
- [ ] Changes have been tested locally
- [ ] No console errors or warnings
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main branch

---

## 📝 Documentation

Good documentation helps everyone! You can contribute by:

- Improving README clarity
- Adding code comments
- Creating usage examples
- Writing tutorials or guides
- Fixing typos or formatting issues

---

## 💬 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Provide constructive feedback
- Focus on what is best for the project and community
- Show empathy towards other contributors

Unacceptable behavior will not be tolerated.

---

## ❓ Questions or Need Help?

If you have questions or need assistance:

- **Open a discussion** on GitHub Discussions (if enabled)
- **Ask in the issues** with the `question` label
- **Reach out** via email or project contact methods

---

## 🙏 Thank You!

Your contributions make FENForsty Pro better for everyone. We appreciate your time, effort, and dedication to improving this project!

Happy coding! ♟️

---

**Project Repository:**  
https://github.com/BilgeGates/chess_viewer

**Report Issues:**  
https://github.com/BilgeGates/chess_viewer/issues
