# TermsSnap

A Chrome extension that helps you analyze and understand Terms & Conditions and Privacy Policies with ease.

## Features

### 1. Automatic Analysis
- Automatically detects and analyzes terms and conditions pages
- Highlights important clauses and key points
- Provides risk scores for different sections

### 2. Alerts & Notifications
- Get notified about important terms and conditions
- Set custom keywords to monitor
- Receive alerts when policies change

### 3. Export Options
- Export analyzed documents in multiple formats (PDF, HTML, Text)
- Choose to include summaries or full text
- Save your analysis for future reference

### 4. Privacy Controls
- Control what data is collected
- Set data retention periods
- Enable/disable usage data collection

### 5. Multi-language Support
- Auto-detect document language
- Translate content to your preferred language
- Supports multiple languages

### 6. Advanced Analysis
- Sentiment analysis of policy text
- Risk scoring for different clauses
- AI-generated summaries
- Key point highlighting

## Installation

1. Clone this repository or download the source code
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the TermsSnap icon in your browser toolbar to open the popup
2. Navigate to any terms and conditions or privacy policy page
3. The extension will automatically analyze the page
4. Use the settings page to customize your experience

## Settings

Access the settings page by right-clicking the extension icon and selecting "Options" or by clicking the settings icon in the popup.

### General
- Toggle dark mode
- Enable/disable auto-analysis
- Configure notifications
- Enhanced privacy mode

### Alerts
- Enable/disable alerts
- Set custom keywords
- Configure notification preferences

### Export
- Choose export format (PDF, HTML, Text)
- Include/exclude summaries
- Include/exclude full text

### Privacy
- Set data retention period
- Toggle usage data collection
- Auto-clear history

### Language
- Auto-detect language
- Set preferred translation language

### Analysis
- Toggle sentiment analysis
- Enable/disable risk scoring
- Configure summary generation
- Toggle key point highlighting

## Development

### Project Structure

```
TermsSnap/
├── js/
│   ├── background.js     # Background script
│   ├── content-features.js # Content script features
│   ├── shared-settings.js  # Shared settings module
│   ├── settings-new.js     # Settings page logic
│   └── utils.js           # Utility functions
├── css/
│   └── popup.css        # Popup styles
├── icons/                 # Extension icons
├── popup.html             # Popup UI
├── settings.html          # Settings page
└── manifest.json          # Extension manifest
```

### Building

1. Make your changes to the source code
2. Test your changes in Chrome
3. Package the extension for distribution:
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select the extension directory
   - Click "Pack Extension"

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository. - Terms & Conditions Analyzer

A Chrome extension that helps users understand and evaluate Terms & Conditions agreements by providing summaries and risk assessments.

## Features

- 🔍 Automatic detection of Terms & Conditions pages
- 📝 Summarization of key points
- ⚠️ Risk assessment of concerning clauses
- 🎨 Clean, user-friendly interface
- 🔒 Local processing for enhanced privacy
- 📱 Responsive design that works on all screen sizes
- 🎨 Customizable icon set for different states

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Navigate to any website's Terms & Conditions, Privacy Policy, or similar page
2. Click the TermsSnap extension icon in your toolbar
3. The extension will analyze the page and display a summary
4. Review the risk assessment and key points

## Development

### Project Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.js` - Popup logic and UI updates
- `content.js` - Content script for page analysis
- `background.js` - Background script for extension functionality
- `styles.css` - Styling for the popup
- `icons/` - Extension icons in various sizes (generated)
- `generate_icons.py` - Script to generate icons in required sizes
- `background/` - Background service worker scripts
- `utils/` - Utility functions and helpers

### Icon Generation

To generate icons in all required sizes from a high-resolution source image:

1. Install the required Python packages:
   ```bash
   pip install pillow
   ```

2. Run the icon generation script with your source image:
   ```bash
   python generate_icons.py /path/to/your/icon.png
   ```

   This will create an `icons` directory with the following files:
   - `icon16.png` (16x16)
   - `icon32.png` (32x32)
   - `icon48.png` (48x48, active state)
   - `icon48-inactive.png` (48x48, inactive state)
   - `icon128.png` (128x128)

### Building for Production

1. Generate all required icons (see Icon Generation section above)
2. Run `npm install` (if you have any build dependencies)
3. Make your changes
4. Test the extension in Chrome
5. Create a ZIP file of the extension directory for distribution

## Privacy

By default, TermsSnap processes all data locally in your browser. No page content is sent to external servers unless you configure an API endpoint in the settings.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This extension is provided for informational purposes only and does not constitute legal advice. Always read the full terms and conditions and consult with a legal professional if you have any concerns.
