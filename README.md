# SnapTidy 🗂

> Stop hoarding screenshots. Point it at a folder. Swipe through thousands of screenshots in minutes. Nothing ever leaves your device.

SnapTidy is a modern, developer-focused local image decluttering tool built with React, TypeScript, Tailwind CSS, and the native **File System Access API**.

---

## ⚡ Features

- **100% Local & Private**: Operates directly in your browser. Files are read and deleted locally via native File System Access API handles. Zero uploads, zero analytics, zero network calls.
- **Swipe Review Workspace**: Interactive physical card deck powered by Framer Motion gestures (`← delete`, `→ keep`, `↑ maybe`).
- **Keyboard Shortcuts**:
  - `[←]` Mark for deletion
  - `[→]` Keep photo
  - `[↑]` Move to Maybe pile
  - `[Z]` Undo last decision
  - `[ESC]` Pause review session
- **Instant Memory Filtering**: 60fps minimum file size slider and category toggles (`Screenshots`, `Photos`, `All images`).
- **Maybe Pile Workspace**: Revisit undecided photos anytime or bulk-return them to Keep.
- **2-Step Safe Deletion**: Running storage total with inline confirmation. Tapping `×` on any thumbnail briefly flashes green to return it to Kept.
- **Shareable Canvas Card**: Client-side 1200x630 HTML5 Canvas badge generator for storage freed stats.
- **Appearance Themes**: Toggle between **Default Dark** (`#0B0B0F`), **OLED Pure Black** (`#000000`), and **Clean Light** (`#F4F4F8`) with automatic `localStorage` persistence.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and `npm`
- Google Chrome or Microsoft Edge (for native `showDirectoryPicker` File System Access API support)

### Installation

```bash
git clone https://github.com/harsha-pyla/SnapTidy.git
cd SnapTidy
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

---

## 📄 License

Distributed under the [MIT License](LICENSE).
