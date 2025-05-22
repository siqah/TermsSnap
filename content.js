// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzePage') {
    analyzePage().then(summary => {
      sendResponse({ summary });
    });
    return true; // Required for async response
  }
});

async function analyzePage() {
  // Extract text from the page
  const pageText = extractTextFromPage();
  
  // Check if this looks like a terms page
  if (!isLikelyTermsPage(pageText)) {
    return null;
  }
  
  // For now, we'll use a simple analysis
  // In a real extension, you would send this to a backend service for analysis
  const summary = await analyzeTextLocally(pageText);
  
  return summary;
}

function extractTextFromPage() {
  // Try to get the main content of the page
  const contentSelectors = [
    'main',
    'article',
    '.content',
    '#content',
    '.main-content',
    '#main',
    'body'
  ];
  
  let content = '';
  
  // Try each selector until we find content
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim().length > 100) {
      content = element.textContent;
      break;
    }
  }
  
  // If no specific element found, use the whole body
  if (!content) {
    content = document.body.textContent;
  }
  
  // Clean up the text
  return content
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .trim();
}

function isLikelyTermsPage(text) {
  const termsKeywords = [
    'terms of service',
    'terms and conditions',
    'privacy policy',
    'terms of use',
    'user agreement',
    'legal notice',
    'copyright information'
  ];
  
  const lowerText = text.toLowerCase();
  return termsKeywords.some(keyword => lowerText.includes(keyword));
}

async function analyzeTextLocally(text) {
  // This is a simplified local analysis
  // In a real app, you would send this to a backend service
  
  // Sample analysis
  const sections = [
    {
      title: 'Data Collection',
      summary: 'Collects personal information including name, email, and browsing data.',
      riskLevel: 'high',
      impact: 0.8
    },
    {
      title: 'Third-Party Sharing',
      summary: 'Shares data with third parties for analytics and advertising.',
      riskLevel: 'high',
      impact: 0.9
    },
    {
      title: 'Cancellation Policy',
      summary: 'Allows cancellation within 30 days with full refund.',
      riskLevel: 'low',
      impact: 0.1
    },
    {
      title: 'Arbitration Clause',
      summary: 'Contains an arbitration clause that may limit legal options.',
      riskLevel: 'medium',
      impact: 0.6
    },
    {
      title: 'Content Ownership',
      summary: 'You retain ownership of your content but grant a broad license to the service.',
      riskLevel: 'medium',
      impact: 0.5
    }
  ];
  
  const keyPoints = [
    'Collects personal data and shares with third parties',
    '30-day cancellation policy with full refund',
    'Includes arbitration clause',
    'Broad license to user-generated content',
    'Automatic renewal terms may apply'
  ];
  
  return {
    url: window.location.href,
    title: document.title,
    lastUpdated: new Date().toISOString().split('T')[0],
    keyPoints,
    sections,
    fullText: text.substring(0, 1000) + '...' // Just a preview
  };
}
