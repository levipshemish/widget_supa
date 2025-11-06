(function () {
  'use strict';

  const config = {
    supabaseUrl: window.WIDGET_SUPABASE_URL || '',
    supabaseKey: window.WIDGET_SUPABASE_KEY || '',
    fundraiserId: window.WIDGET_FUNDRAISER_ID || null,
    containerId: window.WIDGET_CONTAINER_ID || 'jewgo-widget'
  };

  const styles = `
    .jewgo-widget {
      font-family: var(--font, 'Inter', sans-serif);
      max-width: 400px;
      padding: 20px;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .jewgo-widget__banner {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .jewgo-widget__logo {
      display: block;
      margin: 0 auto 10px;
      height: 50px;
      object-fit: contain;
    }
    .jewgo-widget__title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--primary-color, #0070f3);
      text-align: center;
    }
    .jewgo-widget__desc {
      color: #444;
      font-size: 14px;
      text-align: center;
      margin-bottom: 14px;
    }
    .jewgo-widget__progress-bar {
      width: 100%;
      height: 10px;
      background: #eee;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .jewgo-widget__bar-fill {
      height: 100%;
      background: var(--primary-color, #0070f3);
      transition: width 0.3s;
    }
    .jewgo-widget__stats {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #666;
      margin-bottom: 10px;
    }
    .jewgo-widget__donations {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      margin-bottom: 10px;
    }
    .jewgo-widget__donations button {
      background: var(--primary-color, #0070f3);
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 14px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .jewgo-widget__donations button:hover {
      opacity: 0.85;
    }
    .jewgo-widget__payments {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 10px;
    }
    .jewgo-widget__payments a {
      font-size: 13px;
      text-decoration: none;
      color: var(--primary-color, #0070f3);
    }
  `;

  function injectStyles() {
    if (!document.getElementById('jewgo-widget-styles')) {
      const style = document.createElement('style');
      style.id = 'jewgo-widget-styles';
      style.textContent = styles;
      document.head.appendChild(style);
    }
  }

  async function fetchFundraiser() {
    const { supabaseUrl, supabaseKey, fundraiserId } = config;
    const res = await fetch(`${supabaseUrl}/rest/v1/fundraisers?id=eq.${fundraiserId}&select=*`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    const data = await res.json();
    return data[0];
  }

  function render(container, f) {
    const goal = f.goal_amount || 0;
    const percent = 0; // no raised data available


    container.innerHTML = `
      <div class="jewgo-widget" style="--primary-color:${f.primary_color}; --font:${f.typography}">
        ${f.banner_url ? `<img class="jewgo-widget__banner" src="${f.banner_url}" alt="">` : ""}
        ${f.logo_url ? `<img class="jewgo-widget__logo" src="${f.logo_url}" alt="">` : ""}
        <h3 class="jewgo-widget__title">${escapeHtml(f.title)}</h3>
        ${f.description ? `<p class="jewgo-widget__desc">${escapeHtml(f.description)}</p>` : ""}
        
        <div class="jewgo-widget__stats">
          <span>Goal: ${formatCurrency(goal)}</span>
        </div>


        ${
          f.suggested_donations?.length
            ? `<div class="jewgo-widget__donations">
              ${f.suggested_donations.map(a => `<button>$${a}</button>`).join('')}
            </div>`
            : ""
        }

        ${
          f.payment_options?.length
            ? `<div class="jewgo-widget__payments">
              ${f.payment_options.map(p => `<a href="#">${p.replace("_", " ")}</a>`).join('')}
            </div>`
            : ""
        }

        ${
          f.stripe_connect_url
            ? `<div style="text-align:center;margin-top:10px;">
                <a href="${f.stripe_connect_url}" target="_blank" style="color:var(--primary-color);font-weight:500;">Donate securely via Stripe</a>
              </div>`
            : ""
        }
      </div>
    `;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  async function init() {
    injectStyles();
    const container = document.getElementById(config.containerId);
    if (!container) return;

    container.innerHTML = `<div class="jewgo-widget__loading">Loading...</div>`;
    try {
      const fundraiser = await fetchFundraiser();
      render(container, fundraiser);
    } catch (e) {
      container.innerHTML = `<div class="jewgo-widget__error">${e.message}</div>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.JewgoWidget = { reload: init };
})();
