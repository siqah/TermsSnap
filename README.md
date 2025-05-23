# TermsSnap - Terms & Conditions Analyzer

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
