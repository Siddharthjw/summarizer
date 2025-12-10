# Summarizer — The WebPage with AI

### AI-powered webpage summarizer — extract the gist of any article, save summary history, and read comfortably with dark mode. Polished, lightweight Chrome extension (Manifest V3).


---
## Screenshots / GIF

![1 summary](https://github.com/user-attachments/assets/7e287e2c-6df2-4937-9a1a-2be20c596ca7)

![2 deatiled and brief (1)](https://github.com/user-attachments/assets/7d77bc34-49ac-4cb7-99a7-b63c8940d1d2)

![history](https://github.com/user-attachments/assets/ec629648-7c83-4d13-a677-4c1d2b789bd7)

---


Summarizer is a compact, practical Chrome extension that extracts article text from the current tab, sends it to an AI backend to produce concise summaries, and stores a short history of recent summaries (page title + date/time + text). It includes a dark/light mode toggle, rounded modern UI, and export/copy conveniences — built to be resume-ready and deployable as a web demo.

---

## Key features

* Summarize any webpage into two modes (customizable): **Quick View** / **Detailed** .
* Save the last 10 summaries to a local history (stores `title`, `date/time`, `summary`).
* Dark / Light mode with persistent preference and an icon that toggles (🌙 / ☀️).
* Copy summary to clipboard; download as `.txt` .
* Minimal, responsive UI with modern rounded buttons and subtle animations.
* Manifest V3 compatible (background service worker, content script message passing).
---

## Tech stack

* Frontend: HTML, CSS (vanilla), JavaScript (ES6+)
* Chrome APIs: `chrome.storage`, `chrome.tabs`, content scripts, service worker (background)
* Backend: Gemini AI API

---

## What’s in the repo

```
/manifest.json
/background.js           # service worker (onInstalled, initial setup)
/content.js              # extracts article text from current page
/popup.html              # UI when extension icon is clicked
/popup.js                # popup logic: summarize, history, copy, dark-mode
/options.html            # API key and settings page
/options.js
/icon.png
/README.md
/assets/                 # screenshots, demo gif 
```

---

## Install & run 

###  Quick local install (unpacked)

1. Clone the repo:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top-right)
4. Click **Load unpacked** → select the cloned repo folder
5. Click the extension icon to open the popup.

---

## How it works — architecture overview

1. **Popup** requests summarization → sends a message to the active tab content script: `{ type: "GET_ARTICLE_TEXT" }`.
2. **Content script** extracts readable article text (tries `<article>`, falls back to `p` tags — consider Readability.js for better extraction).
3. Extracted text returns to popup. Popup calls `getGeminiSummary(text, mode, apiKey)` to generate summary.
4. Popup saves a history entry to `chrome.storage.local`:

```json
{
  "title": "<tab.title>",
  "date": "2025-08-12 10:23:00",
  "type": "Pulse",
  "summary": "…"
}
```

5. Dark mode state saved in `chrome.storage.local` and applied on popup load.

---

## Permissions (manifest.json)

The extension requests the minimum required:

```json
"permissions": ["scripting","activeTab","storage"],
"host_permissions": ["<all_urls>"]
```

`activeTab` and `scripting` are used to inject/communicate with the content script; `storage` persists API key and history.

---

## Security & privacy

* **No user data leaves your control** except when you explicitly send page text to the configured AI API.
* **API key is stored locally** in `chrome.storage.sync` — do not commit it to source control.

---


* Built a Chrome Extension (Manifest V3) that extracts article text and generates AI summaries using remote LLMs.
* Implemented persistent local history (title + timestamp + summary), dark/light mode, and accessible UI with modern styling.
* Used Chrome Storage API, content scripts, message passing, and a Manifest V3 service worker.

---

## Contributing

PRs welcome. Suggested starter tasks:

* Integrate Readability.js for content extraction.
* Add “clear history” and “export history” functions.
* Improve UI accessibility and keyboard navigation.

---

## Contact

Developer: **ANMOL SINGH RANA**
GitHub: `https://github.com/Anmol-Repo`

