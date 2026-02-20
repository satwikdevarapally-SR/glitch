/* ============================================
   SMART KYC VAULT - Firebase Integrated App
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
        { key: 'username', label: 'Username', icon: 'account_circle', type: 'text', category: 'Personal' },
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
    bank: { title: 'Bank Account Opening Form', icon: 'account_balance', fields: ['firstName', 'lastName', 'dob', 'gender', 'email', 'phone', 'aadhaar', 'pan', 'addressLine1', 'city', 'state', 'pincode', 'occupation', 'annualIncome'] },
    passport: { title: 'Passport Application Form', icon: 'flight', fields: ['firstName', 'lastName', 'dob', 'gender', 'phone', 'email', 'addressLine1', 'addressLine2', 'city', 'state', 'pincode', 'country', 'nationality', 'aadhaar'] },
    university: { title: 'University Admission Form', icon: 'school', fields: ['firstName', 'lastName', 'dob', 'gender', 'email', 'phone', 'nationality', 'addressLine1', 'city', 'state', 'pincode', 'aadhaar', 'maritalStatus'] },
    insurance: { title: 'Insurance Application Form', icon: 'health_and_safety', fields: ['firstName', 'lastName', 'dob', 'gender', 'phone', 'email', 'aadhaar', 'pan', 'addressLine1', 'city', 'state', 'pincode', 'occupation', 'employer', 'annualIncome', 'bankName', 'accountNumber', 'ifsc'] },
};

const VALIDATION_RULES = {
    firstName: { required: true, pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Enter a valid name (2-50 letters)' },
    lastName: { required: true, pattern: /^[a-zA-Z\s]{1,50}$/, message: 'Enter a valid name' },
    dob: { required: true, message: 'Date of birth is required' },
    gender: { required: true, message: 'Gender is required' },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
    phone: { required: true, pattern: /^[\+]?[\d\s\-]{10,15}$/, message: 'Enter valid phone (10-15 digits)' },
    aadhaar: { required: false, pattern: /^[\d\s]{12,14}$/, message: 'Aadhaar must be 12 digits' },
    pan: { required: false, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'PAN format: ABCDE1234F' },
    passport: { required: false, pattern: /^[A-Z][0-9]{7}$/, message: 'Passport format: A1234567' },
    voterId: { required: false, pattern: /^[A-Z]{3}[0-9]{7}$/, message: 'Voter ID format: ABC1234567' },
    drivingLicense: { required: false, pattern: /^[A-Z]{2}[-]?\d{2,}/, message: 'Enter a valid DL number' },
    addressLine1: { required: true, pattern: /^.{5,100}$/, message: 'Address must be 5-100 chars' },
    addressLine2: { required: false }, city: { required: true, pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Enter valid city' },
    state: { required: true, pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Enter valid state' },
    pincode: { required: true, pattern: /^\d{6}$/, message: 'PIN code must be 6 digits' },
    country: { required: false }, bankName: { required: false }, accountNumber: { required: false, pattern: /^\d{9,18}$/, message: 'Account: 9-18 digits' },
    ifsc: { required: false, pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'IFSC format: SBIN0001234' },
    annualIncome: { required: false }, occupation: { required: false }, employer: { required: false },
    designation: { required: false }, experience: { required: false }, nationality: { required: false }, maritalStatus: { required: false },
    username: { required: false, pattern: /^[a-zA-Z0-9._]{3,30}$/, message: 'Username: 3-30 chars, letters/numbers/dots/underscores' },
};

const SAMPLE_DATA = {
    firstName: 'Arjun', lastName: 'Sharma', username: 'arjun.sharma', dob: '1995-08-15', gender: 'Male',
    email: 'arjun.sharma@example.com', phone: '+91 9876543210', nationality: 'Indian', maritalStatus: 'Single',
    aadhaar: '1234 5678 9012', pan: 'ABCDE1234F', passport: 'A1234567', voterId: 'ABC1234567', drivingLicense: 'DL-1420110012345',
    addressLine1: '42, Greenfield Apartments, MG Road', addressLine2: 'Near Central Mall, Sector 5',
    city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India',
    bankName: 'State Bank of India', accountNumber: '12345678901234', ifsc: 'SBIN0001234', annualIncome: '5L - 10L',
    occupation: 'Salaried', employer: 'TechCorp Solutions Pvt Ltd', designation: 'Senior Software Engineer', experience: '6',
};

// Email verification settings — redirects user back to app after clicking link
const EMAIL_ACTION_SETTINGS = {
    url: window.location.origin + window.location.pathname,
    handleCodeInApp: false
};

// ==================== FIREBASE HELPERS ======================================
function fb() { return window.firebaseModules; }
function auth() { return window.firebaseAuth; }
function db() { return window.firebaseDb; }
function uid() { return APP_STATE.currentUser?.uid; }

async function fbGetDoc(path) {
    try {
        const snap = await fb().getDoc(fb().doc(db(), path));
        return snap.exists() ? snap.data() : null;
    } catch (e) { console.error('Firestore get error:', e); return null; }
}

async function fbSetDoc(path, data, merge = true) {
    try { await fb().setDoc(fb().doc(db(), path), data, { merge }); }
    catch (e) { console.error('Firestore set error:', e); }
}

async function fbAddDoc(collPath, data) {
    try { await fb().addDoc(fb().collection(db(), collPath), data); }
    catch (e) { console.error('Firestore add error:', e); }
}

async function fbQueryDocs(collPath, orderField, orderDir, limitNum) {
    try {
        const q = fb().query(fb().collection(db(), collPath), fb().orderBy(orderField, orderDir), fb().limit(limitNum));
        const snap = await fb().getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.error('Firestore query error:', e); return []; }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    createParticles();
});

function initSplashScreen() {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.classList.add('fade-out');
        setTimeout(() => { splash.style.display = 'none'; initFirebaseAuth(); }, 600);
    }, 2200);
}

function initFirebaseAuth() {
    // Wait for firebase-config.js to load
    const check = setInterval(() => {
        if (window.firebaseAuth && window.firebaseModules) {
            clearInterval(check);
            fb().onAuthStateChanged(auth(), (user) => {
                if (user) {
                    APP_STATE.currentUser = user;
                    if (user.emailVerified) {
                        showApp();
                    } else {
                        showVerifyScreen(user);
                    }
                } else {
                    APP_STATE.currentUser = null;
                    showAuth();
                }
            });
        }
    }, 100);
}

// ==================== AUTH ====================
function showAuth() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('verify-screen').classList.add('hidden');
    stopVerifyPolling();
}

let _verifyPollInterval = null;

function showVerifyScreen(user) {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('verify-screen').classList.remove('hidden');
    document.getElementById('verify-email-display').textContent = user.email;
    // Start auto-polling every 3 seconds
    startVerifyPolling();
}

function startVerifyPolling() {
    stopVerifyPolling();
    _verifyPollInterval = setInterval(async () => {
        const user = auth().currentUser;
        if (!user) return;
        try {
            await user.reload();
            if (user.emailVerified) {
                stopVerifyPolling();
                APP_STATE.currentUser = user;
                showToast('Email verified! Welcome to KYC Vault!', 'success');
                showApp();
                addAuditLog('login', 'Email verified and signed in');
            }
        } catch (e) { /* silently retry */ }
    }, 3000);
}

function stopVerifyPolling() {
    if (_verifyPollInterval) {
        clearInterval(_verifyPollInterval);
        _verifyPollInterval = null;
    }
}

window.checkVerification = async function () {
    const user = auth().currentUser;
    if (!user) { showToast('No user session found. Please sign in again.', 'error'); showAuth(); return; }
    try {
        await user.reload(); // Refresh user data from Firebase
        if (user.emailVerified) {
            APP_STATE.currentUser = user;
            showToast('Email verified! Welcome to KYC Vault!', 'success');
            showApp();
            addAuditLog('login', 'Email verified and signed in');
        } else {
            showToast('Email not yet verified. Please check your inbox and click the link.', 'warning');
        }
    } catch (e) {
        showToast('Error checking verification: ' + e.message, 'error');
    }
};

window.resendVerification = async function () {
    const user = auth().currentUser;
    if (!user) { showToast('No user session found.', 'error'); return; }
    const btn = document.getElementById('resend-btn');
    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-round">hourglass_top</span> Sending...';
        await fb().sendEmailVerification(user, EMAIL_ACTION_SETTINGS);
        showToast('Verification email sent! Check your inbox.', 'success');
        btn.innerHTML = '<span class="material-icons-round">check</span> Email Sent!';
        // Cooldown: disable for 60 seconds
        let seconds = 60;
        const interval = setInterval(() => {
            seconds--;
            btn.innerHTML = `<span class="material-icons-round">schedule</span> Resend in ${seconds}s`;
            if (seconds <= 0) {
                clearInterval(interval);
                btn.disabled = false;
                btn.innerHTML = '<span class="material-icons-round">refresh</span> Resend Verification Email';
            }
        }, 1000);
    } catch (e) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-icons-round">refresh</span> Resend Verification Email';
        const msg = e.code === 'auth/too-many-requests' ? 'Too many requests. Please wait a few minutes.' : e.message;
        showToast(msg, 'error');
    }
};
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}
function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}
window.showLogin = showLogin;
window.showRegister = showRegister;

window.togglePassword = function (inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('.material-icons-round');
    if (input.type === 'password') { input.type = 'text'; icon.textContent = 'visibility'; }
    else { input.type = 'password'; icon.textContent = 'visibility_off'; }
};

window.handleLogin = async function () {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
    try {
        const cred = await fb().signInWithEmailAndPassword(auth(), email, password);
        if (!cred.user.emailVerified) {
            showToast('Please verify your email first. Check your inbox.', 'warning');
            showVerifyScreen(cred.user);
            return;
        }
        showToast('Welcome back!', 'success');
        addAuditLog('login', 'Signed in to KYC Vault');
    } catch (e) {
        const msg = e.code === 'auth/user-not-found' ? 'No account found. Please register.' :
            e.code === 'auth/wrong-password' ? 'Incorrect password.' :
                e.code === 'auth/invalid-credential' ? 'Invalid credentials. Check email/password.' : e.message;
        showToast(msg, 'error');
    }
};

window.handleRegister = async function () {
    const firstName = document.getElementById('reg-first').value.trim();
    const lastName = document.getElementById('reg-last').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    if (!firstName || !lastName || !email || !password) { showToast('Please fill in all fields', 'error'); return; }
    if (password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    try {
        const cred = await fb().createUserWithEmailAndPassword(auth(), email, password);
        await fb().updateProfile(cred.user, { displayName: firstName + ' ' + lastName });
        // Send verification email
        await fb().sendEmailVerification(cred.user, EMAIL_ACTION_SETTINGS);
        // Init Firestore docs for user
        await fbSetDoc(`users/${cred.user.uid}/data/vault`, {});
        const defaultConsents = {}; ALL_FIELDS.forEach(f => { defaultConsents[f.key] = true; });
        await fbSetDoc(`users/${cred.user.uid}/data/consents`, defaultConsents);
        await fbSetDoc(`users/${cred.user.uid}/data/stats`, { shared: 0, autofills: 0 });
        showToast('Account created! Please verify your email.', 'success');
        showVerifyScreen(cred.user);
    } catch (e) {
        const msg = e.code === 'auth/email-already-in-use' ? 'Email already registered.' : e.message;
        showToast(msg, 'error');
    }
};

window.handleLogout = async function () {
    try { await fb().signOut(auth()); showToast('Signed out', 'info'); }
    catch (e) { showToast('Sign out failed', 'error'); }
};

// ==================== APP ====================
async function showApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('verify-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    stopVerifyPolling();
    const user = APP_STATE.currentUser;
    const name = user.displayName || user.email;
    const parts = name.split(' ');
    document.getElementById('sidebar-user-name').textContent = name;
    document.getElementById('user-avatar').textContent = (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    await loadVaultData();
    loadNotifications();
    navigateTo('dashboard', document.querySelector('[data-page="dashboard"]'));
}

// ==================== NAVIGATION ====================
window.navigateTo = function (pageId, navEl) {
    document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
    const page = document.getElementById('page-' + pageId);
    if (page) { page.style.display = 'block'; void page.offsetWidth; page.classList.add('active'); }
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navEl) navEl.classList.add('active');
    const titles = { dashboard: ['Dashboard', 'Overview of your KYC vault'], vault: ['My Vault', 'Manage your stored identity data'], autofill: ['Auto-Fill Demo', 'Experience manual vs auto-fill forms'], scanner: ['Form Scanner', 'Upload & digitize paper forms with AI'], consent: ['Consent Manager', 'Control what data is shared'], audit: ['Audit Trail', 'Track all data access and changes'] };
    const [title, subtitle] = titles[pageId] || ['', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = subtitle;
    APP_STATE.currentPage = pageId;
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'vault') loadVaultData();
    if (pageId === 'autofill') initAutoFillDemo();
    if (pageId === 'consent') renderConsentGrid();
    if (pageId === 'audit') renderAuditTrail();
    if (pageId === 'scanner') initFormScanner();
};

window.toggleSidebar = function () {
    const sb = document.getElementById('sidebar');
    if (window.innerWidth <= 768) { sb.classList.toggle('open'); }
    else {
        sb.classList.toggle('collapsed');
        document.getElementById('main-content').style.marginLeft = sb.classList.contains('collapsed') ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';
    }
};

// ==================== VAULT (FIRESTORE) ====================
let _vaultCache = {};
async function getVaultData() {
    if (!uid()) return {};
    const data = await fbGetDoc(`users/${uid()}/data/vault`);
    _vaultCache = data || {};
    return _vaultCache;
}
function getVaultCache() { return _vaultCache; }

async function loadVaultData() {
    const data = await getVaultData();
    ALL_FIELDS.forEach(field => {
        const input = document.getElementById('vault-' + field.key);
        const status = document.getElementById('status-' + field.key);
        if (input) {
            input.value = data[field.key] || '';
            if (status) {
                status.innerHTML = data[field.key]
                    ? '<span class="material-icons-round" style="color:var(--success);font-size:16px">check_circle</span>'
                    : '<span class="material-icons-round" style="color:var(--text-muted);font-size:16px">radio_button_unchecked</span>';
            }
        }
    });
}

window.saveVaultField = async function (key, value) {
    _vaultCache[key] = value;
    await fbSetDoc(`users/${uid()}/data/vault`, { [key]: value }, true);
    const status = document.getElementById('status-' + key);
    if (status) {
        status.innerHTML = value
            ? '<span class="material-icons-round" style="color:var(--success);font-size:16px">check_circle</span>'
            : '<span class="material-icons-round" style="color:var(--text-muted);font-size:16px">radio_button_unchecked</span>';
    }
    const rule = VALIDATION_RULES[key];
    const wrapper = document.getElementById('vault-' + key)?.closest('.input-wrapper');
    if (wrapper) {
        wrapper.classList.remove('error', 'success');
        if (value && rule?.pattern && !rule.pattern.test(value)) { wrapper.classList.add('error'); showToast(rule.message, 'warning'); }
        else if (value) wrapper.classList.add('success');
    }
    const field = ALL_FIELDS.find(f => f.key === key);
    addAuditLog('field_updated', `Updated "${field?.label || key}" in vault`);
    if (APP_STATE.currentPage === 'dashboard') updateDashboard();
};

window.switchVaultTab = function (category, btn) {
    document.querySelectorAll('.vault-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.vault-section').forEach(s => s.classList.remove('active'));
    document.getElementById('vault-' + category).classList.add('active');
};

window.formatAadhaar = function (input) {
    let val = input.value.replace(/\D/g, '');
    if (val.length > 12) val = val.substring(0, 12);
    input.value = val.replace(/(\d{4})(?=\d)/g, '$1 ');
};

window.loadSampleData = async function () {
    _vaultCache = { ..._vaultCache, ...SAMPLE_DATA };
    await fbSetDoc(`users/${uid()}/data/vault`, SAMPLE_DATA, true);
    await loadVaultData();
    addAuditLog('field_updated', 'Loaded sample KYC data into vault');
    showToast('Sample data loaded!', 'success');
    if (APP_STATE.currentPage === 'dashboard') updateDashboard();
};

window.exportVaultData = function () {
    const blob = new Blob([JSON.stringify(_vaultCache, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kyc-vault-data.json'; a.click();
    addAuditLog('export', 'Exported vault data as JSON');
    showToast('Vault data exported', 'success');
};

// ==================== DASHBOARD ====================
async function updateDashboard() {
    const data = getVaultCache();
    const stats = await fbGetDoc(`users/${uid()}/data/stats`) || { shared: 0, autofills: 0 };
    const consents = await fbGetDoc(`users/${uid()}/data/consents`) || {};
    const filledCount = ALL_FIELDS.filter(f => data[f.key]).length;
    animateCounter('stat-fields-count', filledCount);
    animateCounter('stat-shared-count', stats.shared || 0);
    animateCounter('stat-consent-count', Object.values(consents).filter(v => v).length);
    animateCounter('stat-autofill-count', stats.autofills || 0);
    drawCompletenessChart(data);
    updateSecurityScore(data, consents);
    renderDashboardActivity();
}

function animateCounter(elId, target) {
    const el = document.getElementById(elId); if (!el) return;
    const cur = parseInt(el.textContent) || 0; if (cur === target) return;
    const start = performance.now();
    (function update(now) {
        const p = Math.min((now - start) / 600, 1);
        el.textContent = Math.round(cur + (target - cur) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(update);
    })(start);
}

function drawCompletenessChart(data) {
    const canvas = document.getElementById('completeness-chart'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); const size = 200;
    canvas.width = size * 2; canvas.height = size * 2; canvas.style.width = size + 'px'; canvas.style.height = size + 'px'; ctx.scale(2, 2);
    const cats = Object.keys(VAULT_FIELDS); const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const cX = size / 2, cY = size / 2, r = 70, lw = 18;
    ctx.clearRect(0, 0, size, size);
    let total = 0, filled = 0;
    const catData = cats.map((cat, i) => {
        const fields = VAULT_FIELDS[cat]; const f = fields.filter(f => data[f.key]).length;
        total += fields.length; filled += f;
        return { name: cat, total: fields.length, filled: f, color: colors[i], pct: fields.length ? f / fields.length : 0 };
    });
    document.getElementById('completeness-percent').textContent = total ? Math.round(filled / total * 100) + '%' : '0%';
    ctx.beginPath(); ctx.arc(cX, cY, r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = lw; ctx.stroke();
    let start = -Math.PI / 2;
    catData.forEach(cat => {
        const seg = (cat.total / total) * Math.PI * 2; const fill = seg * cat.pct;
        if (fill > 0.01) { ctx.beginPath(); ctx.arc(cX, cY, r, start, start + fill); ctx.strokeStyle = cat.color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); }
        start += seg;
    });
    document.getElementById('completeness-legend').innerHTML = catData.map(c =>
        `<div class="legend-item"><div class="legend-dot" style="background:${c.color}"></div>${c.name.charAt(0).toUpperCase() + c.name.slice(1)} (${c.filled}/${c.total})</div>`).join('');
}

function updateSecurityScore(data, consents) {
    let score = 0; const tips = [];
    const pct = ALL_FIELDS.filter(f => data[f.key]).length / ALL_FIELDS.length;
    score += Math.round(pct * 30);
    tips.push(pct >= 0.8 ? { icon: 'check_circle', text: 'Vault data well filled', cls: 'good' } : { icon: 'warning', text: 'Complete more vault fields', cls: 'warn' });
    if (APP_STATE.currentUser) { score += 20; tips.push({ icon: 'check_circle', text: 'Account secured', cls: 'good' }); }
    const dis = Object.values(consents).filter(v => !v).length;
    score += 15; if (dis > 0) { score += 10; tips.push({ icon: 'check_circle', text: 'Selective consent configured', cls: 'good' }); }
    else tips.push({ icon: 'info', text: 'Review consent settings', cls: 'warn' });
    const docs = ['aadhaar', 'pan', 'passport', 'voterId', 'drivingLicense'].filter(d => data[d]).length;
    score += Math.round((docs / 5) * 25);
    tips.push(docs >= 3 ? { icon: 'check_circle', text: `${docs} identity docs stored`, cls: 'good' } : { icon: 'warning', text: 'Add more identity documents', cls: 'warn' });
    score = Math.min(score, 100);
    const gf = document.getElementById('security-gauge-fill');
    if (gf) { gf.style.strokeDashoffset = 314 - (314 * score / 100); gf.style.stroke = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'; }
    document.getElementById('security-score').textContent = score;
    const te = document.getElementById('security-tips');
    if (te) te.innerHTML = tips.map(t => `<div class="security-tip ${t.cls}"><span class="material-icons-round">${t.icon}</span><span>${t.text}</span></div>`).join('');
}

async function renderDashboardActivity() {
    const logs = await getAuditLogs(5);
    const c = document.getElementById('dashboard-activity-list'); if (!c) return;
    if (!logs.length) { c.innerHTML = '<div class="empty-state small"><span class="material-icons-round">event_note</span><p>No recent activity</p></div>'; return; }
    const im = { field_updated: { icon: 'edit', cls: 'update' }, data_shared: { icon: 'share', cls: 'share' }, consent_changed: { icon: 'tune', cls: 'consent' }, autofill_used: { icon: 'bolt', cls: 'autofill' }, login: { icon: 'login', cls: 'login' }, export: { icon: 'download', cls: 'export' } };
    c.innerHTML = logs.map(l => {
        const { icon, cls } = im[l.action] || { icon: 'info', cls: 'update' };
        return `<div class="activity-item"><div class="activity-icon ${cls}"><span class="material-icons-round">${icon}</span></div><div class="activity-info"><p>${l.detail}</p><small>${formatTime(l.timestamp)}</small></div></div>`;
    }).join('');
}

// ==================== AUTO-FILL DEMO ====================
window.initAutoFillDemo = function () { selectFormType(APP_STATE.demoFormType, document.querySelector('.form-type-btn.active')); };
window.setDemoMode = function (mode) {
    APP_STATE.demoMode = mode;
    document.getElementById('mode-manual').classList.toggle('active', mode === 'manual');
    document.getElementById('mode-auto').classList.toggle('active', mode === 'auto');
    document.getElementById('demo-autofill-btn').style.display = mode === 'auto' ? 'inline-flex' : 'none';
    document.getElementById('mode-info').innerHTML = mode === 'manual'
        ? '<span class="material-icons-round">info</span><p>Manually type in every field — the traditional, slow way.</p>'
        : '<span class="material-icons-round">bolt</span><p>Click <strong>Auto-Fill Now</strong> to instantly populate all fields from your vault.</p>';
    renderDemoForm();
};
window.selectFormType = function (type, btn) { APP_STATE.demoFormType = type; document.querySelectorAll('.form-type-btn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); resetDemoForm(); renderDemoForm(); };

function renderDemoForm() {
    const t = FORM_TEMPLATES[APP_STATE.demoFormType]; if (!t) return;
    document.getElementById('demo-form-title').innerHTML = `<span class="material-icons-round">${t.icon}</span> ${t.title}`;
    const c = document.getElementById('demo-form-container');
    document.getElementById('demo-fields-total').textContent = t.fields.length;
    document.getElementById('demo-fields-filled').textContent = '0';
    c.innerHTML = t.fields.map(key => {
        const f = ALL_FIELDS.find(x => x.key === key); if (!f) return '';
        const fw = ['addressLine1', 'addressLine2'].includes(key) ? ' full-width' : '';
        let inp = '';
        const selects = {
            gender: ['', 'Male', 'Female', 'Other'], maritalStatus: ['', 'Single', 'Married', 'Divorced', 'Widowed'],
            annualIncome: ['', 'Below 2.5L', '2.5L - 5L', '5L - 10L', '10L - 25L', 'Above 25L'],
            occupation: ['', 'Salaried', 'Self-Employed', 'Business', 'Student', 'Retired', 'Homemaker']
        };
        if (selects[key]) { inp = `<select id="demo-${key}" class="demo-input" onchange="onDemoFieldChange()" disabled>${selects[key].map(v => `<option value="${v}">${v || 'Select'}</option>`).join('')}</select>`; }
        else { const it = f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'; inp = `<input type="${it}" id="demo-${key}" class="demo-input" placeholder="Enter ${f.label.toLowerCase()}" oninput="onDemoFieldChange()" disabled>`; }
        return `<div class="form-group demo-field${fw}" id="demo-field-${key}"><label>${f.label}</label><div class="input-wrapper" id="demo-wrapper-${key}"><span class="material-icons-round">${f.icon}</span>${inp}</div></div>`;
    }).join('');
    if (APP_STATE.demoMode === 'manual') c.querySelectorAll('.demo-input').forEach(i => { i.disabled = false; });
}

window.onDemoFieldChange = function () { if (!APP_STATE.demoStarted) { APP_STATE.demoStarted = true; startDemoTimer(); } updateDemoFieldCount(); };
function startDemoTimer() { APP_STATE.demoSeconds = 0; clearInterval(APP_STATE.demoTimer); APP_STATE.demoTimer = setInterval(() => { APP_STATE.demoSeconds++; document.getElementById('demo-timer').textContent = fmtTimer(APP_STATE.demoSeconds); }, 1000); }
function updateDemoFieldCount() { const t = FORM_TEMPLATES[APP_STATE.demoFormType]; let f = 0; t.fields.forEach(k => { const e = document.getElementById('demo-' + k); if (e && e.value) f++; }); document.getElementById('demo-fields-filled').textContent = f; }
function fmtTimer(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

window.resetDemoForm = function () { clearInterval(APP_STATE.demoTimer); APP_STATE.demoStarted = false; APP_STATE.demoSeconds = 0; document.getElementById('demo-timer').textContent = '00:00'; document.getElementById('demo-errors').textContent = '0'; document.getElementById('demo-fields-filled').textContent = '0'; document.getElementById('comparison-card')?.classList.add('hidden'); };

window.triggerAutoFill = async function () {
    const vd = getVaultCache(); const consents = await fbGetDoc(`users/${uid()}/data/consents`) || {};
    const t = FORM_TEMPLATES[APP_STATE.demoFormType];
    if (!t.fields.some(k => vd[k])) { showToast('No vault data. Load sample data first.', 'warning'); return; }
    APP_STATE.demoStarted = true; startDemoTimer();
    document.querySelectorAll('.demo-input').forEach(i => { i.disabled = false; });
    for (const key of t.fields) {
        const val = vd[key], ok = consents[key] !== false, inp = document.getElementById('demo-' + key), wr = document.getElementById('demo-wrapper-' + key), fl = document.getElementById('demo-field-' + key);
        if (inp && val && ok) {
            if (fl) fl.classList.add('autofilling');
            if (wr) wr.classList.add('autofilled');
            await sleep(120);
            if (inp.tagName === 'SELECT') inp.value = val; else await typeText(inp, val);
            setTimeout(() => { if (fl) fl.classList.remove('autofilling'); }, 600);
        } else if (inp && !ok && wr) { wr.style.borderColor = 'var(--warning)'; }
        updateDemoFieldCount();
    }
    clearInterval(APP_STATE.demoTimer);
    const stats = await fbGetDoc(`users/${uid()}/data/stats`) || { shared: 0, autofills: 0 };
    stats.autofills = (stats.autofills || 0) + 1;
    await fbSetDoc(`users/${uid()}/data/stats`, stats);
    addAuditLog('autofill_used', `Auto-filled ${t.title}`);
    showToast('Form auto-filled from vault!', 'success');
};

async function typeText(inp, text) { inp.value = ''; for (const ch of text) { inp.value += ch; await sleep(25 + Math.random() * 15); } }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

window.validateAndSubmitDemo = async function () {
    const t = FORM_TEMPLATES[APP_STATE.demoFormType]; let errors = 0;
    t.fields.forEach(key => {
        const inp = document.getElementById('demo-' + key), wr = document.getElementById('demo-wrapper-' + key); if (!inp) return;
        const val = inp.value.trim(), rule = VALIDATION_RULES[key];
        if (wr) wr.classList.remove('error', 'success');
        if (rule?.required && !val) { if (wr) wr.classList.add('error'); errors++; }
        else if (val && rule?.pattern && !rule.pattern.test(val)) { if (wr) wr.classList.add('error'); errors++; }
        else if (val && wr) wr.classList.add('success');
    });
    document.getElementById('demo-errors').textContent = errors;
    clearInterval(APP_STATE.demoTimer);
    if (!errors) {
        showToast('Application submitted! All validations passed.', 'success');
        showComparison();
        const stats = await fbGetDoc(`users/${uid()}/data/stats`) || { shared: 0, autofills: 0 };
        stats.shared = (stats.shared || 0) + 1;
        await fbSetDoc(`users/${uid()}/data/stats`, stats);
        addAuditLog('data_shared', `Submitted ${t.title} (${APP_STATE.demoMode} mode)`);
    } else { showToast(`${errors} validation error(s). Please correct.`, 'error'); }
};

function showComparison() {
    const card = document.getElementById('comparison-card'); card.classList.remove('hidden');
    const ct = APP_STATE.demoSeconds, isAuto = APP_STATE.demoMode === 'auto';
    const mt = isAuto ? Math.max(ct * 12, 90) : ct, at = isAuto ? ct : Math.max(Math.round(ct / 12), 3);
    document.getElementById('comp-manual-time').textContent = fmtTimer(mt);
    document.getElementById('comp-auto-time').textContent = fmtTimer(at);
    document.getElementById('comp-manual-errors').textContent = isAuto ? '3-5 possible' : document.getElementById('demo-errors').textContent + ' errors';
    document.getElementById('comp-auto-errors').textContent = isAuto ? '0 errors' : '0 estimated';
    document.getElementById('comp-time-saved').textContent = Math.round(((mt - at) / mt) * 100) + '% faster';
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==================== CONSENT (FIRESTORE) ====================
async function getConsents() { return await fbGetDoc(`users/${uid()}/data/consents`) || {}; }

window.renderConsentGrid = async function () {
    const consents = await getConsents();
    document.getElementById('consent-grid').innerHTML = ALL_FIELDS.map(f => {
        const en = consents[f.key] !== false;
        return `<div class="consent-card ${en ? 'enabled' : ''}" id="consent-card-${f.key}" data-field="${f.key}"><div class="consent-card-icon"><span class="material-icons-round">${f.icon}</span></div><div class="consent-card-info"><h4>${f.label}</h4><p>${f.category} Data</p></div><label class="toggle-switch"><input type="checkbox" id="consent-${f.key}" ${en ? 'checked' : ''} onchange="toggleConsent('${f.key}',this.checked)"><span class="toggle-slider"></span></label></div>`;
    }).join('');
    renderSharingPreview(consents);
};

window.toggleConsent = async function (key, enabled) {
    await fbSetDoc(`users/${uid()}/data/consents`, { [key]: enabled }, true);
    const card = document.getElementById('consent-card-' + key);
    if (card) card.classList.toggle('enabled', enabled);
    const f = ALL_FIELDS.find(x => x.key === key);
    addAuditLog('consent_changed', `${enabled ? 'Enabled' : 'Disabled'} sharing for "${f?.label || key}"`);
    renderSharingPreview(await getConsents());
};

window.bulkConsent = async function (enable) {
    const c = {}; ALL_FIELDS.forEach(f => { c[f.key] = enable; });
    await fbSetDoc(`users/${uid()}/data/consents`, c);
    renderConsentGrid();
    addAuditLog('consent_changed', `${enable ? 'Enabled' : 'Disabled'} all data sharing`);
    showToast(`All fields ${enable ? 'enabled' : 'disabled'}`, 'info');
};

window.filterConsentFields = function (search) {
    const q = search.toLowerCase();
    document.querySelectorAll('.consent-card').forEach(c => {
        const f = ALL_FIELDS.find(x => x.key === c.dataset.field);
        c.style.display = !q || (f && (f.label.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))) ? 'flex' : 'none';
    });
};

window.selectPurpose = function (purpose, btn) { APP_STATE.currentPurpose = purpose; document.querySelectorAll('.purpose-btn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); };

function renderSharingPreview(consents) {
    const prev = document.getElementById('sharing-preview');
    const enabled = ALL_FIELDS.filter(f => consents[f.key] !== false);
    prev.innerHTML = enabled.length
        ? `<p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:12px;"><strong>${enabled.length}</strong> of ${ALL_FIELDS.length} fields shared for <strong>${APP_STATE.currentPurpose}</strong>:</p>${enabled.map(f => `<span class="sharing-field"><span class="material-icons-round">check</span>${f.label}</span>`).join('')}`
        : '<p style="color:var(--text-tertiary);font-size:0.85rem;">No fields enabled</p>';
}

window.confirmConsent = async function () {
    const c = await getConsents();
    const n = Object.values(c).filter(v => v !== false).length;
    addAuditLog('consent_changed', `Confirmed consent (${n} fields for ${APP_STATE.currentPurpose})`);
    showToast(`Consent saved! ${n} fields enabled.`, 'success');
};

// ==================== AUDIT TRAIL (FIRESTORE) ====================
async function addAuditLog(action, detail) {
    if (!uid()) return;
    await fbAddDoc(`users/${uid()}/audit`, { action, detail, timestamp: new Date().toISOString(), user: APP_STATE.currentUser.email });
}

async function getAuditLogs(lim = 50) {
    if (!uid()) return [];
    return await fbQueryDocs(`users/${uid()}/audit`, 'timestamp', 'desc', lim);
}

window.renderAuditTrail = async function () {
    let logs = await getAuditLogs(100);
    const af = document.getElementById('audit-action-filter')?.value;
    const df = document.getElementById('audit-date-from')?.value;
    const dt = document.getElementById('audit-date-to')?.value;
    if (af && af !== 'all') logs = logs.filter(l => l.action === af);
    if (df) logs = logs.filter(l => l.timestamp >= df);
    if (dt) { const d = new Date(dt); d.setDate(d.getDate() + 1); logs = logs.filter(l => l.timestamp < d.toISOString()); }
    const c = document.getElementById('audit-timeline');
    if (!logs.length) { c.innerHTML = '<div class="empty-state"><span class="material-icons-round">receipt_long</span><p>No audit logs found</p></div>'; return; }
    const im = { field_updated: { icon: 'edit', color: 'var(--info)' }, data_shared: { icon: 'share', color: 'var(--success)' }, consent_changed: { icon: 'tune', color: 'var(--warning)' }, autofill_used: { icon: 'bolt', color: 'var(--accent-primary-light)' }, login: { icon: 'login', color: 'var(--accent-secondary)' }, export: { icon: 'download', color: 'var(--warning)' } };
    const names = { field_updated: 'Field Updated', data_shared: 'Data Shared', consent_changed: 'Consent Changed', autofill_used: 'Auto-Fill Used', login: 'Sign In', export: 'Data Export' };
    c.innerHTML = logs.map(l => {
        const { icon, color } = im[l.action] || { icon: 'info', color: 'var(--text-secondary)' };
        return `<div class="audit-item"><div class="audit-item-header"><span class="audit-item-action" style="color:${color}"><span class="material-icons-round">${icon}</span>${names[l.action] || l.action}</span><span class="audit-item-time">${formatTime(l.timestamp)}</span></div><div class="audit-item-detail">${l.detail}</div></div>`;
    }).join('');
};

window.filterAuditLogs = function () { renderAuditTrail(); };
window.exportAuditLogs = async function () {
    const logs = await getAuditLogs(200);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })); a.download = 'kyc-audit-logs.json'; a.click();
    showToast('Audit logs exported', 'success');
};

function formatTime(iso) {
    const d = new Date(iso), diff = Date.now() - d;
    if (diff < 60000) return 'Just now'; if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'; if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ==================== FORM SCANNER (OCR) ====================
let _scannerData = { detectedFields: [], imageDataUrl: null, ocrLines: [] };

const SCANNER_FIELD_PATTERNS = {
    firstName: { label: 'First Name', icon: 'person', patterns: [/first\s*name\s*[:=]?\s*(.+)/i, /given\s*name\s*[:=]?\s*(.+)/i] },
    lastName: { label: 'Last Name', icon: 'person', patterns: [/last\s*name\s*[:=]?\s*(.+)/i, /surname\s*[:=]?\s*(.+)/i, /family\s*name\s*[:=]?\s*(.+)/i] },
    email: { label: 'Email', icon: 'mail', patterns: [/e[\-.]?mail\s*(?:id|address)?\s*[:=]?\s*([^\s,]+@[^\s,]+)/i, /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/] },
    phone: { label: 'Phone', icon: 'phone', patterns: [/(?:phone|mobile|cell|contact)\s*(?:no|number|#)?\s*[:=]?\s*([\d\s\-+()]{10,})/i, /(\+?\d{1,3}[\s-]?\d{10})/] },
    dob: { label: 'Date of Birth', icon: 'cake', patterns: [/(?:date\s*of\s*birth|d\.?o\.?b\.?|birth\s*date)\s*[:=]?\s*(.+)/i] },
    gender: { label: 'Gender', icon: 'wc', patterns: [/gender\s*[:=]?\s*(male|female|other|m|f)/i, /sex\s*[:=]?\s*(male|female|other|m|f)/i] },
    aadhaar: { label: 'Aadhaar No.', icon: 'credit_card', patterns: [/(?:aadhaar|aadhar|uid)\s*(?:no|number|#)?\s*[:=]?\s*([\d\s]{12,14})/i] },
    pan: { label: 'PAN', icon: 'credit_card', patterns: [/(?:pan|permanent\s*account)\s*(?:no|number|#|card)?\s*[:=]?\s*([A-Z]{5}\d{4}[A-Z])/i, /\b([A-Z]{5}\d{4}[A-Z])\b/] },
    passport: { label: 'Passport', icon: 'flight', patterns: [/passport\s*(?:no|number|#)?\s*[:=]?\s*([A-Z]\d{7})/i] },
    voterId: { label: 'Voter ID', icon: 'how_to_vote', patterns: [/voter\s*(?:id|card)\s*(?:no|number|#)?\s*[:=]?\s*([A-Z]{3}\d{7})/i] },
    addressLine1: { label: 'Address', icon: 'location_on', patterns: [/(?:address|residence|house)\s*[:=]?\s*(.{10,})/i] },
    city: { label: 'City', icon: 'location_city', patterns: [/city\s*[:=]?\s*(\S.+)/i, /town\s*[:=]?\s*(\S.+)/i] },
    state: { label: 'State', icon: 'map', patterns: [/state\s*[:=]?\s*(\S.+)/i, /province\s*[:=]?\s*(\S.+)/i] },
    pincode: { label: 'PIN Code', icon: 'pin', patterns: [/(?:pin|zip|postal)\s*(?:code)?\s*[:=]?\s*(\d{5,6})/i] },
    nationality: { label: 'Nationality', icon: 'flag', patterns: [/nationality\s*[:=]?\s*(\S.+)/i, /citizenship\s*[:=]?\s*(\S.+)/i] },
    occupation: { label: 'Occupation', icon: 'work', patterns: [/occupation\s*[:=]?\s*(\S.+)/i, /profession\s*[:=]?\s*(\S.+)/i] },
    employer: { label: 'Employer', icon: 'business', patterns: [/employer\s*(?:name)?\s*[:=]?\s*(\S.+)/i, /company\s*[:=]?\s*(\S.+)/i] },
    bankName: { label: 'Bank Name', icon: 'account_balance', patterns: [/bank\s*(?:name)?\s*[:=]?\s*(\S.+)/i] },
    accountNumber: { label: 'Account No.', icon: 'credit_card', patterns: [/(?:account|a\/c)\s*(?:no|number|#)?\s*[:=]?\s*(\d{9,18})/i] },
    ifsc: { label: 'IFSC', icon: 'code', patterns: [/ifsc\s*(?:code)?\s*[:=]?\s*([A-Z]{4}0[A-Z0-9]{6})/i] },
    username: { label: 'Username', icon: 'account_circle', patterns: [/user\s*name\s*[:=]?\s*(\S+)/i] },
};

// Label-only patterns — match lines that are just a label (value comes next to it)
const LABEL_ONLY_PATTERNS = {
    firstName: [/^first\s*name/i, /^given\s*name/i, /^applicant.?s?\s*name/i, /^name$/i, /^name\s*:/i],
    lastName: [/^last\s*name/i, /^surname/i, /^family\s*name/i],
    email: [/^e[\-.]?mail/i, /^email\s*address/i, /^email\s*id/i],
    phone: [/^phone/i, /^mobile/i, /^contact\s*no/i, /^cell/i, /^telephone/i],
    dob: [/^date\s*of\s*birth/i, /^d\.?o\.?b/i, /^birth\s*date/i],
    gender: [/^gender/i, /^sex$/i],
    aadhaar: [/^aadhaar/i, /^aadhar/i, /^uid\s*no/i],
    pan: [/^pan\b/i, /^permanent\s*account/i],
    passport: [/^passport/i],
    voterId: [/^voter\s*id/i],
    addressLine1: [/^address/i, /^residential\s*address/i, /^permanent\s*address/i],
    city: [/^city/i, /^town/i, /^district/i],
    state: [/^state/i, /^province/i],
    pincode: [/^pin\s*code/i, /^zip/i, /^postal/i],
    nationality: [/^nationality/i, /^citizenship/i],
    occupation: [/^occupation/i, /^profession/i],
    employer: [/^employer/i, /^company\s*name/i, /^organization/i],
    bankName: [/^bank\s*name/i, /^bank$/i],
    accountNumber: [/^account\s*(?:no|number)/i, /^a\/c\s*no/i],
    ifsc: [/^ifsc/i],
    username: [/^user\s*name/i, /^login\s*id/i],
};

function initFormScanner() {
    const dz = document.getElementById('scanner-drop-zone');
    if (!dz) return;
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('dragover'); if (e.dataTransfer.files[0]) processFormFile(e.dataTransfer.files[0]); });
}

window.handleFormUpload = function (e) { if (e.target.files[0]) processFormFile(e.target.files[0]); };

async function processFormFile(file) {
    if (file.size > 10 * 1024 * 1024) { showToast('File too large. Max 10MB.', 'error'); return; }
    showScannerStep('processing');
    updateScannerProgress(0, 'Preparing image...', 'Reading file');

    const dataUrl = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
    _scannerData.imageDataUrl = dataUrl;

    updateScannerProgress(10, 'Initializing OCR...', 'Loading Tesseract.js engine');

    try {
        const result = await Tesseract.recognize(dataUrl, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    const pct = Math.round(10 + m.progress * 70);
                    updateScannerProgress(pct, 'Scanning text...', `OCR progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        updateScannerProgress(85, 'Detecting fields...', 'Matching patterns to KYC data');

        // Store line-level data with bounding boxes
        _scannerData.ocrLines = result.data.lines.map(line => ({
            text: line.text.trim(),
            bbox: line.bbox, // { x0, y0, x1, y1 }
            words: line.words.map(w => ({ text: w.text, bbox: w.bbox })),
        }));

        const ocrText = result.data.text;
        const textLines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 1);

        const detected = detectFieldsFromText(textLines, ocrText, _scannerData.ocrLines);
        _scannerData.detectedFields = detected;

        updateScannerProgress(95, 'Generating filled form...', 'Overlaying vault data');
        await sleep(400);
        updateScannerProgress(100, 'Complete!', `Found ${detected.length} fields`);
        await sleep(400);

        renderScannerResults();
        await generateFilledCanvas();
        showScannerStep('results');
        // Auto-switch to filled view
        switchScannerView('filled');
        addAuditLog('field_updated', `Scanned form: detected ${detected.length} fields`);
        showToast(`Scan complete! ${detected.length} fields detected.`, 'success');
    } catch (e) {
        console.error('OCR error:', e);
        showToast('OCR failed: ' + e.message, 'error');
        showScannerStep('upload');
    }
}

function detectFieldsFromText(lines, fullText, ocrLines) {
    const detected = [];
    const vaultData = getVaultCache();
    const usedKeys = new Set();

    // Strategy 1: Match label lines and pull value from vault
    for (const [key, labelPatterns] of Object.entries(LABEL_ONLY_PATTERNS)) {
        if (usedKeys.has(key)) continue;
        for (let i = 0; i < ocrLines.length; i++) {
            const lineText = ocrLines[i].text;
            for (const lp of labelPatterns) {
                if (lp.test(lineText)) {
                    const vaultValue = vaultData[key] || '';
                    const config = SCANNER_FIELD_PATTERNS[key];
                    // Try to extract a value from the same line (after the label)
                    let ocrValue = '';
                    const colonMatch = lineText.match(/[:=]\s*(.+)/);
                    if (colonMatch && colonMatch[1].trim().length > 0) {
                        ocrValue = colonMatch[1].trim();
                    }
                    detected.push({
                        key, label: config.label, icon: config.icon,
                        ocrValue: ocrValue,
                        vaultValue: vaultValue,
                        finalValue: vaultValue || ocrValue || '',
                        source: vaultValue ? 'vault' : (ocrValue ? 'ocr' : 'empty'),
                        matched: !!vaultValue,
                        lineIndex: i,
                        bbox: ocrLines[i].bbox,
                    });
                    usedKeys.add(key);
                    break;
                }
            }
            if (usedKeys.has(key)) break;
        }
    }

    // Strategy 2: Full-line regex matching for fields not yet found
    for (const [key, config] of Object.entries(SCANNER_FIELD_PATTERNS)) {
        if (usedKeys.has(key)) continue;
        for (const pattern of config.patterns) {
            let match = null, matchLineIdx = -1;
            for (let i = 0; i < ocrLines.length; i++) {
                match = ocrLines[i].text.match(pattern);
                if (match) { matchLineIdx = i; break; }
            }
            if (!match) { match = fullText.match(pattern); }
            if (match && match[1]) {
                const ocrValue = match[1].trim().replace(/\s+/g, ' ');
                if (ocrValue.length < 1) continue;
                const vaultValue = vaultData[key] || '';
                detected.push({
                    key, label: config.label, icon: config.icon,
                    ocrValue, vaultValue,
                    finalValue: vaultValue || ocrValue,
                    source: vaultValue ? 'vault' : 'ocr',
                    matched: !!vaultValue,
                    lineIndex: matchLineIdx >= 0 ? matchLineIdx : -1,
                    bbox: matchLineIdx >= 0 ? ocrLines[matchLineIdx].bbox : null,
                });
                usedKeys.add(key);
                break;
            }
        }
    }

    // Strategy 3: Standalone pattern fallback
    const standalonePatterns = [
        { key: 'email', pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g },
        { key: 'pan', pattern: /\b([A-Z]{5}\d{4}[A-Z])\b/g },
        { key: 'aadhaar', pattern: /\b(\d{4}\s?\d{4}\s?\d{4})\b/g },
        { key: 'pincode', pattern: /\b(\d{6})\b/g },
    ];
    for (const { key, pattern } of standalonePatterns) {
        if (usedKeys.has(key)) continue;
        const matches = [...fullText.matchAll(pattern)];
        if (matches.length > 0) {
            const ocrValue = matches[0][1].trim();
            const config = SCANNER_FIELD_PATTERNS[key];
            const vaultValue = vaultData[key] || '';
            detected.push({
                key, label: config.label, icon: config.icon,
                ocrValue, vaultValue,
                finalValue: vaultValue || ocrValue,
                source: vaultValue ? 'vault' : 'ocr',
                matched: !!vaultValue,
                lineIndex: -1, bbox: null,
            });
            usedKeys.add(key);
        }
    }

    return detected;
}

function renderScannerResults() {
    const fields = _scannerData.detectedFields;
    const matchCount = fields.filter(f => f.matched).length;

    document.getElementById('scanner-preview-img').src = _scannerData.imageDataUrl;
    document.getElementById('scanner-match-count').textContent = matchCount;

    const list = document.getElementById('scanner-fields-list');
    list.innerHTML = fields.map((f, i) => {
        const statusCls = f.matched ? 'matched' : (f.source === 'ocr' ? 'unmatched' : 'unmatched');
        const statusIcon = f.matched ? 'check_circle' : (f.source === 'ocr' ? 'info' : 'radio_button_unchecked');
        const sourceLabel = f.matched ? '🔐 Vault' : (f.source === 'ocr' ? '📷 OCR' : '⬜ Empty');
        const sourceCls = f.matched ? 'vault' : 'ocr';
        return `
        <div class="scanner-field-item ${statusCls}">
            <div class="scanner-field-icon ${statusCls}">
                <span class="material-icons-round">${statusIcon}</span>
            </div>
            <div class="scanner-field-info">
                <div class="scanner-field-label">${f.label}</div>
                <div class="scanner-field-value">${f.finalValue || '<em style="color:var(--text-muted)">No data</em>'}</div>
            </div>
            <span class="scanner-field-source ${sourceCls}">${sourceLabel}</span>
        </div>`;
    }).join('');

    const form = document.getElementById('scanner-digital-form');
    form.innerHTML = fields.map((f, i) => `
        <div class="scanner-digital-field">
            <label>${f.label} ${f.matched ? '<span style="color:#10b981;font-size:0.7rem;">● from vault</span>' : (f.source === 'ocr' ? '<span style="color:#06b6d4;font-size:0.7rem;">● from scan</span>' : '<span style="color:var(--text-muted);font-size:0.7rem;">● empty</span>')}</label>
            <input type="text" value="${f.finalValue}" id="scanner-edit-${i}" data-key="${f.key}" onchange="regenerateFilledCanvas()">
        </div>
    `).join('');
}

async function generateFilledCanvas() {
    const canvas = document.getElementById('scanner-filled-canvas');
    const ctx = canvas.getContext('2d');

    // Load original image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = _scannerData.imageDataUrl; });

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original
    ctx.drawImage(img, 0, 0);

    const fields = _scannerData.detectedFields;
    const ocrLines = _scannerData.ocrLines;

    // Draw vault data next to detected labels
    fields.forEach((field, i) => {
        const input = document.getElementById('scanner-edit-' + i);
        const value = input ? input.value : field.finalValue;
        if (!value) return; // Leave blank if no data

        if (field.bbox) {
            const bbox = field.bbox;
            const lineH = bbox.y1 - bbox.y0;
            const fontSize = Math.max(Math.round(lineH * 0.7), 14);

            // Clear the value area (right portion of the line, or below the colon)
            const valueX = bbox.x0 + Math.round((bbox.x1 - bbox.x0) * 0.45);
            const valueY = bbox.y0;
            const valueW = bbox.x1 - valueX + 80;
            const valueH = lineH;

            // White rectangle to cover old text/blank area
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.fillRect(valueX, valueY, valueW, valueH);

            // Draw new value
            ctx.font = `${fontSize}px Arial, sans-serif`;
            ctx.fillStyle = field.matched ? '#1a5fb4' : '#333333';
            ctx.textBaseline = 'middle';
            ctx.fillText(value, valueX + 6, valueY + lineH / 2);

            // Subtle underline
            ctx.strokeStyle = field.matched ? 'rgba(26, 95, 180, 0.3)' : 'rgba(100, 100, 100, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(valueX + 4, valueY + lineH - 2);
            ctx.lineTo(valueX + valueW - 4, valueY + lineH - 2);
            ctx.stroke();
        }
    });

    // Add a small watermark
    const wH = 28;
    ctx.fillStyle = 'rgba(124, 58, 237, 0.85)';
    ctx.fillRect(0, img.height - wH, img.width, wH);
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓ Auto-filled by Smart KYC Vault', 10, img.height - wH / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(new Date().toLocaleString('en-IN'), img.width - 10, img.height - wH / 2);
    ctx.textAlign = 'left';
}

window.regenerateFilledCanvas = async function () { await generateFilledCanvas(); };

window.switchScannerView = function (view) {
    document.getElementById('scanner-view-original').classList.toggle('hidden', view !== 'original');
    document.getElementById('scanner-view-filled').classList.toggle('hidden', view !== 'filled');
    document.getElementById('tab-original').classList.toggle('active', view === 'original');
    document.getElementById('tab-filled').classList.toggle('active', view === 'filled');
};

window.downloadFilledImage = function () {
    const canvas = document.getElementById('scanner-filled-canvas');
    if (!canvas || !canvas.width) { showToast('No filled form to download.', 'warning'); return; }
    const link = document.createElement('a');
    link.download = 'KYC-Filled-Form.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    addAuditLog('export', 'Downloaded filled form image');
    showToast('Filled form image downloaded!', 'success');
};

function showScannerStep(step) {
    document.querySelectorAll('.scanner-step').forEach(s => s.classList.add('hidden'));
    document.getElementById('scanner-step-' + step)?.classList.remove('hidden');
}

function updateScannerProgress(pct, status, substatus) {
    const circle = document.getElementById('scanner-progress-circle');
    const totalLen = 339.3;
    if (circle) circle.style.strokeDashoffset = totalLen - (totalLen * pct / 100);
    document.getElementById('scanner-progress-text').textContent = pct + '%';
    document.getElementById('scanner-status-text').textContent = status;
    document.getElementById('scanner-substatus').textContent = substatus;
}

window.resetScanner = function () {
    _scannerData = { detectedFields: [], imageDataUrl: null, ocrLines: [] };
    showScannerStep('upload');
    document.getElementById('scanner-file-input').value = '';
};

window.applyScannedToVault = async function () {
    const fields = _scannerData.detectedFields;
    if (!fields.length) { showToast('No fields to save.', 'warning'); return; }
    // Read edited values from digital form
    const updates = {};
    fields.forEach((f, i) => {
        const input = document.getElementById('scanner-edit-' + i);
        const val = input ? input.value.trim() : f.finalValue;
        if (val) updates[f.key] = val;
    });
    _vaultCache = { ..._vaultCache, ...updates };
    await fbSetDoc(`users/${uid()}/data/vault`, updates, true);
    await loadVaultData();
    addAuditLog('field_updated', `Saved ${Object.keys(updates).length} scanned fields to vault`);
    showToast(`${Object.keys(updates).length} fields saved to vault!`, 'success');
};

window.generateFilledPDF = function () {
    const fields = _scannerData.detectedFields;
    if (!fields.length) { showToast('No fields to export.', 'warning'); return; }
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const pageW = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFillColor(30, 30, 50);
    pdf.rect(0, 0, pageW, 40, 'F');
    pdf.setTextColor(180, 130, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Smart KYC Vault', 20, 20);
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 170);
    pdf.text('Digitized Form — Generated ' + new Date().toLocaleString('en-IN'), 20, 30);

    // Fields
    pdf.setTextColor(60, 60, 80);
    let y = 55;
    fields.forEach((f, i) => {
        const input = document.getElementById('scanner-edit-' + i);
        const val = input ? input.value : f.finalValue;
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.setFontSize(9);
        pdf.setTextColor(130, 130, 150);
        pdf.text(f.label.toUpperCase(), 20, y);
        pdf.setFontSize(12);
        pdf.setTextColor(40, 40, 60);
        pdf.setFont('helvetica', 'normal');
        pdf.text(val || '—', 20, y + 6);
        pdf.setDrawColor(230, 230, 240);
        pdf.line(20, y + 9, pageW - 20, y + 9);
        pdf.setFont('helvetica', 'bold');
        y += 18;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(160, 160, 180);
    pdf.text('Generated by Smart KYC Vault • Secure Identity Management', 20, 285);

    pdf.save('KYC-Scanned-Form.pdf');
    addAuditLog('export', 'Exported scanned form as PDF');
    showToast('PDF downloaded!', 'success');
};

window.copyScannedAsText = function () {
    const fields = _scannerData.detectedFields;
    if (!fields.length) { showToast('No fields to copy.', 'warning'); return; }
    const text = fields.map((f, i) => {
        const input = document.getElementById('scanner-edit-' + i);
        const val = input ? input.value : f.finalValue;
        return `${f.label}: ${val}`;
    }).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => showToast('Copy failed', 'error'));
};

// ==================== NOTIFICATIONS & TOAST ====================
function loadNotifications() {
    APP_STATE.notifications = [
        { icon: 'security', text: 'Improve your vault security score', time: '2h ago' },
        { icon: 'verified_user', text: 'Complete identity documents for full verification', time: '5h ago' },
        { icon: 'tips_and_updates', text: 'Welcome to Smart KYC Vault!', time: '1d ago' },
    ];
    renderNotifications();
}
function renderNotifications() {
    const list = document.getElementById('notification-list'), badge = document.getElementById('notification-badge');
    badge.textContent = APP_STATE.notifications.length;
    badge.style.display = APP_STATE.notifications.length ? 'flex' : 'none';
    list.innerHTML = APP_STATE.notifications.length
        ? APP_STATE.notifications.map(n => `<div class="notification-item"><span class="material-icons-round">${n.icon}</span><div class="notification-item-content"><p>${n.text}</p><small>${n.time}</small></div></div>`).join('')
        : '<div class="empty-state small" style="padding:20px"><p>No notifications</p></div>';
}
window.toggleNotifications = function () { document.getElementById('notification-panel').classList.toggle('hidden'); };
window.clearNotifications = function () { APP_STATE.notifications = []; renderNotifications(); document.getElementById('notification-panel').classList.add('hidden'); };

function showToast(message, type = 'info', duration = 4000) {
    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    const toast = document.createElement('div'); toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="material-icons-round">${icons[type]}</span><div class="toast-content"><p>${message}</p></div>`;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, duration);
}

window.openModal = function (title, body, footer) { document.getElementById('modal-title').textContent = title; document.getElementById('modal-body').innerHTML = body; document.getElementById('modal-footer').innerHTML = footer || ''; document.getElementById('modal-overlay').classList.remove('hidden'); };
window.closeModal = function () { document.getElementById('modal-overlay').classList.add('hidden'); };

function createParticles() {
    const c = document.getElementById('auth-particles'); if (!c) return;
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        p.style.left = Math.random() * 100 + '%'; p.style.animationDuration = (4 + Math.random() * 8) + 's';
        p.style.animationDelay = Math.random() * 5 + 's'; const s = (2 + Math.random() * 4) + 'px';
        p.style.width = s; p.style.height = s; p.style.background = Math.random() > 0.5 ? 'var(--accent-primary)' : 'var(--accent-secondary)';
        c.appendChild(p);
    }
}

document.addEventListener('click', e => { const p = document.getElementById('notification-panel'), b = document.getElementById('notification-btn'); if (p && !p.contains(e.target) && !b.contains(e.target)) p.classList.add('hidden'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); document.getElementById('notification-panel')?.classList.add('hidden'); } });
