// Simple Terms and Conditions Analyzer
// This version uses local analysis only - no external API calls

// Log extension initialization
console.log('TermsSnap content script loaded', { 
  extensionId: chrome.runtime.id,
  url: window.location.href,
  time: new Date().toISOString(),
  hostname: window.location.hostname
});

// Check if we're running on a local file
const isLocalFile = window.location.protocol === 'file:';

// Notify the background script that content script is ready
notifyBackgroundPage();

// Main analysis function
function analyzePage() {
  return new Promise(async (resolve) => {
    try {
      console.log('Starting analysis...');
      
      // Get page content first
      const pageText = extractMainContent();
      const url = window.location.href;
      const title = document.title;
      
      console.log('Content extracted, analyzing...');
      
      // Start analysis and timer in parallel
      const analysisPromise = analyzeContent(pageText);
      const timerPromise = new Promise(resolve => setTimeout(resolve, 3000));
      
      // Wait for both analysis and minimum delay
      const [analysis] = await Promise.all([analysisPromise, timerPromise]);
      
      // Add metadata
      analysis.metadata = {
        analyzedAt: new Date().toISOString(),
        url,
        title,
        contentLength: pageText.length,
        processingTime: '3s+ (simulated)'
      };
      
      console.log('Analysis complete');
      resolve(analysis);
      
    } catch (error) {
      console.error('Error in analyzePage:', error);
      resolve({
        error: true,
        message: error.message || 'Error analyzing page',
        riskScore: 0,
        summary: 'Error analyzing page',
        keyPoints: [],
        concerns: ['Unable to analyze page content'],
        dataCollection: [],
        userRights: []
      });
    }
  });
}

// Extract main content from the page
function extractMainContent() {
  try {
    // Try to find the main content area using common selectors
    const contentSelectors = [
      'main', 'article', '[role="main"]', '.main-content',
      '.content', '#content', '.terms', '.privacy',
      '.legal', '.tos', '.conditions', '.eula',
      '.terms-of-service', '.privacy-policy'
    ];
    
    let mainContent = null;
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        mainContent = element;
        break;
      }
    }
    
    // Fall back to body if no specific content area found
    mainContent = mainContent || document.body;
    
    // Clone to avoid modifying the original DOM
    const content = mainContent.cloneNode(true);
    
    // Remove unwanted elements
    const elementsToRemove = [
      'nav', 'header', 'footer', 'aside', 'script', 'style',
      'iframe', 'noscript', 'svg', 'img', 'button', 'form',
      '.nav', '.header', '.footer', '.sidebar', '.ad', '.advertisement'
    ];
    
    elementsToRemove.forEach(selector => {
      content.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Get text content and clean it up
    let text = content.textContent || '';
    
    // Normalize whitespace and clean up the text
    text = text
      .replace(/\s+/g, ' ')           // Replace all whitespace with a single space
      .replace(/\n+/g, '\n')           // Normalize newlines
      .replace(/\s*\n\s*/g, '\n')      // Trim spaces around newlines
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
      .trim();
    
    // If we don't have enough text, try getting more content
    if (text.length < 500) {
      // Try to get more content by combining multiple sections
      const sections = document.querySelectorAll('section, div, p');
      const sectionTexts = [];
      
      sections.forEach(section => {
        const sectionText = (section.textContent || '').trim();
        if (sectionText.length > 100) {  // Only include substantial sections
          sectionTexts.push(sectionText);
        }
      });
      
      if (sectionTexts.length > 0) {
        text = sectionTexts.join('\n\n');
      }
    }
    
    // Limit the length
    const MAX_LENGTH = 50000;
    if (text.length > MAX_LENGTH) {
      text = text.substring(0, MAX_LENGTH) + '... [content truncated]';
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting content:', error);
    return document.body.innerText.trim().substring(0, 50000);
  }
}

// Analyze content locally
function analyzeContent(text) {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('No text content to analyze');
    }
    
    // Normalize and clean the text
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();
    
    const lowerText = cleanText.toLowerCase();
    
    // Check for common sections in terms and privacy policies
    const hasPrivacy = /\bprivacy\b|\bgdpr\b|\bccpa\b|\bcaloppa\b/i.test(lowerText);
    const hasTerms = /\bterms\b|\bconditions\b|\bagreement\b|\bterms of (use|service)\b/i.test(lowerText);
    const hasCookies = /\bcookie[\w]*\b|\btracking\b|\bbeacon\b/i.test(lowerText);
    
    // Initialize analysis results
    let riskScore = 50; // Neutral starting point
    const concerns = [];
    const dataCollection = [];
    const userRights = [];
    const keyPoints = [];
    
    // Document type identification
    const docType = [];
    if (hasPrivacy) docType.push('Privacy Policy');
    if (hasTerms) docType.push('Terms of Service');
    if (hasCookies) docType.push('Cookie Policy');
    
    if (docType.length > 0) {
      keyPoints.push(`Document type: ${docType.join(', ')}`);
    } else {
      keyPoints.push('Document type: Unspecified (general terms)');
    }
    
    // Risk assessment patterns
    const riskPatterns = [
      { 
        regex: /\barbitration\b|\bclass[\s-]?action\b|\bwaiv(?:er|ing)\b/i, 
        risk: 15, 
        concern: 'May include arbitration clauses limiting legal options',
        point: 'Contains arbitration or class action waiver'
      },
      { 
        regex: /\bthird[\s-]?party\b.*\b(share|sell|transfer|disclose)\b|\bsell\b.*\bdata\b|\bdata\b.*\bbroker\b/i, 
        risk: 20, 
        concern: 'Shares or sells data with third parties',
        point: 'Shares data with third parties'
      },
      { 
        regex: /\bindemnif|\bhold[\s-]?harmless\b|\blimit(?:ation)?[\s-]?of[\s-]?liability\b/i, 
        risk: 10, 
        concern: 'Contains indemnification or liability limitation clauses',
        point: 'Includes liability limitations'
      },
      { 
        regex: /\bdisclaim(?:er)?[\s-]?of[\s-]?warrant(?:y|ies)\b|\bas[\s-]?is\b|\bas[\s-]?available\b/i, 
        risk: 10, 
        concern: 'Includes broad disclaimers of warranties',
        point: 'Contains warranty disclaimers'
      },
      { 
        regex: /\bautomatic[\s-]?renewal\b|\bauto[\s-]?renew\b|\brecurring[\s-]?charge\b/i, 
        risk: 15, 
        concern: 'May include automatic renewal or recurring charges',
        point: 'Mentions automatic renewals'
      },
      { 
        regex: /\btermination\b.*\bservice\b|\bsuspend\b.*\baccount\b|\bclose\b.*\baccount\b/i, 
        risk: 10, 
        concern: 'Service can be terminated without notice',
        point: 'Describes account termination policies'
      }
    ];
    
    // Data collection patterns
    const dataPatterns = [
      { 
        regex: /\bcollect(?:s|ing)?[\s\w]*data\b|\bgather[\s\w]*information\b|\bstore[\s\w]*data\b/i, 
        point: 'Collects user information'
      },
      { 
        regex: /\blocat(?:ion|ing)\b|\bgps\b|\bgeolocat(?:ion|ing)\b|\bip[\s-]?address\b/i, 
        point: 'May collect location data',
        risk: 5
      },
      { 
        regex: /\bcookie[\w]*\b|\btrack(?:ing|er)s?\b|\bbeacon\b|\bfingerprint\b|\bdevice[\s-]?id\b/i, 
        point: 'Uses cookies or tracking technologies',
        risk: 5
      },
      { 
        regex: /\bpersonal[\s-]?data\b|\bpersonally[\s-]?identifiable[\s-]?information\b|\bpii\b/i, 
        point: 'Handles personal data',
        risk: 5
      }
    ];
    
    // Process risk patterns
    riskPatterns.forEach(({ regex, risk, concern, point }) => {
      if (regex.test(lowerText)) {
        riskScore += risk;
        if (concern) concerns.push(concern);
        if (point) keyPoints.push(point);
      }
    });
    
    // Process data collection patterns
    dataPatterns.forEach(({ regex, point, risk = 0 }) => {
      if (regex.test(lowerText)) {
        dataCollection.push(point);
        riskScore += risk;
      }
    });
    
    // Check for children's data (COPPA)
    if (/\bchild(?:ren)?[''\s]s?\b.*\bdata\b|\bunder[\s-]?13\b|\bcoppa\b|\bunder[\s-]?age\b/i.test(lowerText)) {
      concerns.push('Mentions collection of children\'s data');
      riskScore += 10;
      keyPoints.push('Discusses children\'s data collection (COPPA)');
    }
    
    // Ensure risk score is within bounds
    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
    
    // Generate summary based on findings
    let summary = 'This document ';
    
    if (docType.length > 0) {
      summary += `appears to be a ${docType.join(' and ')}. `;
    } else {
      summary += 'appears to be a terms document. ';
    }
    
    if (concerns.length > 0) {
      summary += `It includes ${concerns.length} potential concern${concerns.length !== 1 ? 's' : ''} `;
      summary += `such as ${concerns.slice(0, 2).join(' and ')}. `;
    } else {
      summary += 'No major concerns were identified. ';
    }
    
    if (dataCollection.length > 0) {
      summary += 'Data collection includes: ' + dataCollection.slice(0, 3).join(', ') + '.';
    } else {
      summary += 'No specific data collection practices are mentioned.';
    }
    
    // Add document statistics
    const wordCount = cleanText.split(/\s+/).length;
    const charCount = cleanText.length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 wpm
    
    return {
      riskScore,
      summary,
      keyPoints: Array.from(new Set(keyPoints)).slice(0, 5), // Remove duplicates and limit to 5
      concerns: concerns.length > 0 ? concerns : ['No major concerns identified'],
      dataCollection: dataCollection.length > 0 ? Array.from(new Set(dataCollection)) : ['No specific data collection mentioned'],
      userRights: userRights.length > 0 ? Array.from(new Set(userRights)) : ['No specific user rights mentioned'],
      metadata: {
        analyzedAt: new Date().toISOString(),
        contentLength: charCount,
        wordCount,
        estimatedReadingTime: readingTime,
        hasPrivacy,
        hasTerms,
        hasCookies,
        detectedPatterns: {
          risk: concerns.length,
          dataCollection: dataCollection.length,
          userRights: userRights.length
        }
      }
    };
    
  } catch (error) {
    console.error('Error analyzing content:', error);
    return {
      error: true,
      message: 'Error analyzing content: ' + (error.message || 'Unknown error'),
      riskScore: 0,
      summary: 'Error analyzing content. The document may be too short or in an unexpected format.',
      keyPoints: ['Analysis failed'],
      concerns: ['Unable to analyze document content'],
      dataCollection: [],
      userRights: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        error: error.message || 'Unknown error'
      }
    };
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Only handle messages from our extension
  if (sender.id !== chrome.runtime.id) {
    return false; // Not our message, don't respond
  }
  
  // Handle analyzePage action
  if (request.action === 'analyzePage') {
    // Run analysis asynchronously
    (async () => {
      try {
        console.log('Starting page analysis...');
        const analysis = await new Promise(resolve => {
          setTimeout(() => {
            resolve(analyzeContent(document.body.innerText));
          }, 3000);
        });
        
        // Add additional metadata
        analysis.metadata = analysis.metadata || {};
        analysis.metadata.url = window.location.href;
        analysis.metadata.title = document.title;
        analysis.metadata.analyzedAt = new Date().toISOString();
        
        console.log('Page analysis complete', { 
          riskScore: analysis.riskScore,
          concerns: analysis.concerns.length,
          url: window.location.href
        });
        
        sendResponse({ 
          success: true, 
          analysis,
          metadata: {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error in analyzePage:', error);
        
        // Send detailed error information
        sendResponse({ 
          success: false, 
          error: {
            message: error.message || 'Failed to analyze page',
            stack: error.stack,
            name: error.name
          },
          metadata: {
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        });
      }
    })();
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  // For any other actions, don't respond
  return false;
});

// Notify background script when the page is loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  notifyBackgroundPage();
} else {
  document.addEventListener('DOMContentLoaded', notifyBackgroundPage);
}

// Notify background script that content script is ready
function notifyBackgroundPage() {
  try {
    // Check if this looks like a terms/privacy page
    const path = window.location.pathname.toLowerCase();
    const isTermsPage = /\b(terms|privacy|policy|legal|conditions|agreement|t[&o]s|eula)\b/.test(path);
    
    chrome.runtime.sendMessage({
      action: 'contentScriptReady',
      isTermsPage,
      url: window.location.href,
      title: document.title
    }).catch(error => {
      // Ignore errors - the background script might not be listening
      console.debug('Background script not available:', error.message);
    });
  } catch (error) {
    console.error('Error notifying background page:', error);
  }
}
