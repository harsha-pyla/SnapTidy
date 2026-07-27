<p align="center">
  <img src="./public/logo.svg" width="64" height="64" alt="SnapTidy Logo" />
</p>

<h1 align="center">SnapTidy</h1>

<p align="center">
  <strong>Declutter your screenshot folder in minutes. 100% local, private, and ultra-fast.</strong>
</p>

<p align="center">
  <a href="https://harsha-pyla.github.io/SnapTidy/"><strong>Live Demo</strong></a> &middot;
  <a href="#-getting-started"><strong>Run Locally</strong></a> &middot;
  <a href="#-privacy-first-architecture"><strong>Privacy Note</strong></a> &middot;
  <a href="#-license"><strong>MIT License</strong></a>
</p>

---

## 💡 What SnapTidy Does

SnapTidy is a rapid image decluttering web application designed to help developers, designers, and power users organize overflowing screenshot directories. By presenting your local files in an intuitive swipe-review workspace with keyboard shortcuts, you can process thousands of clutter items in minutes.

### Key Features
- 📇 **Physical Deck Swipe Workspace**: Smooth drag-and-drop card gestures powered by Framer Motion (`← delete`, `→ keep`, `↑ maybe`).
- ⌨️ **Keyboard Navigation**:
  - `[←]` Mark item for deletion
  - `[→]` Keep photo
  - `[↑]` Move item to Maybe pile
  - `[Z]` Undo last decision
  - `[ESC]` Pause review session
- ⚡ **Instant Client Filtering**: Smooth 60fps minimum size slider and category toggles (`Screenshots`, `Photos`, `All`).
- 🛡️ **Safety-Net Deletion Review**: Confirm deletions with a 2-step summary grid. Hovering or clicking `×` flashes keep-accent green to un-mark items.
- 🎨 **Appearance Themes**: Toggle between **Default Dark** (`#0B0B0F`), **OLED Pure Black** (`#000000`), and **Clean Light** (`#F4F4F8`) with automatic `localStorage` persistence.
- 📊 **Shareable Summary Card**: Generate client-side HTML5 Canvas storage freed badges with 1-click download or clipboard copy.

---

## 🔒 Privacy-First Architecture

SnapTidy operates strictly under a **local-first architecture**:

- 📂 **Native File System Access API**: Uses your browser's native `showDirectoryPicker` to read and delete files locally on your machine.
- 🚫 **Zero Uploads**: No image data, filenames, or folder paths ever leave your browser memory.
- 🛑 **Zero Telemetry**: No analytics scripts, no tracking cookies, and zero external API calls.
- 💾 **Local Progress Persistence**: Progress state is cached strictly inside your browser's IndexedDB so you can safely resume sessions after page refreshes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and `npm`
- Google Chrome, Microsoft Edge, or Opera (browsers supporting the native [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API))

### Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/harsha-pyla/SnapTidy.git
   cd SnapTidy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## 📄 License

Distributed under the [MIT License](LICENSE).
