// input.js

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
});

let currentStep = 1;

function goToStep(step) {
  const alert = document.getElementById('formAlert');
  alert.classList.add('hidden');

  // Validate current step before advancing
  if (step > currentStep) {
    if (!validateStep(currentStep)) return;
  }

  // Hide all sections
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');

  // Update step dots
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById(`stepDot${i}`);
    dot.classList.remove('active', 'done');
    if (i < step)      dot.classList.add('done');
    else if (i === step) dot.classList.add('active');
  }

  currentStep = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
  const alert = document.getElementById('formAlert');

  if (step === 1) {
    const name = document.getElementById('businessName').value.trim();
    const type = document.getElementById('businessType').value;
    const desc = document.getElementById('businessDesc').value.trim();

    if (!name) { showFormAlert('Please enter your business name.'); return false; }
    if (!type) { showFormAlert('Please select a business type / industry.'); return false; }
    if (desc.length < 20) { showFormAlert('Please provide a more detailed description (at least 20 characters).'); return false; }
  }

  if (step === 2) {
    const checked = document.querySelectorAll('.platform-option:checked');
    if (checked.length === 0) {
      showFormAlert('Please select at least one social media platform.');
      return false;
    }
  }

  return true;
}

function showFormAlert(msg) {
  const alert = document.getElementById('formAlert');
  alert.textContent = '⚠️ ' + msg;
  alert.classList.remove('hidden');
  alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function submitForm() {
  if (!validateStep(3)) return;

  const platforms = Array.from(document.querySelectorAll('.platform-option:checked'))
    .map(cb => cb.value);

  const businessData = {
    business_name:    document.getElementById('businessName').value.trim(),
    business_type:    document.getElementById('businessType').value,
    description:      document.getElementById('businessDesc').value.trim(),
    target_province:  document.getElementById('targetProvince').value,
    location:         document.getElementById('bizLocation').value.trim() || 'Sri Lanka',
    platforms:        platforms,
    current_followers: parseInt(document.getElementById('currentFollowers').value) || 0,
  };

  // Show overlay
  const overlay = document.getElementById('genOverlay');
  overlay.classList.remove('hidden');

  const statusMessages = [
    'Analysing your business with Google Gemini AI…',
    'Identifying your target audience…',
    'Building your content strategy…',
    'Generating growth forecasts…',
    'Finalising your report…'
  ];
  let msgIndex = 0;
  const statusEl = document.getElementById('genStatus');
  const msgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % statusMessages.length;
    statusEl.textContent = statusMessages[msgIndex];
  }, 2500);

  try {
    // 1. Save business
    const bizRes = await API.post('/api/businesses/', businessData);
    const businessId = bizRes.business_id;

    // 2. Generate report
    const reportRes = await API.post('/api/reports/generate', { business_id: businessId });

    clearInterval(msgInterval);
    overlay.classList.add('hidden');

    // Redirect to report page
    window.location.href = `report.html?id=${reportRes.report_id}`;

  } catch (e) {
    clearInterval(msgInterval);
    overlay.classList.add('hidden');
    showFormAlert('Error generating report: ' + e.message + '. Please try again.');
  }
}
