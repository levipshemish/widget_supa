(function() {
  'use strict';

  // Configuration - users should set these before loading the widget
  const config = {
    supabaseUrl: window.WIDGET_SUPABASE_URL || '',
    supabaseKey: window.WIDGET_SUPABASE_KEY || '',
    fundraiserId: window.WIDGET_FUNDRAISER_ID || null,
    containerId: window.WIDGET_CONTAINER_ID || 'jewgo-widget'
  };

  // Basic styles
  const styles = `
    .jewgo-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 400px;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .jewgo-widget__title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #333;
    }
    .jewgo-widget__progress {
      margin: 16px 0;
    }
    .jewgo-widget__bar {
      width: 100%;
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }
    .jewgo-widget__bar-fill {
      height: 100%;
      background: #4CAF50;
      transition: width 0.3s ease;
    }
    .jewgo-widget__stats {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 14px;
      color: #666;
    }
    .jewgo-widget__amount {
      font-weight: 600;
      color: #333;
    }
    .jewgo-widget__error {
      color: #d32f2f;
      padding: 12px;
      background: #ffebee;
      border-radius: 4px;
      font-size: 14px;
    }
    .jewgo-widget__loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `;

  // Inject styles
  function injectStyles() {
    if (!document.getElementById('jewgo-widget-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'jewgo-widget-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }
  }

  // Fetch data from Supabase
  async function fetchFundraiserData() {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Supabase URL and API key are required');
    }
    if (!config.fundraiserId) {
      throw new Error('Fundraiser ID is required');
    }

    const url = `${config.supabaseUrl}/rest/v1/fundraisers?id=eq.${config.fundraiserId}&select=*`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': config.supabaseKey,
        'Authorization': `Bearer ${config.supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error('Fundraiser not found');
    }

    return data[0];
  }

  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Render widget
  function render(container, data) {
    const raised = data.amount_raised || 0;
    const goal = data.goal_amount || 0;
    const percentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

    container.innerHTML = `
      <div class="jewgo-widget">
        <h3 class="jewgo-widget__title">${escapeHtml(data.title || 'Fundraiser')}</h3>
        ${data.description ? `<p style="margin: 8px 0; color: #666; font-size: 14px;">${escapeHtml(data.description)}</p>` : ''}
        <div class="jewgo-widget__progress">
          <div class="jewgo-widget__bar">
            <div class="jewgo-widget__bar-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="jewgo-widget__stats">
            <span class="jewgo-widget__amount">${formatCurrency(raised)} raised</span>
            <span>of ${formatCurrency(goal)}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Show error
  function renderError(container, message) {
    container.innerHTML = `
      <div class="jewgo-widget">
        <div class="jewgo-widget__error">
          ${escapeHtml(message)}
        </div>
      </div>
    `;
  }

  // Show loading
  function renderLoading(container) {
    container.innerHTML = `
      <div class="jewgo-widget">
        <div class="jewgo-widget__loading">Loading...</div>
      </div>
    `;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize widget
  async function init() {
    injectStyles();

    const container = document.getElementById(config.containerId);
    if (!container) {
      console.error(`Widget container #${config.containerId} not found`);
      return;
    }

    renderLoading(container);

    try {
      const data = await fetchFundraiserData();
      render(container, data);
    } catch (error) {
      console.error('Widget error:', error);
      renderError(container, error.message);
    }
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose reload function
  window.JewgoWidget = {
    reload: init
  };
})();
