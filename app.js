/* ============================================
   SMART KYC VAULT - Application Logic
   ============================================ */

// ==================== STATE ====================
const APP_STATE = {
    currentUser: null,
    currentPage: 'dashboard',
    demoMode: 'manual',
    demoFormType: 'bank',
    demoTimer: null,
    demoSeconds: 0,
    demoStarted: false,
    currentPurpose: 'banking',
    sidebarOpen: false,
    notifications: [],
};

// ==================== CONSTANTS ====================
const VAULT_FIELDS = {
    personal: [
        { key: 'firstName', label: 'First Name', icon: 'person', type: 'text', category: 'Personal' },
        { key: 'lastName', label: 'Last Name', icon: 'person', type: 'text', category: 'Personal' },
        { key: 'dob', label: 'Date of Birth', icon: 'cake', type: 'date', category: 'Personal' },
        { key: 'gender', label: 'Gender', icon: 'wc', type: 'select', category: 'Personal' },
        { key: 'email', label: 'Email Address', icon: 'mail', type: 'email', category: 'Personal' },
        { key: 'phone', label: 'Phone Number', icon: 'phone', type: 'tel', category: 'Personal' },
        { key: 'nationality', label: 'Nationality', icon: 'flag', type: 'text', category: 'Personal' },
        { key: 'maritalStatus', label: 'Marital Status', icon: 'favorite', type: 'select', category: 'Personal' },
    ],
    identity: [
        { key: 'aadhaar', label: 'Aadhaar Number', icon: 'credit_card', type: 'text', category: 'Identity' },
        { key: 'pan', label: 'PAN Number', icon: 'credit_card', type: 'text', category: 'Identity' },
        { key: 'passport', label: 'Passport Number', icon: 'flight', type: 'text', category: 'Identity' },
        { key: 'voterId', label: 'Voter ID', icon: 'how_to_vote', type: 'text', category: 'Identity' },
        { key: 'drivingLicense', label: 'Driving License', icon: 'directions_car', type: 'text', category: 'Identity' },
    ],
    address: [
        { key: 'addressLine1', label: 'Address Line 1', icon: 'location_on', type: 'text', category: 'Address' },
        { key: 'addressLine2', label: 'Address Line 2', icon: 'location_on', type: 'text', category: 'Address' },
        { key: 'city', label: 'City', icon: 'location_city', type: 'text', category: 'Address' },
        { key: 'state', label: 'State', icon: 'map', type: 'text', category: 'Address' },
        { key: 'pincode', label: 'PIN Code', icon: 'pin', type: 'text', category: 'Address' },
        { key: 'country', label: 'Country', icon: 'public', type: 'text', category: 'Address' },
    ],
    financial: [
        { key: 'bankName', label: 'Bank Name', icon: 'account_balance', type: 'text', category: 'Financial' },
        { key: 'accountNumber', label: 'Account Number', icon: 'credit_card', type: 'text', category: 'Financial' },
        { key: 'ifsc', label: 'IFSC Code', icon: 'code', type: 'text', category: 'Financial' },
        { key: 'annualIncome', label: 'Annual Income', icon: 'currency_rupee', type: 'select', category: 'Financial' },
    ],
    employment: [
        { key: 'occupation', label: 'Occupation', icon: 'work', type: 'select', category: 'Employment' },
        { key: 'employer', label: 'Employer Name', icon: 'business', type: 'text', category: 'Employment' },
        { key: 'designation', label: 'Designation', icon: 'badge', type: 'text', category: 'Employment' },
        { key: 'experience', label: 'Work Experience', icon: 'timeline', type: 'number', category: 'Employment' },
    ],
};

const ALL_FIELDS = Object.values(VAULT_FIELDS).flat();

const FORM_TEMPLATES = {
    bank: {
        title: 'Bank Account Opening Form',
        icon: 'account_balance',
        fields: ['firstName', 'lastName', 'dob', 'gender', 'email', 'phone', 'aadhaar', 'pan', 'addressLine1', 'city', 'state', 'pincode', 'occupation', 'annualIncome'],
    },
    passport: {
        title: 'Passport Application Form',
        icon: 'flight',
        fields: ['firstName', 'lastName', 'dob', 'gender', 'phone', 'email', 'addressLine1', 'addressLine2', 'city', 'state', 'pincode', 'country', 'nationality', 'aadhaar'],
    },
    university: {
        title: 'University Admission Form',
        icon: 'school',
        fields: ['firstName', 'lastName', 'dob', 'gender', 'email', 'phone', 'nationality', 'addressLine1', 'city', 'state', 'pincode', 'aadhaar', 'maritalStatus'],
    },
    insurance: {
        title: 'Insurance Application Form',
        icon: 'health_and_safety',
        fields: ['firstName', 'lastName', 'dob', 'gender', 'phone', 'email', 'aadhaar', 'pan', 'addressLine1', 'city', 'state', 'pincode', 'occupation', 'employer', 'annualIncome', 'bankName', 'accountNumber', 'ifsc'],
    },
};

const VALIDATION_RULES = {
    firstName: { required: true, pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Enter a valid name (2-50 letters)' },
    lastName: { required: true, pattern: /^[a-zA-Z\s]{1,50}$/, message: 'Enter a valid name (1-50 letters)' },
    dob: { required: true, message: 'Date of birth is required' },
    gender: { required: true, message: 'Gender is required' },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
    phone: { required: true, pattern: /^[\+]?[\d\s\-]{10,15}$/, message: 'Enter a valid phone (10-15 digits)' },
    aadhaar: { required: false, pattern: /^[\d\s]{12,14}$/, message: 'Aadhaar must be 12 digits' },
    pan: { required: false, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'PAN format: ABCDE1234F' },
    passport: { required: false, pattern: /^[A-Z][0-9]{7}$/, message: 'Passport format: A1234567' },
    voterId: { required: false, pattern: /^[A-Z]{3}[0-9]{7}$/, message: 'Voter ID format: ABC1234567' },
    drivingLicense: { required: false, pattern: /^[A-Z]{2}[-]?\d{2,}/, message: 'Enter a valid DL number' },
    addressLine1: { required: true, pattern: /^.{5,100}$/, message: 'Address must be 5-100 characters' },
    addressLine2: { required: false },
    city: { required: true, pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Enter a valid city name' },
    state: { required: true, pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Enter a valid state name' },
    pincode: { required: true, pattern: /^\d{6}$/, message: 'PIN code must be 6 digits' },
    country: { required: false, pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Enter a valid country name' },
    bankName: { required: false },
    accountNumber: { required: false, pattern: /^\d{9,18}$/, message: 'Account number: 9-18 digits' },
    ifsc: { required: false, pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'IFSC format: SBIN0001234' },
    annualIncome: { required: false },
    occupation: { required: false },
    employer: { required: false },
    designation: { required: false },
    experience: { required: false },
    nationality: { required: false },
    maritalStatus: { required: false },
};

const SAMPLE_DATA = {
    firstName: 'Arjun',
    lastName: 'Sharma',
    dob: '1995-08-15',
    gender: 'Male',
    email: 'arjun.sharma@example.com',
    phone: '+91 9876543210',
    nationality: 'Indian',
    maritalStatus: 'Single',
    aadhaar: '1234 5678 9012',
    pan: 'ABCDE1234F',
    passport: 'A1234567',
    voterId: 'ABC1234567',
    drivingLicense: 'DL-1420110012345',
    addressLine1: '42, Greenfield Apartments, MG Road',
    addressLine2: 'Near Central Mall, Sector 5',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    bankName: 'State Bank of India',
    accountNumber: '12345678901234',
    ifsc: 'SBIN0001234',
    annualIncome: '5L - 10L',
    occupation: 'Salaried',
    employer: 'TechCorp Solutions Pvt Ltd',
    designation: 'Senior Software Engineer',
    experience: '6',
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    createParticles();
});

function initSplashScreen() {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.style.display = 'none';
            checkAuth();
        }, 600);
    }, 2200);
}

function checkAuth() {
    const user = localStorage.getItem('kyc_user');
    if (user) {
        APP_STATE.currentUser = JSON.parse(user);
        showApp();
    } else {
        showAuth();
    }
}

// ==================== AUTH ====================
function showAuth() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('hidden');
}

function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('.material-icons-round');
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility_off';
    }
}

function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // check localStorage for user
    const users = JSON.parse(localStorage.getItem('kyc_users') || '[]');
    const user = users.find(u => u.email === email);
    if (!user) {
        showToast('Account not found. Please register first.', 'error');
        return;
    }
    if (user.password !== btoa(password)) {
        showToast('Incorrect password', 'error');
        return;
    }

    APP_STATE.currentUser = { email: user.email, firstName: user.firstName, lastName: user.lastName };
    localStorage.setItem('kyc_user', JSON.stringify(APP_STATE.currentUser));
    addAuditLog('login', 'Signed in to KYC Vault');
    showToast('Welcome back, ' + user.firstName + '!', 'success');
    showApp();
}

function handleRegister() {
    const firstName = document.getElementById('reg-first').value.trim();
    const lastName = document.getElementById('reg-last').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!firstName || !lastName || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('kyc_users') || '[]');
    if (users.find(u => u.email === email)) {
        showToast('An account with this email already exists', 'error');
        return;
    }

    const newUser = { firstName, lastName, email, password: btoa(password) };
    users.push(newUser);
    localStorage.setItem('kyc_users', JSON.stringify(users));

    APP_STATE.currentUser = { email, firstName, lastName };
    localStorage.setItem('kyc_user', JSON.stringify(APP_STATE.currentUser));

    // Initialize vault and consent data
    localStorage.setItem('kyc_vault_' + email, JSON.stringify({}));
    const defaultConsents = {};
    ALL_FIELDS.forEach(f => { defaultConsents[f.key] = true; });
    localStorage.setItem('kyc_consents_' + email, JSON.stringify(defaultConsents));
    localStorage.setItem('kyc_audit_' + email, JSON.stringify([]));
    localStorage.setItem('kyc_stats_' + email, JSON.stringify({ shared: 0, autofills: 0 }));

    addAuditLog('login', 'Account created and signed in');
    showToast('Account created! Welcome, ' + firstName + '!', 'success');
    showApp();
}

function handleLogout() {
    localStorage.removeItem('kyc_user');
    APP_STATE.currentUser = null;
    document.getElementById('app-screen').classList.add('hidden');
    showAuth();
    showToast('Signed out successfully', 'info');
}

// ==================== APP ====================
function showApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');

    const user = APP_STATE.currentUser;
    document.getElementById('sidebar-user-name').textContent = user.firstName + ' ' + user.lastName;
    document.getElementById('user-avatar').textContent = (user.firstName[0] + user.lastName[0]).toUpperCase();

    loadVaultData();
    loadNotifications();
    navigateTo('dashboard', document.querySelector('[data-page="dashboard"]'));
}

// ==================== NAVIGATION ====================
function navigateTo(pageId, navEl) {
    // hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });

    // show target page
    const page = document.getElementById('page-' + pageId);
    if (page) {
        page.style.display = 'block';
        // trigger reflow for animation
        void page.offsetWidth;
        page.classList.add('active');
    }

    // update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navEl) navEl.classList.add('active');

    // update title
    const titles = {
        dashboard: ['Dashboard', 'Overview of your KYC vault'],
        vault: ['My Vault', 'Manage your stored identity data'],
        autofill: ['Auto-Fill Demo', 'Experience manual vs auto-fill forms'],
        consent: ['Consent Manager', 'Control what data is shared'],
        audit: ['Audit Trail', 'Track all data access and changes'],
    };
    const [title, subtitle] = titles[pageId] || ['', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = subtitle;

    APP_STATE.currentPage = pageId;

    // close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
    }

    // page-specific init
    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'vault') loadVaultData();
    if (pageId === 'autofill') initAutoFillDemo();
    if (pageId === 'consent') renderConsentGrid();
    if (pageId === 'audit') renderAuditTrail();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
    } else {
        sidebar.classList.toggle('collapsed');
        const mainContent = document.getElementById('main-content');
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = 'var(--sidebar-collapsed)';
        } else {
            mainContent.style.marginLeft = 'var(--sidebar-width)';
        }
    }
}

// ==================== VAULT ====================
function getVaultData() {
    if (!APP_STATE.currentUser) return {};
    return JSON.parse(localStorage.getItem('kyc_vault_' + APP_STATE.currentUser.email) || '{}');
}

function setVaultData(data) {
    if (!APP_STATE.currentUser) return;
    localStorage.setItem('kyc_vault_' + APP_STATE.currentUser.email, JSON.stringify(data));
}

function loadVaultData() {
    const data = getVaultData();
    ALL_FIELDS.forEach(field => {
        const input = document.getElementById('vault-' + field.key);
        const status = document.getElementById('status-' + field.key);
        if (input) {
            input.value = data[field.key] || '';
            if (status) {
                if (data[field.key]) {
                    status.innerHTML = '<span class="material-icons-round" style="color:var(--success);font-size:16px">check_circle</span>';
                } else {
                    status.innerHTML = '<span class="material-icons-round" style="color:var(--text-muted);font-size:16px">radio_button_unchecked</span>';
                }
            }
        }
    });
}

function saveVaultField(key, value) {
    const data = getVaultData();
    const oldValue = data[key] || '';
    data[key] = value;
    setVaultData(data);

    // update status icon
    const status = document.getElementById('status-' + key);
    if (status) {
        if (value) {
            status.innerHTML = '<span class="material-icons-round" style="color:var(--success);font-size:16px">check_circle</span>';
        } else {
            status.innerHTML = '<span class="material-icons-round" style="color:var(--text-muted);font-size:16px">radio_button_unchecked</span>';
        }
    }

    // validate
    const rule = VALIDATION_RULES[key];
    const wrapper = document.getElementById('vault-' + key)?.closest('.input-wrapper');
    if (wrapper) {
        wrapper.classList.remove('error', 'success');
        if (value && rule?.pattern && !rule.pattern.test(value)) {
            wrapper.classList.add('error');
            showToast(rule.message, 'warning');
        } else if (value) {
            wrapper.classList.add('success');
        }
    }

    // audit log
    const field = ALL_FIELDS.find(f => f.key === key);
    const label = field ? field.label : key;
    if (oldValue !== value) {
        addAuditLog('field_updated', `Updated "${label}" in vault`);
    }

    // update dashboard if visible
    if (APP_STATE.currentPage === 'dashboard') updateDashboard();
}

function switchVaultTab(category, btn) {
    document.querySelectorAll('.vault-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.vault-section').forEach(s => s.classList.remove('active'));
    document.getElementById('vault-' + category).classList.add('active');
}

function formatAadhaar(input) {
    let val = input.value.replace(/\D/g, '');
    if (val.length > 12) val = val.substring(0, 12);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = val;
}

function loadSampleData() {
    const data = getVaultData();
    Object.keys(SAMPLE_DATA).forEach(key => {
        data[key] = SAMPLE_DATA[key];
    });
    setVaultData(data);
    loadVaultData();
    addAuditLog('field_updated', 'Loaded sample KYC data into vault');
    showToast('Sample data loaded successfully!', 'success');
    if (APP_STATE.currentPage === 'dashboard') updateDashboard();
}

function exportVaultData() {
    const data = getVaultData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kyc-vault-data.json';
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog('export', 'Exported vault data as JSON');
    showToast('Vault data exported', 'success');
}

// ==================== DASHBOARD ====================
function updateDashboard() {
    const data = getVaultData();
    const stats = getStats();
    const consents = getConsents();

    // stats
    const filledCount = ALL_FIELDS.filter(f => data[f.key]).length;
    animateCounter('stat-fields-count', filledCount);
    animateCounter('stat-shared-count', stats.shared);
    const activeConsents = Object.values(consents).filter(v => v).length;
    animateCounter('stat-consent-count', activeConsents);
    animateCounter('stat-autofill-count', stats.autofills);

    // completeness chart
    drawCompletenessChart(data);

    // security score
    updateSecurityScore(data, consents);

    // recent activity
    renderDashboardActivity();
}

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const duration = 600;
    const start = performance.now();

    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(current + (target - current) * eased);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function drawCompletenessChart(data) {
    const canvas = document.getElementById('completeness-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(2, 2);

    const categories = Object.keys(VAULT_FIELDS);
    const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const centerX = size / 2, centerY = size / 2, radius = 70, lineWidth = 18;

    ctx.clearRect(0, 0, size, size);

    let totalFields = 0, filledFields = 0;
    const catData = categories.map((cat, i) => {
        const fields = VAULT_FIELDS[cat];
        const filled = fields.filter(f => data[f.key]).length;
        totalFields += fields.length;
        filledFields += filled;
        return { name: cat, total: fields.length, filled, color: colors[i], percent: fields.length > 0 ? filled / fields.length : 0 };
    });

    const totalPercent = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    document.getElementById('completeness-percent').textContent = totalPercent + '%';

    // draw background ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // draw segments
    let startAngle = -Math.PI / 2;
    const totalAngle = Math.PI * 2;
    catData.forEach((cat) => {
        const segAngle = (cat.total / totalFields) * totalAngle;
        const fillAngle = segAngle * cat.percent;

        // filled
        if (fillAngle > 0.01) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + fillAngle);
            ctx.strokeStyle = cat.color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        startAngle += segAngle;
    });

    // legend
    const legend = document.getElementById('completeness-legend');
    legend.innerHTML = catData.map(cat =>
        `<div class="legend-item">
            <div class="legend-dot" style="background:${cat.color}"></div>
            ${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} (${cat.filled}/${cat.total})
        </div>`
    ).join('');
}

function updateSecurityScore(data, consents) {
    let score = 0;
    const tips = [];

    const filledCount = ALL_FIELDS.filter(f => data[f.key]).length;
    const filledPercent = filledCount / ALL_FIELDS.length;

    // completeness (max 30 pts)
    score += Math.round(filledPercent * 30);
    if (filledPercent >= 0.8) {
        tips.push({ icon: 'check_circle', text: 'Vault data is well filled', cls: 'good' });
    } else {
        tips.push({ icon: 'warning', text: 'Complete more vault fields', cls: 'warn' });
    }

    // password exists (20 pts)
    if (APP_STATE.currentUser) {
        score += 20;
        tips.push({ icon: 'check_circle', text: 'Account is secured with password', cls: 'good' });
    }

    // consents managed (max 25 pts)
    const totalConsents = Object.keys(consents).length;
    const disabledConsents = Object.values(consents).filter(v => !v).length;
    if (totalConsents > 0) {
        score += 15;
        if (disabledConsents > 0) {
            score += 10;
            tips.push({ icon: 'check_circle', text: 'Selective consent configured', cls: 'good' });
        } else {
            tips.push({ icon: 'info', text: 'Review consent settings', cls: 'warn' });
        }
    }

    // KYC docs (max 25 pts)
    const docs = ['aadhaar', 'pan', 'passport', 'voterId', 'drivingLicense'];
    const filledDocs = docs.filter(d => data[d]).length;
    score += Math.round((filledDocs / docs.length) * 25);
    if (filledDocs >= 3) {
        tips.push({ icon: 'check_circle', text: `${filledDocs} identity documents stored`, cls: 'good' });
    } else {
        tips.push({ icon: 'warning', text: 'Add more identity documents', cls: 'warn' });
    }

    score = Math.min(score, 100);

    // animate gauge
    const gaugeFill = document.getElementById('security-gauge-fill');
    if (gaugeFill) {
        const offset = 314 - (314 * score / 100);
        gaugeFill.style.strokeDashoffset = offset;
        gaugeFill.style.stroke = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
    }
    document.getElementById('security-score').textContent = score;

    // render tips
    const tipsEl = document.getElementById('security-tips');
    if (tipsEl) {
        tipsEl.innerHTML = tips.map(t =>
            `<div class="security-tip ${t.cls}">
                <span class="material-icons-round">${t.icon}</span>
                <span>${t.text}</span>
            </div>`
        ).join('');
    }
}

function renderDashboardActivity() {
    const logs = getAuditLogs().slice(0, 5);
    const container = document.getElementById('dashboard-activity-list');
    if (!container) return;

    if (logs.length === 0) {
        container.innerHTML = `<div class="empty-state small"><span class="material-icons-round">event_note</span><p>No recent activity</p></div>`;
        return;
    }

    container.innerHTML = logs.map(log => {
        const iconMap = {
            field_updated: { icon: 'edit', cls: 'update' },
            data_shared: { icon: 'share', cls: 'share' },
            consent_changed: { icon: 'tune', cls: 'consent' },
            autofill_used: { icon: 'bolt', cls: 'autofill' },
            login: { icon: 'login', cls: 'login' },
            export: { icon: 'download', cls: 'export' },
        };
        const { icon, cls } = iconMap[log.action] || { icon: 'info', cls: 'update' };
        return `
            <div class="activity-item">
                <div class="activity-icon ${cls}"><span class="material-icons-round">${icon}</span></div>
                <div class="activity-info">
                    <p>${log.detail}</p>
                    <small>${formatTime(log.timestamp)}</small>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== AUTO-FILL DEMO ====================
function initAutoFillDemo() {
    selectFormType(APP_STATE.demoFormType, document.querySelector(`.form-type-btn.active`));
}

function setDemoMode(mode) {
    APP_STATE.demoMode = mode;
    document.getElementById('mode-manual').classList.toggle('active', mode === 'manual');
    document.getElementById('mode-auto').classList.toggle('active', mode === 'auto');
    document.getElementById('demo-autofill-btn').style.display = mode === 'auto' ? 'inline-flex' : 'none';

    const info = document.getElementById('mode-info');
    if (mode === 'manual') {
        info.innerHTML = `<span class="material-icons-round">info</span><p>Manually type in every field — the traditional, slow way.</p>`;
    } else {
        info.innerHTML = `<span class="material-icons-round">bolt</span><p>Click <strong>Auto-Fill Now</strong> to instantly populate all fields from your vault. Only consented fields will be filled.</p>`;
    }

    renderDemoForm();
}

function selectFormType(type, btn) {
    APP_STATE.demoFormType = type;
    document.querySelectorAll('.form-type-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    resetDemoForm();
    renderDemoForm();
}

function renderDemoForm() {
    const template = FORM_TEMPLATES[APP_STATE.demoFormType];
    if (!template) return;

    document.getElementById('demo-form-title').innerHTML =
        `<span class="material-icons-round">${template.icon}</span> ${template.title}`;

    const container = document.getElementById('demo-form-container');
    document.getElementById('demo-fields-total').textContent = template.fields.length;
    document.getElementById('demo-fields-filled').textContent = '0';

    container.innerHTML = template.fields.map(key => {
        const field = ALL_FIELDS.find(f => f.key === key);
        if (!field) return '';
        const fullWidth = ['addressLine1', 'addressLine2'].includes(key) ? ' full-width' : '';

        let inputHtml = '';
        if (field.key === 'gender') {
            inputHtml = `<select id="demo-${key}" class="demo-input" onchange="onDemoFieldChange()" disabled>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>`;
        } else if (field.key === 'maritalStatus') {
            inputHtml = `<select id="demo-${key}" class="demo-input" onchange="onDemoFieldChange()" disabled>
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
            </select>`;
        } else if (field.key === 'annualIncome') {
            inputHtml = `<select id="demo-${key}" class="demo-input" onchange="onDemoFieldChange()" disabled>
                <option value="">Select Range</option>
                <option value="Below 2.5L">Below ₹2.5 Lakhs</option>
                <option value="2.5L - 5L">₹2.5L - ₹5 Lakhs</option>
                <option value="5L - 10L">₹5L - ₹10 Lakhs</option>
                <option value="10L - 25L">₹10L - ₹25 Lakhs</option>
                <option value="Above 25L">Above ₹25 Lakhs</option>
            </select>`;
        } else if (field.key === 'occupation') {
            inputHtml = `<select id="demo-${key}" class="demo-input" onchange="onDemoFieldChange()" disabled>
                <option value="">Select</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business">Business</option>
                <option value="Student">Student</option>
                <option value="Retired">Retired</option>
                <option value="Homemaker">Homemaker</option>
            </select>`;
        } else {
            const inputType = field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text';
            inputHtml = `<input type="${inputType}" id="demo-${key}" class="demo-input" placeholder="Enter ${field.label.toLowerCase()}" oninput="onDemoFieldChange()" disabled>`;
        }

        return `
            <div class="form-group demo-field${fullWidth}" id="demo-field-${key}">
                <label>${field.label}</label>
                <div class="input-wrapper" id="demo-wrapper-${key}">
                    <span class="material-icons-round">${field.icon}</span>
                    ${inputHtml}
                </div>
            </div>
        `;
    }).join('');

    // Enable fields based on mode
    if (APP_STATE.demoMode === 'manual') {
        container.querySelectorAll('.demo-input').forEach(input => {
            input.disabled = false;
        });
    }
}

function onDemoFieldChange() {
    if (!APP_STATE.demoStarted) {
        APP_STATE.demoStarted = true;
        startDemoTimer();
    }
    updateDemoFieldCount();
}

function startDemoTimer() {
    APP_STATE.demoSeconds = 0;
    clearInterval(APP_STATE.demoTimer);
    APP_STATE.demoTimer = setInterval(() => {
        APP_STATE.demoSeconds++;
        document.getElementById('demo-timer').textContent = formatTimer(APP_STATE.demoSeconds);
    }, 1000);
}

function updateDemoFieldCount() {
    const template = FORM_TEMPLATES[APP_STATE.demoFormType];
    let filled = 0;
    template.fields.forEach(key => {
        const el = document.getElementById('demo-' + key);
        if (el && el.value) filled++;
    });
    document.getElementById('demo-fields-filled').textContent = filled;
}

function formatTimer(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return m + ':' + s;
}

function resetDemoForm() {
    clearInterval(APP_STATE.demoTimer);
    APP_STATE.demoStarted = false;
    APP_STATE.demoSeconds = 0;
    document.getElementById('demo-timer').textContent = '00:00';
    document.getElementById('demo-errors').textContent = '0';
    document.getElementById('demo-fields-filled').textContent = '0';
    document.getElementById('comparison-card')?.classList.add('hidden');
}

async function triggerAutoFill() {
    const vaultData = getVaultData();
    const consents = getConsents();
    const template = FORM_TEMPLATES[APP_STATE.demoFormType];

    // check if vault has data
    const hasData = template.fields.some(key => vaultData[key]);
    if (!hasData) {
        showToast('No vault data found. Please add data to your vault first or load sample data.', 'warning');
        return;
    }

    // Start timer
    APP_STATE.demoStarted = true;
    startDemoTimer();

    // Enable all fields first
    document.querySelectorAll('.demo-input').forEach(input => { input.disabled = false; });

    // Sequentially auto-fill fields with animation
    for (let i = 0; i < template.fields.length; i++) {
        const key = template.fields[i];
        const value = vaultData[key];
        const hasConsent = consents[key] !== false;
        const input = document.getElementById('demo-' + key);
        const wrapper = document.getElementById('demo-wrapper-' + key);
        const fieldEl = document.getElementById('demo-field-' + key);

        if (input && value && hasConsent) {
            // animate
            if (fieldEl) fieldEl.classList.add('autofilling');
            if (wrapper) wrapper.classList.add('autofilled');

            await sleep(120);

            if (input.tagName === 'SELECT') {
                input.value = value;
            } else {
                // typing animation
                await typeText(input, value);
            }

            setTimeout(() => {
                if (fieldEl) fieldEl.classList.remove('autofilling');
            }, 600);
        } else if (input && !hasConsent) {
            // blocked by consent
            if (wrapper) {
                wrapper.style.borderColor = 'var(--warning)';
                wrapper.title = 'Blocked by consent settings';
            }
        }

        updateDemoFieldCount();
    }

    // Stop timer
    clearInterval(APP_STATE.demoTimer);
    const stats = getStats();
    stats.autofills++;
    setStats(stats);
    addAuditLog('autofill_used', `Auto-filled ${template.title}`);
    showToast('Form auto-filled from vault!', 'success');
}

async function typeText(input, text) {
    input.value = '';
    for (let i = 0; i < text.length; i++) {
        input.value += text[i];
        await sleep(25 + Math.random() * 15);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function validateAndSubmitDemo() {
    const template = FORM_TEMPLATES[APP_STATE.demoFormType];
    let errors = 0;

    template.fields.forEach(key => {
        const input = document.getElementById('demo-' + key);
        const wrapper = document.getElementById('demo-wrapper-' + key);
        if (!input) return;

        const value = input.value.trim();
        const rule = VALIDATION_RULES[key];

        if (wrapper) wrapper.classList.remove('error', 'success');

        if (rule?.required && !value) {
            if (wrapper) wrapper.classList.add('error');
            errors++;
        } else if (value && rule?.pattern && !rule.pattern.test(value)) {
            if (wrapper) wrapper.classList.add('error');
            errors++;
        } else if (value) {
            if (wrapper) wrapper.classList.add('success');
        }
    });

    document.getElementById('demo-errors').textContent = errors;

    // stop timer
    clearInterval(APP_STATE.demoTimer);

    if (errors === 0) {
        showToast('Application submitted successfully! All validations passed.', 'success');

        // show comparison
        showComparison();

        const stats = getStats();
        stats.shared++;
        setStats(stats);
        addAuditLog('data_shared', `Submitted ${template.title} (${APP_STATE.demoMode} mode)`);
    } else {
        showToast(`${errors} validation error${errors > 1 ? 's' : ''} found. Please correct and resubmit.`, 'error');
    }
}

function showComparison() {
    const card = document.getElementById('comparison-card');
    card.classList.remove('hidden');

    const currentTime = APP_STATE.demoSeconds;
    const isAuto = APP_STATE.demoMode === 'auto';

    // Simulated manual time (much longer)
    const manualTime = isAuto ? Math.max(currentTime * 12, 90) : currentTime;
    const autoTime = isAuto ? currentTime : Math.max(Math.round(currentTime / 12), 3);

    document.getElementById('comp-manual-time').textContent = formatTimer(manualTime);
    document.getElementById('comp-auto-time').textContent = formatTimer(autoTime);
    document.getElementById('comp-manual-errors').textContent = isAuto ? '3-5 possible' : document.getElementById('demo-errors').textContent + ' errors';
    document.getElementById('comp-auto-errors').textContent = isAuto ? '0 errors' : '0 estimated';

    const saved = Math.round(((manualTime - autoTime) / manualTime) * 100);
    document.getElementById('comp-time-saved').textContent = saved + '% faster';

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==================== CONSENT ====================
function getConsents() {
    if (!APP_STATE.currentUser) return {};
    return JSON.parse(localStorage.getItem('kyc_consents_' + APP_STATE.currentUser.email) || '{}');
}

function setConsents(data) {
    if (!APP_STATE.currentUser) return;
    localStorage.setItem('kyc_consents_' + APP_STATE.currentUser.email, JSON.stringify(data));
}

function renderConsentGrid() {
    const consents = getConsents();
    const grid = document.getElementById('consent-grid');

    grid.innerHTML = ALL_FIELDS.map(field => {
        const isEnabled = consents[field.key] !== false;
        return `
            <div class="consent-card ${isEnabled ? 'enabled' : ''}" id="consent-card-${field.key}" data-field="${field.key}">
                <div class="consent-card-icon">
                    <span class="material-icons-round">${field.icon}</span>
                </div>
                <div class="consent-card-info">
                    <h4>${field.label}</h4>
                    <p>${field.category} Data</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="consent-${field.key}" ${isEnabled ? 'checked' : ''} onchange="toggleConsent('${field.key}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
    }).join('');

    renderSharingPreview();
}

function toggleConsent(key, enabled) {
    const consents = getConsents();
    consents[key] = enabled;
    setConsents(consents);

    const card = document.getElementById('consent-card-' + key);
    if (card) card.classList.toggle('enabled', enabled);

    const field = ALL_FIELDS.find(f => f.key === key);
    const label = field ? field.label : key;
    addAuditLog('consent_changed', `${enabled ? 'Enabled' : 'Disabled'} sharing for "${label}"`);

    renderSharingPreview();
}

function bulkConsent(enable) {
    const consents = getConsents();
    ALL_FIELDS.forEach(f => { consents[f.key] = enable; });
    setConsents(consents);
    renderConsentGrid();
    addAuditLog('consent_changed', `${enable ? 'Enabled' : 'Disabled'} all data sharing`);
    showToast(`All fields ${enable ? 'enabled' : 'disabled'} for sharing`, 'info');
}

function filterConsentFields(search) {
    const query = search.toLowerCase();
    document.querySelectorAll('.consent-card').forEach(card => {
        const fieldKey = card.dataset.field;
        const field = ALL_FIELDS.find(f => f.key === fieldKey);
        const match = field && (field.label.toLowerCase().includes(query) || field.category.toLowerCase().includes(query));
        card.style.display = match || !query ? 'flex' : 'none';
    });
}

function selectPurpose(purpose, btn) {
    APP_STATE.currentPurpose = purpose;
    document.querySelectorAll('.purpose-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderSharingPreview();
}

function renderSharingPreview() {
    const consents = getConsents();
    const preview = document.getElementById('sharing-preview');
    const enabledFields = ALL_FIELDS.filter(f => consents[f.key] !== false);

    if (enabledFields.length === 0) {
        preview.innerHTML = '<p style="color:var(--text-tertiary);font-size:0.85rem;">No fields enabled for sharing</p>';
    } else {
        preview.innerHTML = `
            <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:12px;">
                <strong>${enabledFields.length}</strong> of ${ALL_FIELDS.length} fields will be shared for <strong>${APP_STATE.currentPurpose}</strong> purpose:
            </p>
            ${enabledFields.map(f =>
                `<span class="sharing-field"><span class="material-icons-round">check</span>${f.label}</span>`
            ).join('')}
        `;
    }
}

function confirmConsent() {
    const consents = getConsents();
    const enabledCount = Object.values(consents).filter(v => v !== false).length;
    addAuditLog('consent_changed', `Confirmed consent settings (${enabledCount} fields enabled for ${APP_STATE.currentPurpose})`);
    showToast(`Consent settings saved! ${enabledCount} fields enabled for sharing.`, 'success');
}

// ==================== AUDIT TRAIL ====================
function getAuditLogs() {
    if (!APP_STATE.currentUser) return [];
    return JSON.parse(localStorage.getItem('kyc_audit_' + APP_STATE.currentUser.email) || '[]');
}

function addAuditLog(action, detail) {
    if (!APP_STATE.currentUser) return;
    const logs = getAuditLogs();
    logs.unshift({
        id: Date.now() + '_' + Math.random().toString(36).substring(2, 8),
        action,
        detail,
        timestamp: new Date().toISOString(),
        user: APP_STATE.currentUser.email,
    });
    // max 200 logs
    if (logs.length > 200) logs.length = 200;
    localStorage.setItem('kyc_audit_' + APP_STATE.currentUser.email, JSON.stringify(logs));
}

function renderAuditTrail() {
    const logs = filterAuditLogsData();
    const container = document.getElementById('audit-timeline');

    if (logs.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="material-icons-round">receipt_long</span><p>No audit logs found</p></div>`;
        return;
    }

    const iconMap = {
        field_updated: { icon: 'edit', color: 'var(--info)' },
        data_shared: { icon: 'share', color: 'var(--success)' },
        consent_changed: { icon: 'tune', color: 'var(--warning)' },
        autofill_used: { icon: 'bolt', color: 'var(--accent-primary-light)' },
        login: { icon: 'login', color: 'var(--accent-secondary)' },
        export: { icon: 'download', color: 'var(--warning)' },
    };

    container.innerHTML = logs.map(log => {
        const { icon, color } = iconMap[log.action] || { icon: 'info', color: 'var(--text-secondary)' };
        return `
            <div class="audit-item">
                <div class="audit-item-header">
                    <span class="audit-item-action" style="color:${color}">
                        <span class="material-icons-round">${icon}</span>
                        ${formatActionName(log.action)}
                    </span>
                    <span class="audit-item-time">${formatTime(log.timestamp)}</span>
                </div>
                <div class="audit-item-detail">${log.detail}</div>
            </div>
        `;
    }).join('');
}

function filterAuditLogsData() {
    let logs = getAuditLogs();
    const actionFilter = document.getElementById('audit-action-filter')?.value;
    const dateFrom = document.getElementById('audit-date-from')?.value;
    const dateTo = document.getElementById('audit-date-to')?.value;

    if (actionFilter && actionFilter !== 'all') {
        logs = logs.filter(l => l.action === actionFilter);
    }
    if (dateFrom) {
        logs = logs.filter(l => l.timestamp >= dateFrom);
    }
    if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setDate(toDate.getDate() + 1);
        logs = logs.filter(l => l.timestamp < toDate.toISOString());
    }
    return logs;
}

function filterAuditLogs() {
    renderAuditTrail();
}

function exportAuditLogs() {
    const logs = getAuditLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kyc-audit-logs.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Audit logs exported', 'success');
}

function formatActionName(action) {
    const names = {
        field_updated: 'Field Updated',
        data_shared: 'Data Shared',
        consent_changed: 'Consent Changed',
        autofill_used: 'Auto-Fill Used',
        login: 'Sign In',
        export: 'Data Export',
    };
    return names[action] || action;
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ==================== STATS ====================
function getStats() {
    if (!APP_STATE.currentUser) return { shared: 0, autofills: 0 };
    return JSON.parse(localStorage.getItem('kyc_stats_' + APP_STATE.currentUser.email) || '{"shared":0,"autofills":0}');
}

function setStats(stats) {
    if (!APP_STATE.currentUser) return;
    localStorage.setItem('kyc_stats_' + APP_STATE.currentUser.email, JSON.stringify(stats));
}

// ==================== NOTIFICATIONS ====================
function loadNotifications() {
    APP_STATE.notifications = [
        { icon: 'security', text: 'Your vault security score can be improved', time: '2h ago' },
        { icon: 'verified_user', text: 'Complete your identity documents for full verification', time: '5h ago' },
        { icon: 'tips_and_updates', text: 'Welcome to Smart KYC Vault!', time: '1d ago' },
    ];
    renderNotifications();
}

function renderNotifications() {
    const list = document.getElementById('notification-list');
    const badge = document.getElementById('notification-badge');
    badge.textContent = APP_STATE.notifications.length;
    badge.style.display = APP_STATE.notifications.length > 0 ? 'flex' : 'none';

    if (APP_STATE.notifications.length === 0) {
        list.innerHTML = '<div class="empty-state small" style="padding:20px"><p>No notifications</p></div>';
        return;
    }

    list.innerHTML = APP_STATE.notifications.map(n =>
        `<div class="notification-item">
            <span class="material-icons-round">${n.icon}</span>
            <div class="notification-item-content">
                <p>${n.text}</p>
                <small>${n.time}</small>
            </div>
        </div>`
    ).join('');
}

function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('hidden');
}

function clearNotifications() {
    APP_STATE.notifications = [];
    renderNotifications();
    document.getElementById('notification-panel').classList.add('hidden');
}

// Close notifications when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notification-panel');
    const btn = document.getElementById('notification-btn');
    if (panel && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.add('hidden');
    }
});

// ==================== TOAST ====================
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="material-icons-round">${icons[type]}</span>
        <div class="toast-content">
            <p>${message}</p>
        </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==================== MODAL ====================
function openModal(title, bodyHtml, footerHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-footer').innerHTML = footerHtml || '';
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// ==================== PARTICLES ====================
function createParticles() {
    const container = document.getElementById('auth-particles');
    if (!container) return;
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (4 + Math.random() * 8) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.width = (2 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = Math.random() > 0.5 ? 'var(--accent-primary)' : 'var(--accent-secondary)';
        container.appendChild(particle);
    }
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // Escape to close modals/panels
    if (e.key === 'Escape') {
        closeModal();
        document.getElementById('notification-panel')?.classList.add('hidden');
    }
});
