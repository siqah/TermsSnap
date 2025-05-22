# TermsSnap - AI-Powered Terms & Conditions Analyzer

A Chrome extension that helps users understand and evaluate Terms & Conditions agreements by providing AI-powered summaries and risk assessments.

## Features

- 🔍 Automatic detection of Terms & Conditions pages
- 📝 AI-powered summarization of key points
- ⚠️ Risk assessment of concerning clauses
- 🎨 Clean, user-friendly interface
- 🔒 Local processing option for privacy
- 📱 Responsive design that works on all screen sizes

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
- `images/` - Extension icons and assets

### Building for Production

1. Run `npm install` (if you have any build dependencies)
2. Make your changes
3. Test the extension in Chrome
4. Create a ZIP file of the extension directory for distribution

## Privacy

By default, TermsSnap processes all data locally in your browser. No page content is sent to external servers unless you configure an API endpoint in the settings.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This extension is provided for informational purposes only and does not constitute legal advice. Always read the full terms and conditions and consult with a legal professional if you have any concerns.
