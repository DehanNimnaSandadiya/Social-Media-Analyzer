// pdf.js — Generate a professional PDF report using jsPDF

async function downloadPDF() {
  const btn = document.getElementById('pdfBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Generating PDF…';

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW  = doc.internal.pageSize.getWidth();
    const pageH  = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    // ── Helpers ─────────────────────────────────────────────────────────────
    function newPage() {
      doc.addPage();
      y = margin;
      addHeaderFooter();
    }

    function checkY(needed = 20) {
      if (y + needed > pageH - 20) newPage();
    }

    function addHeaderFooter() {
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      // Header bar
      doc.setFillColor(26, 86, 219);
      doc.rect(0, 0, pageW, 10, 'F');
      doc.setFontSize(7); doc.setTextColor(255, 255, 255);
      doc.text('AI Social Media Report Generator — Kingston University London', margin, 6.5);
      doc.text(`Page ${pg}`, pageW - margin, 6.5, { align: 'right' });
      // Footer
      doc.setFontSize(7); doc.setTextColor(150, 150, 150);
      doc.text('Kushani Maleesha Wickramarathna | K2557717 | BSc Software Engineering', margin, pageH - 6);
      doc.text(new Date().toLocaleDateString('en-GB'), pageW - margin, pageH - 6, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }

    function sectionTitle(title, icon = '') {
      checkY(18);
      doc.setFillColor(240, 247, 255);
      doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 86, 219);
      doc.text(`${icon}  ${title}`, margin + 4, y + 6.2);
      doc.setTextColor(0, 0, 0);
      y += 13;
    }

    function bodyText(text, indent = 0, size = 10) {
      doc.setFontSize(size); doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(text, contentW - indent);
      checkY(lines.length * 5 + 2);
      doc.text(lines, margin + indent, y);
      y += lines.length * 5 + 3;
    }

    function labelValue(label, value) {
      checkY(8);
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text(label + ':', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(String(value), margin + 55, y);
      y += 7;
    }

    function hLine() {
      checkY(4);
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, margin + contentW, y);
      y += 5;
    }

    // ── Grab report data from page ───────────────────────────────────────────
    const bizName  = document.getElementById('reportBusinessName').textContent;
    const rptDate  = document.getElementById('reportDate').textContent;
    const score    = document.getElementById('scoreText').textContent;
    const execText = document.getElementById('execSummary').textContent;

    // ── COVER PAGE ───────────────────────────────────────────────────────────
    // Blue gradient header
    doc.setFillColor(26, 86, 219);
    doc.rect(0, 0, pageW, 70, 'F');
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 50, pageW, 25, 'F');

    doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text('Social Media Strategy Report', pageW / 2, 28, { align: 'center' });

    doc.setFontSize(14); doc.setFont('helvetica', 'normal');
    doc.text(bizName, pageW / 2, 42, { align: 'center' });

    doc.setFontSize(10);
    doc.text('AI-Generated • Powered by Google Gemini', pageW / 2, 62, { align: 'center' });

    // Score badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageW / 2 - 22, 80, 44, 30, 4, 4, 'F');
    doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 86, 219);
    doc.text(String(score), pageW / 2, 97, { align: 'center' });
    doc.setFontSize(9); doc.setTextColor(107, 114, 128);
    doc.text('Overall Score /100', pageW / 2, 104, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(rptDate, pageW / 2, 122, { align: 'center' });

    // Uni details
    doc.setFontSize(9); doc.setTextColor(107, 114, 128);
    doc.text('Kingston University London — BSc Software Engineering', pageW / 2, 260, { align: 'center' });
    doc.text('Supervised by Ms. Virajini Godapitiya', pageW / 2, 267, { align: 'center' });

    addHeaderFooter();

    // ── PAGE 2: EXECUTIVE SUMMARY + AUDIENCE ────────────────────────────────
    newPage(); y = margin + 4;

    sectionTitle('Executive Summary', '📋');
    bodyText(execText, 0, 10);

    hLine();

    sectionTitle('Target Audience', '🎯');
    labelValue('Age Group',      document.getElementById('ageGroup').textContent);
    labelValue('Gender Split',   document.getElementById('genderSplit').textContent);
    labelValue('Geographic Focus', document.getElementById('geoFocus').textContent);
    labelValue('Peak Online Hours', document.getElementById('peakHours').textContent);

    const interests = Array.from(document.querySelectorAll('#interestChips .interest-chip'))
      .map(c => c.textContent).join(', ');
    if (interests) { y += 2; bodyText('Interests: ' + interests, 0, 9); }

    // ── PAGE 3: PLATFORM ANALYSIS ────────────────────────────────────────────
    newPage(); y = margin + 4;
    sectionTitle('Platform Analysis', '📱');

    document.querySelectorAll('.platform-card').forEach(card => {
      checkY(30);
      const name  = card.querySelector('.platform-card-name')?.textContent.trim() || '';
      const score2 = card.querySelector('.platform-score-badge')?.textContent.trim() || '';
      const paras = card.querySelectorAll('p');
      const rec   = paras[1]?.textContent.trim() || '';
      const freq  = card.querySelector('.freq-tag')?.textContent.trim() || '';

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentW, 24, 2, 2, 'F');
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text(name, margin + 4, y + 8);
      doc.setFontSize(9); doc.setTextColor(26, 86, 219);
      doc.text('Score: ' + score2, margin + contentW - 4, y + 8, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(rec, contentW - 8);
      doc.text(lines, margin + 4, y + 15);
      doc.setFontSize(8); doc.setTextColor(107, 114, 128);
      doc.text(freq, margin + 4, y + 22);
      doc.setTextColor(0, 0, 0);
      y += 28;
    });

    // ── PAGE 4: ENGAGEMENT + GROWTH ──────────────────────────────────────────
    newPage(); y = margin + 4;
    sectionTitle('Engagement Predictions', '📈');

    labelValue('Current Monthly Reach',    document.getElementById('reachCurrent').textContent);
    labelValue('3-Month Projected Reach',  document.getElementById('reach3m').textContent);
    labelValue('6-Month Projected Reach',  document.getElementById('reach6m').textContent);
    labelValue('Current Engagement Rate',  document.getElementById('engCurrent').textContent);
    labelValue('Industry Average',         document.getElementById('engIndustry').textContent);
    labelValue('Your Target',              document.getElementById('engTarget').textContent);

    // ── PAGE 5: CONTENT STRATEGY ─────────────────────────────────────────────
    newPage(); y = margin + 4;
    sectionTitle('Content Strategy', '💡');

    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
    doc.text('Content Mix:', margin, y); y += 7;

    document.querySelectorAll('#contentMixList li').forEach(li => {
      checkY(7);
      bodyText('• ' + li.textContent.trim(), 4, 9);
    });

    hLine();

    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
    doc.text('Content Ideas:', margin, y); y += 7;
    doc.setTextColor(0, 0, 0);

    document.querySelectorAll('.content-idea-item').forEach((item, i) => {
      const text = item.textContent.trim().replace(/^\d+/, '').trim();
      checkY(8);
      bodyText(`${i+1}. ${text}`, 4, 9);
    });

    // ── PAGE 6: MONTHLY GOALS ────────────────────────────────────────────────
    newPage(); y = margin + 4;
    sectionTitle('Monthly Goals & KPIs', '🏆');

    const goalRows = [];
    document.querySelectorAll('#goalsTableBody tr').forEach(tr => {
      const cells = tr.querySelectorAll('td');
      if (cells.length >= 4) {
        goalRows.push([cells[0].textContent, cells[1].textContent, cells[2].textContent, cells[3].textContent]);
      }
    });

    if (goalRows.length > 0) {
      doc.autoTable({
        startY: y,
        head:   [['Month', 'Goal', 'KPI', 'Action']],
        body:   goalRows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [26, 86, 219], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 50 }, 2: { cellWidth: 40 } }
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // ── PAGE 7: SWOT ──────────────────────────────────────────────────────────
    newPage(); y = margin + 4;
    sectionTitle('SWOT Analysis', '🔍');

    const swotColors = {
      Strengths: [240, 253, 244], Weaknesses: [254, 242, 242],
      Opportunities: [239, 246, 255], Threats: [255, 251, 235]
    };
    const swotData = {};
    document.querySelectorAll('.swot-card').forEach(card => {
      const heading = card.querySelector('h4').textContent.replace(/[^\w\s]/g, '').trim();
      swotData[heading] = Array.from(card.querySelectorAll('li')).map(li => li.textContent.trim());
    });

    const swotKeys = ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'];
    const half = contentW / 2 - 3;
    for (let row = 0; row < 2; row++) {
      const maxItems = Math.max(
        (swotData[swotKeys[row*2]] || []).length,
        (swotData[swotKeys[row*2+1]] || []).length
      );
      const boxH = Math.max(30, maxItems * 7 + 14);
      checkY(boxH + 4);

      [0, 1].forEach(col => {
        const key = swotKeys[row * 2 + col];
        const items = swotData[key] || [];
        const xPos = margin + col * (half + 6);
        const [r2, g2, b2] = swotColors[key] || [248, 250, 252];
        doc.setFillColor(r2, g2, b2);
        doc.roundedRect(xPos, y, half, boxH, 3, 3, 'F');
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
        doc.text(key, xPos + 4, y + 8);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(55, 65, 81);
        items.forEach((item, i) => {
          doc.text('• ' + item, xPos + 4, y + 16 + i * 7);
        });
      });
      y += boxH + 6;
    }
    doc.setTextColor(0, 0, 0);

    // ── PAGE 8: ACTION PLAN ───────────────────────────────────────────────────
    newPage(); y = margin + 4;
    sectionTitle('Prioritised Action Plan', '⚡');

    const actionRows = [];
    document.querySelectorAll('.action-item').forEach(item => {
      const priority = item.querySelector('.badge')?.textContent || '';
      const action   = item.querySelector('span[style*="font-weight:600"]')?.textContent || '';
      const meta     = item.querySelectorAll('[style*="font-size:12"]');
      const timeline = meta[0]?.textContent?.split('→')[0]?.replace('⏱', '').trim() || '';
      const outcome  = meta[0]?.textContent?.split('→')[1]?.replace('🎯', '').trim() || '';
      actionRows.push([priority, action, timeline, outcome]);
    });

    if (actionRows.length > 0) {
      doc.autoTable({
        startY: y,
        head:   [['Priority', 'Action', 'Timeline', 'Expected Outcome']],
        body:   actionRows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [26, 86, 219], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: 20 } }
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // ── SAVE ──────────────────────────────────────────────────────────────────
    const filename = `SM_Report_${bizName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);

    showToast('PDF downloaded successfully!', 'success');

  } catch (e) {
    console.error('PDF error:', e);
    showToast('PDF generation failed: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '📄 Download PDF Report';
  }
}
