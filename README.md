# Right Click Search 🔍

> Chrome extension for quick multi-site search from selected text

[![Chrome](https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome)](https://github.com/julianhopkingson/right-click-search)

## Features

- 🚀 **Quick Search** - Select text, right-click, search instantly
- 📁 **Groups** - Batch search multiple sites at once (with **drag-and-drop reordering**)
- 🌐 **Bilingual** - Chinese/English UI switch (default to English)
- 🔃 **Reset to Default** - Easily restore all settings and sites
- 📦 **Import/Export** - Backup and restore your settings
- 🎨 **Modern UI** - Clean, responsive settings page with better accessibility
- 🔒 **Security** - Fully CSP compliant (Manifest V3)

## Installation

### From Source (Developer Mode)

1. Clone this repository
   ```bash
   git clone https://github.com/julianhopkingson/right-click-search.git
   ```
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `right-click-search` folder

## Usage

1. Select any text on a webpage
2. Right-click to open context menu
3. Choose **Right Click Search** → Select a site or group
4. New tab(s) will open with search results

## Default Sites

| Site | URL |
|------|-----|
| Google | google.com |
| 百度 | baidu.com |
| Youtube | youtube.com |
| B站 | bilibili.com |
| Wikipedia | wikipedia.org |
| ChatGPT | chat.openai.com |
| 猫搜 | alipansou.com |
| 易搜 | yiso.fun |
| zlib | z-library.sk |

## Settings

Access settings via:
- Click extension icon → **Open Settings**
- Or right-click icon → **Options**

### Tabs

| Tab | Function |
|-----|----------|
| Search | Manage sites and groups |
| Advanced | Language switch, tab behavior |
| Import & Export | Backup/restore settings |

## Development

### Project Structure

```
right-click-search/
├── manifest.json          # Extension config (Manifest V3)
├── background.js          # Service Worker (event handling)
├── popup/
│   ├── popup.html         # Popup entry
│   ├── popup.js           # Popup logic
│   └── popup.css          # Popup styles
├── options/
│   ├── options.html       # Settings page
│   ├── options.js         # Settings logic
│   └── options.css        # Settings styles
├── lib/
│   ├── storage.js         # Chrome Storage wrapper
│   └── i18n.js            # Internationalization module
├── data/
│   └── defaults.json      # Default sites, groups and settings
├── _locales/
│   ├── en/
│   │   └── messages.json  # English language pack
│   └── zh_CN/
│       └── messages.json  # Chinese language pack
├── icons/
│   ├── icon16.png         # 16x16 icon
│   ├── icon48.png         # 48x48 icon
│   └── icon128.png        # 128x128 icon
└── doc/
    └── architecture-design.md
```

### Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "__MSG_extensionName__",
  "version": "1.1.0",
  "default_locale": "en",
  "permissions": ["contextMenus", "storage", "tabs"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "options_page": "options/options.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

Made with ❤️ for productivity
