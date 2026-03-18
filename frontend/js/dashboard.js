// dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  // Show user name
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.full_name) {
      document.getElementById('navUserName').textContent = `👤 ${user.full_name}`;
      document.getElementById('welcomeMsg').textContent = `Welcome back, ${user.full_name.split(' ')[0]}! 👋`;
    }
  } catch (_) {}

  await loadDashboard();
});

async function loadDashboard() {
  try {
    const [reports, businesses] = await Promise.all([
      API.get('/api/reports/'),
      API.get('/api/businesses/')
    ]);

    // Update stats
    document.getElementById('statReports').textContent    = reports.length;
    document.getElementById('statBusinesses').textContent = businesses.length;

    // Render report list
    renderReports(reports);

  } catch (e) {
    if (e.message.includes('401') || e.message.toLowerCase().includes('unauthorized')) {
      logout();
      return;
    }
    document.getElementById('reportsList').innerHTML = `
      <div class="alert alert-error">Failed to load data: ${e.message}</div>`;
  }
}

function renderReports(reports) {
  const container = document.getElementById('reportsList');

  if (!reports || reports.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No reports yet</h3>
        <p>Generate your first AI social media strategy report for your business.</p>
        <a href="input.html" class="btn btn-primary btn-lg">🤖 Generate First Report</a>
      </div>`;
    return;
  }

  const html = reports.map(r => {
    const date = new Date(r.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    const rid = String(r.id || '');
    return `
      <div class="report-card" onclick="viewReport('${rid}')" style="margin-bottom:10px;cursor:pointer;">
        <div class="report-icon">📋</div>
        <div class="report-info">
          <div class="report-title">${escHtml(r.report_title || r.business_name + ' — Report')}</div>
          <div class="report-meta">
            <span class="badge badge-blue">${escHtml(r.business_type || 'Business')}</span>
            &nbsp;${escHtml(r.business_name || '')} &bull; ${date}
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();viewReport('${rid}')">View →</button>
      </div>`;
  }).join('');

  container.innerHTML = html;
}

function viewReport(id) {
  window.location.href = `report.html?id=${id}`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
