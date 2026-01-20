# Right Click Search 🔍

> Chrome extension for quick multi-site search from selected text

[![Chrome](https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome)](https://github.com/julianhopkingson/right-click-search)

## Features

- 🚀 **Quick Search** - Select text, right-click, search instantly
- 📁 **Groups** - Batch search multiple sites at once
- 🌐 **Bilingual** - Chinese/English UI switch
- 📦 **Import/Export** - Backup and restore your settings
- 🎨 **Modern UI** - Clean, responsive settings page

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

```
right-click-search/
├── manifest.json        # Extension config (Manifest V3)
├── background.js        # Service worker
├── _locales/            # i18n language files
├── lib/                 # Core modules
├── options/             # Settings page
├── popup/               # Popup window
└── icons/               # Extension icons
```

---

Made with ❤️ for productivity
