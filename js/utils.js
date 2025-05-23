/**
 * Utility functions for the TermsSnap extension
 */

export class Utils {
  /**
   * Debounce a function to limit how often it can be called
   * @param {Function} func - The function to debounce
   * @param {number} wait - The time to wait in milliseconds
   * @returns {Function} The debounced function
   */
  static debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle a function to limit how often it can be called
   * @param {Function} func - The function to throttle
   * @param {number} limit - The time limit in milliseconds
   * @returns {Function} The throttled function
   */
  static throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Format a date string
   * @param {Date|string|number} date - The date to format
   * @param {string} format - The format string (default: 'MM/DD/YYYY')
   * @returns {string} The formatted date string
   */
  static formatDate(date, format = 'MM/DD/YYYY') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const pad = (num) => num.toString().padStart(2, '0');
    
    const formats = {
      YYYY: d.getFullYear(),
      MM: pad(d.getMonth() + 1),
      DD: pad(d.getDate()),
      HH: pad(d.getHours()),
      mm: pad(d.getMinutes()),
      ss: pad(d.getSeconds()),
    };
    
    return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => formats[match] || match);
  }

  /**
   * Truncate text to a specified length
   * @param {string} text - The text to truncate
   * @param {number} maxLength - The maximum length of the text
   * @param {string} ellipsis - The ellipsis character(s) to append (default: '...')
   * @returns {string} The truncated text
   */
  static truncateText(text, maxLength = 100, ellipsis = '...') {
    if (typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + ellipsis;
  }

  /**
   * Generate a unique ID
   * @returns {string} A unique ID
   */
  static generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Check if a value is empty
   * @param {*} value - The value to check
   * @returns {boolean} True if the value is empty, false otherwise
   */
  static isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  }

  /**
   * Deep clone an object
   * @param {Object} obj - The object to clone
   * @returns {Object} The cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Sanitize HTML to prevent XSS attacks
   * @param {string} str - The string to sanitize
   * @returns {string} The sanitized string
   */
  static sanitizeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Convert a string to title case
   * @param {string} str - The string to convert
   * @returns {string} The title-cased string
   */
  static toTitleCase(str) {
    if (typeof str !== 'string') return '';
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Check if the current page is a terms and conditions page
   * @returns {boolean} True if the page is a terms and conditions page
   */
  static isTermsPage() {
    const termsKeywords = [
      'terms', 'conditions', 'privacy', 'policy', 'legal', 'agreement',
      't&c', 'tos', 'eula', 'terms-of-service', 'privacy-policy'
    ];
    
    const url = window.location.href.toLowerCase();
    const title = document.title?.toLowerCase() || '';
    
    return termsKeywords.some(keyword => 
      url.includes(keyword) || title.includes(keyword)
    );
  }

  /**
   * Get the domain from a URL
   * @param {string} url - The URL to get the domain from
   * @returns {string} The domain
   */
  static getDomain(url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch (e) {
      console.error('Error getting domain:', e);
      return '';
    }
  }

  /**
   * Check if the current URL matches a pattern
   * @param {string} pattern - The pattern to match against
   * @returns {boolean} True if the URL matches the pattern
   */
  static isUrlMatch(pattern) {
    try {
      const url = new URL(window.location.href);
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`, 'i');
      return regex.test(url.href) || regex.test(url.hostname) || regex.test(url.pathname);
    } catch (e) {
      console.error('Error matching URL pattern:', e);
      return false;
    }
  }
}
