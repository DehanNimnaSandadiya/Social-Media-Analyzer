// report.js — render the AI report on report.html

const CHART_COLORS = ['#1a56db','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const params   = new URLSearchParams(window.location.search);
  const reportId = params.get('id');

  if (!reportId) { window.location.href = 'dashboard.html'; return; }

  try {
    const rpt = await API.get(`/api/reports/${reportId}`);
    renderReport(rpt);
  } catch (e) {
    document.getElementById('loadingState').innerHTML =
      `<div class="alert alert-error" style="max-width:400px;margin:80px auto;">Failed to load report: ${e.message}</div>`;
  }
});

function renderReport(rpt) {
  const r = rpt.ai_response;

  // Swap loading / content
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('reportContent').classList.remove('hidden');

  // ── Header ─────────────────────────────────────────────────────────────────
  document.getElementById('reportBusinessName').textContent = r.report_generated_for || 'Business Report';
  document.getElementById('reportDate').textContent =
    'Generated on ' + new Date(rpt.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });

  // Platform pills in header
  const pillsContainer = document.getElementById('reportPlatformPills');
  if (r.platform_analysis) {
    r.platform_analysis.forEach(p => {
      const pill = document.createElement('div');
      pill.className = 'report-meta-pill';
      pill.textContent = platformIcon(p.platform) + ' ' + p.platform;
      pillsContainer.appendChild(pill);
    });
  }

  // Score ring
  const score = r.overall_score || 65;
  document.getElementById('scoreText').textContent = score;
  const circ = 2 * Math.PI * 36; // circumference for r=36
  const offset = circ - (score / 100) * circ;
  setTimeout(() => {
    document.getElementById('scoreArc').style.strokeDashoffset = offset;
    document.getElementById('scoreArc').style.transition = 'stroke-dashoffset 1.2s ease';
  }, 300);

  // ── Executive Summary ─────────────────────────────────────────────────────
  document.getElementById('execSummary').textContent = r.executive_summary || '';

  // ── Target Audience ───────────────────────────────────────────────────────
  const ta = r.target_audience || {};
  document.getElementById('ageGroup').textContent  = ta.primary_age_group || '—';
  document.getElementById('geoFocus').textContent  = ta.geographic_focus   || '—';
  document.getElementById('peakHours').textContent = (ta.peak_online_hours || []).join(', ') || '—';

  const gs = ta.gender_split || { male: 50, female: 50 };
  document.getElementById('genderSplit').textContent = `Male ${gs.male}% / Female ${gs.female}%`;
  setTimeout(() => {
    document.getElementById('maleBar').style.width   = gs.male   + '%';
    document.getElementById('femaleBar').style.width = gs.female + '%';
  }, 400);

  // Interests
  const interestContainer = document.getElementById('interestChips');
  (ta.interests || []).forEach(i => {
    const chip = document.createElement('span');
    chip.className = 'interest-chip';
    chip.textContent = i;
    interestContainer.appendChild(chip);
  });

  // ── Platform Cards ────────────────────────────────────────────────────────
  const pcContainer = document.getElementById('platformCards');
  (r.platform_analysis || []).forEach(p => {
    const scoreClass = p.score >= 70 ? 'score-high' : p.score >= 50 ? 'score-mid' : 'score-low';
    pcContainer.innerHTML += `
      <div class="platform-card">
        <div class="platform-card-header">
          <span class="platform-card-name">${platformIcon(p.platform)} ${p.platform}</span>
          <span class="platform-score-badge ${scoreClass}">${p.score}/100</span>
        </div>
        <p>${p.current_performance || ''}</p>
        <p style="color:#374151;font-weight:500;">${p.recommendation || ''}</p>
        <span class="freq-tag">🕐 ${p.post_frequency || ''}</span>
        <div class="time-chips">
          ${(p.best_post_times || []).map(t => `<span class="time-chip">${t}</span>`).join('')}
        </div>
      </div>`;
  });

  // ── Engagement Predictions ────────────────────────────────────────────────
  const ep = r.engagement_predictions || {};
  const reach = ep.estimated_monthly_reach || {};
  const eng   = ep.engagement_rate || {};

  document.getElementById('reachCurrent').textContent = fmtNum(reach.current    || 0);
  document.getElementById('reach3m').textContent      = fmtNum(reach.projected_3months || 0);
  document.getElementById('reach6m').textContent      = fmtNum(reach.projected_6months || 0);

  document.getElementById('engCurrent').textContent  = (eng.current         || 0) + '%';
  document.getElementById('engIndustry').textContent = (eng.industry_average || 0) + '%';
  document.getElementById('engTarget').textContent   = (eng.target           || 0) + '%';

  const maxEng = Math.max(eng.current || 0, eng.industry_average || 0, eng.target || 0, 10);
  setTimeout(() => {
    document.getElementById('engCurrentBar').style.width  = ((eng.current || 0) / maxEng * 100) + '%';
    document.getElementById('engIndustryBar').style.width = ((eng.industry_average || 0) / maxEng * 100) + '%';
    document.getElementById('engTargetBar').style.width   = ((eng.target || 0) / maxEng * 100) + '%';
  }, 500);

  // Growth chart
  const growth = ep.follower_growth || {};
  const growthLabels = ['Month 1','Month 2','Month 3','Month 4','Month 5','Month 6'];
  const growthData   = [growth.month1||0, growth.month2||0, growth.month3||0,
                        growth.month4||0, growth.month5||0, growth.month6||0];
  buildLineChart('growthChart', growthLabels, growthData, 'Projected New Followers');

  // Weekly engagement chart
  const wk = ep.weekly_engagement_trend || {};
  const wkLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const wkData   = [wk.monday||0, wk.tuesday||0, wk.wednesday||0,
                    wk.thursday||0, wk.friday||0, wk.saturday||0, wk.sunday||0];
  buildBarChart('weeklyChart', wkLabels, wkData, 'Engagement Score');

  // ── Content Strategy ─────────────────────────────────────────────────────
  const cs   = r.content_strategy || {};
  const mix  = cs.content_mix || [];

  // Donut chart
  buildDoughnutChart('contentMixChart', mix.map(m => m.type), mix.map(m => m.percentage));

  // List
  const mixList = document.getElementById('contentMixList');
  mix.forEach((m, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>
      <span><strong>${m.percentage}%</strong> ${m.type} — <span style="color:#6b7280;font-size:12px;">${m.description}</span></span>`;
    mixList.appendChild(li);
  });

  // Content ideas
  const ideasContainer = document.getElementById('contentIdeas');
  (cs.content_ideas || []).forEach((idea, i) => {
    ideasContainer.innerHTML += `
      <div class="content-idea-item">
        <div class="idea-num">${i+1}</div>
        <span>${idea}</span>
      </div>`;
  });

  // Hashtags
  const hashSection = document.getElementById('hashtagSection');
  const hs = cs.hashtag_strategy || {};
  const tagGroups = [
    { label: 'Primary',  tags: hs.primary_hashtags   || [], color: 'badge-blue'   },
    { label: 'Local',    tags: hs.local_hashtags      || [], color: 'badge-green'  },
    { label: 'Industry', tags: hs.industry_hashtags   || [], color: 'badge-orange' },
  ];
  tagGroups.forEach(g => {
    if (g.tags.length === 0) return;
    hashSection.innerHTML += `
      <div style="margin-bottom:10px;">
        <span style="font-size:12px;font-weight:700;color:#6b7280;margin-right:8px;">${g.label}</span>
        ${g.tags.map(t => `<span class="badge ${g.color}" style="margin:2px;">${t}</span>`).join('')}
      </div>`;
  });

  // ── Monthly Goals ─────────────────────────────────────────────────────────
  const tbody = document.getElementById('goalsTableBody');
  (r.monthly_goals || []).forEach(g => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${g.month}</strong></td>
        <td>${g.goal}</td>
        <td><span class="badge badge-green">${g.kpi}</span></td>
        <td>${g.action}</td>
      </tr>`;
  });

  // ── SWOT ─────────────────────────────────────────────────────────────────
  const swot = r.swot_analysis || {};
  const swotGrid = document.getElementById('swotGrid');
  const swotDef = [
    { key:'strengths',    label:'Strengths',    cls:'swot-s', icon:'💪' },
    { key:'weaknesses',   label:'Weaknesses',   cls:'swot-w', icon:'⚠️' },
    { key:'opportunities',label:'Opportunities',cls:'swot-o', icon:'🚀' },
    { key:'threats',      label:'Threats',      cls:'swot-t', icon:'🛡️' },
  ];
  swotDef.forEach(s => {
    const items = swot[s.key] || [];
    swotGrid.innerHTML += `
      <div class="swot-card ${s.cls}">
        <h4>${s.icon} ${s.label}</h4>
        <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>`;
  });

  // ── Action Plan ───────────────────────────────────────────────────────────
  const apContainer = document.getElementById('actionPlan');
  (r.action_plan || []).forEach(a => {
    const pCls = a.priority === 'High' ? 'p-high' : a.priority === 'Medium' ? 'p-medium' : 'p-low';
    apContainer.innerHTML += `
      <div class="action-item">
        <div class="priority-dot ${pCls}" style="margin-top:6px;"></div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:14px;font-weight:600;">${a.action}</span>
            <span class="badge ${a.priority==='High'?'badge-red':a.priority==='Medium'?'badge-orange':'badge-green'}">${a.priority}</span>
          </div>
          <div style="font-size:12px;color:#6b7280;">
            ⏱ ${a.timeline} &nbsp;→&nbsp; 🎯 ${a.expected_outcome}
          </div>
        </div>
      </div>`;
  });

  // ── Budget ────────────────────────────────────────────────────────────────
  const budget = r.budget_recommendation || {};
  const bdBreakdown = budget.breakdown || [];
  document.getElementById('totalBudget').textContent =
    'LKR ' + fmtNum(budget.total_monthly_budget_lkr || 0);

  buildDoughnutChart('budgetChart',
    bdBreakdown.map(b => b.category),
    bdBreakdown.map(b => b.percentage)
  );

  const bdContainer = document.getElementById('budgetBreakdown');
  bdBreakdown.forEach((b, i) => {
    bdContainer.innerHTML += `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f1f5f9;">
        <span style="display:flex;align-items:center;gap:6px;font-size:13px;">
          <span style="width:10px;height:10px;background:${CHART_COLORS[i]};border-radius:50%;display:inline-block;"></span>
          ${b.category}
        </span>
        <span style="font-weight:700;font-size:13px;">LKR ${fmtNum(b.amount_lkr || 0)}</span>
      </div>`;
  });

  // ── Competitor / Market ───────────────────────────────────────────────────
  const ci = r.competitor_insights || {};
  document.getElementById('marketPosition').textContent = ci.market_position || '';

  const diffList = document.getElementById('differentiatorsList');
  (ci.differentiators || []).forEach(d => {
    diffList.innerHTML += `<li style="font-size:13px;margin-bottom:6px;display:flex;gap:6px;"><span>✅</span>${d}</li>`;
  });

  const gapsList = document.getElementById('gapsList');
  (ci.gaps_to_exploit || []).forEach(g => {
    gapsList.innerHTML += `<li style="font-size:13px;margin-bottom:6px;display:flex;gap:6px;"><span>🎯</span>${g}</li>`;
  });
}

// ── Chart builders ────────────────────────────────────────────────────────────

function buildLineChart(id, labels, data, label) {
  const ctx = document.getElementById(id).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: '#1a56db',
        backgroundColor: 'rgba(26,86,219,0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#1a56db',
        pointRadius: 4,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function buildBarChart(id, labels, data, label) {
  const ctx = document.getElementById(id).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: labels.map((_, i) =>
          data[i] === Math.max(...data) ? '#1a56db' : 'rgba(26,86,219,0.3)'),
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function buildDoughnutChart(id, labels, data) {
  const ctx = document.getElementById(id).getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: CHART_COLORS,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, boxWidth: 12, padding: 8 }
        }
      },
      cutout: '60%'
    }
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtNum(n) {
  return Number(n).toLocaleString('en-LK');
}

function platformIcon(name) {
  const map = {
    Facebook: '📘', Instagram: '📸', TikTok: '🎵',
    YouTube: '▶️', 'Twitter/X': '🐦', Twitter: '🐦', LinkedIn: '💼'
  };
  return map[name] || '📱';
}
