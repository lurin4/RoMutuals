# RoMutuals

**See the friends you have in common with any Roblox user, right on their profile page.**

RoMutuals is a Chrome extension that adds a mutual friends list to Roblox profiles. Open someone's profile and the list appears within the page, with no extra tabs or manual comparing.

<img width="324" height="616" alt="image" src="https://github.com/user-attachments/assets/cddc484e-df57-40df-8d4a-cb4df9a4a6dd" />


## Features

- Shows your mutual friends with any user directly on their profile page
- Blends into the existing Roblox interface
- Runs entirely in your browser and stores no data
- Works on Chrome, Edge and Brave

## Installation (developer mode)

RoMutuals isn't on the Chrome Web Store yet, so install it manually:

1. Download this repository as a ZIP and extract it, or clone it:
   ```bash
   git clone https://github.com/lurin4/RoMutuals.git
   ```
2. Open `chrome://extensions/` in Chrome, Edge or Brave.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the folder that contains `manifest.json`. If you extracted a ZIP, this may be a folder inside the extracted one.
6. Visit any Roblox profile (`roblox.com/users/<id>/profile`) and the mutual friends list will show up.

## How it works

- A content script (`content.js`) runs only on Roblox profile pages (`https://www.roblox.com/users/*/profile`), as set in `manifest.json`.
- It uses Roblox's web APIs to get friend data and adds the mutual friends list to the page.
- Styling lives in `style.css`.

## Privacy

- No personal data or user information is stored or sent to any third party.
- The extension only has permission to access `roblox.com` domains (see `host_permissions` in `manifest.json`).

## Tech

JavaScript · CSS · Roblox web APIs · Chrome Extensions (Manifest V3)

## Project structure

```
RoMutuals/
├── manifest.json   # Extension config, permissions and content script setup
├── content.js      # Runs on profile pages and builds the mutual friends list
├── style.css       # Styling for the injected UI
├── Starborn.ttf    # Custom font
└── LICENSE
```

## Disclaimer

RoMutuals is an independent project and is not affiliated with or endorsed by Roblox Corporation.

## License

Released under the [MIT License](LICENSE).
