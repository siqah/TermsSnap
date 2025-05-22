document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send a message to the content script to analyze the page
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' });
    
    if (response && response.summary) {
      displaySummary(response.summary);
    } else {
      showError();
    }
  } catch (error) {
    console.error('Error:', error);
    showError();
  }
});

function displaySummary(summary) {
  // Update risk score
  const riskScoreElement = document.getElementById('risk-score');
  const riskScore = calculateRiskScore(summary);
  riskScoreElement.textContent = riskScore;
  
  // Update verdict
  const verdictElement = document.getElementById('verdict');
  const { text, className } = getVerdict(riskScore);
  verdictElement.textContent = text;
  verdictElement.className = `verdict ${className}`;
  
  // Update key points
  const keyPointsContainer = document.getElementById('key-points');
  keyPointsContainer.innerHTML = summary.keyPoints
    .map(point => `<li>${point}</li>`)
    .join('');
  
  // Update detailed sections
  const sectionsContainer = document.getElementById('sections-container');
  sectionsContainer.innerHTML = summary.sections
    .map(section => `
      <div class="section risk-${section.riskLevel.toLowerCase()}">
        <h4>${section.title}</h4>
        <p>${section.summary}</p>
      </div>
    `).join('');
  
  // Hide loading, show summary
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('summary').classList.remove('hidden');
}

function calculateRiskScore(summary) {
  // Simple weighted average of section risk levels
  const weights = {
    high: 3,
    medium: 2,
    low: 1
  };
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  summary.sections.forEach(section => {
    const weight = weights[section.riskLevel.toLowerCase()] || 1;
    weightedSum += (section.impact * weight);
    totalWeight += weight;
  });
  
  // Normalize to 0-100 scale
  const score = Math.min(100, Math.round((weightedSum / totalWeight) * 100));
  return score;
}

function getVerdict(score) {
  if (score >= 70) {
    return {
      text: '⚠️ High Risk - Proceed with Caution',
      className: 'risk-high'
    };
  } else if (score >= 40) {
    return {
      text: 'ℹ️ Medium Risk - Review Carefully',
      className: 'risk-medium'
    };
  } else {
    return {
      text: '✅ Low Risk - Looks Good',
      className: 'risk-low'
    };
  }
}

function showError() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('error').classList.remove('hidden');
}
