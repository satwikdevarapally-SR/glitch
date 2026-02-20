/* ============================================
   KYC VAULT - Chrome Extension Popup Logic
   ============================================ */

// Firebase REST API config
const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyD6a3U8BH8-IjKUBk3GrJqtZakd1L9rIkU',
    projectId: 'kyc-vault',
    authDomain: 'kyc-vault.firebaseapp.com'
};
const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`;
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

// ============ AUTH ============
async function signIn(email, password) {
    const resp = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error?.message || 'Auth failed');
    }
    return resp.json();
}

// ============ FIRESTORE ============
async function getVaultData(idToken, uid) {
    const resp = await fetch(`${FIRESTORE_URL}/users/${uid}/data/vault`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
    });
    if (!resp.ok) return {};
    const doc = await resp.json();
    return parseFirestoreDoc(doc.fields || {});
}

async function getConsents(idToken, uid) {
    const resp = await fetch(`${FIRESTORE_URL}/users/${uid}/data/consents`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
    });
    if (!resp.ok) return {};
    const doc = await resp.json();
    return parseFirestoreDoc(doc.fields || {});
}

function parseFirestoreDoc(fields) {
    const result = {};
    for (const [key, val] of Object.entries(fields)) {
        if (val.stringValue !== undefined) result[key] = val.stringValue;
        else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
        else if (val.integerValue !== undefined) result[key] = val.integerValue;
        else if (val.doubleValue !== undefined) result[key] = val.doubleValue;
    }
    return result;
}

// ============ FIELD MAPPING ============
const FIELD_PATTERNS = {
    firstName: [/first.?name/i, /given.?name/i, /fname/i, /name.*first/i],
    lastName: [/last.?name/i, /sur.?name/i, /family.?name/i, /lname/i, /name.*last/i],
    email: [/e.?mail/i, /email.?addr/i],
    phone: [/phone/i, /mobile/i, /tel/i, /contact.?number/i, /cell/i],
    dob: [/birth/i, /dob/i, /date.?of.?birth/i, /birthday/i],
    gender: [/gender/i, /sex/i],
    nationality: [/national/i, /citizen/i],
    aadhaar: [/aadhaar/i, /aadhar/i, /uid/i],
    pan: [/pan/i, /permanent.?account/i],
    passport: [/passport/i],
    voterId: [/voter/i, /epic/i],
    drivingLicense: [/driv/i, /licen/i, /dl.?no/i],
    addressLine1: [/address.?1/i, /street/i, /addr.*line.*1/i, /^address$/i],
    addressLine2: [/address.?2/i, /addr.*line.*2/i, /apartment/i, /suite/i, /landmark/i],
    city: [/city/i, /town/i, /district/i],
    state: [/state/i, /province/i, /region/i],
    pincode: [/pin/i, /zip/i, /postal/i, /post.?code/i],
    country: [/country/i, /nation$/i],
    bankName: [/bank.?name/i, /bank$/i],
    accountNumber: [/account.?n/i, /acct/i, /a\/c/i],
    ifsc: [/ifsc/i, /routing/i, /sort.?code/i],
    annualIncome: [/income/i, /salary/i, /earning/i],
    occupation: [/occupation/i, /profession/i, /employment.?type/i],
    employer: [/employer/i, /company/i, /organization/i, /firm/i],
    designation: [/designation/i, /job.?title/i, /position/i, /role/i],
    experience: [/experience/i, /years.*work/i],
    maritalStatus: [/marital/i, /married/i],
    username: [/user.?name/i, /login.?name/i, /screen.?name/i, /nick.?name/i, /handle/i, /userid/i]
};

function matchFieldToVault(input) {
    const attrs = [
        input.name || '',
        input.id || '',
        input.placeholder || '',
        input.getAttribute('aria-label') || '',
        input.getAttribute('autocomplete') || ''
    ].join(' ');
    const label = getFieldLabel(input);
    const text = attrs + ' ' + label;
    for (const [vaultKey, patterns] of Object.entries(FIELD_PATTERNS)) {
        for (const p of patterns) {
            if (p.test(text)) return vaultKey;
        }
    }
    return null;
}

function getFieldLabel(input) {
    if (input.labels && input.labels.length > 0) return input.labels[0].textContent;
    const parent = input.closest('.form-group, .form-field, .field, label, .input-group, .form-control');
    if (parent) {
        const label = parent.querySelector('label');
        if (label) return label.textContent;
    }
    const prev = input.previousElementSibling;
    if (prev && prev.tagName === 'LABEL') return prev.textContent;
    return '';
}

// ============ UI LOGIC ============
document.addEventListener('DOMContentLoaded', async () => {
    const session = await chrome.storage.local.get(['kycUser', 'kycToken', 'kycUid', 'kycVault', 'kycConsents']);

    if (session.kycToken && session.kycUid) {
        showMainView(session);
    } else {
        showLoginView();
    }

    // Login handler
    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

    // Main view handlers
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    document.getElementById('btn-autofill').addEventListener('click', handleAutoFill);
    document.getElementById('btn-scan').addEventListener('click', handleScan);
    document.getElementById('btn-open-vault').addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:8080' });
    });
    document.getElementById('btn-fill-selected').addEventListener('click', handleFillSelected);
});

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) { setStatus('Enter email and password', 'error'); return; }

    const btn = document.getElementById('btn-login');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Signing in...';

    try {
        const auth = await signIn(email, password);
        const vault = await getVaultData(auth.idToken, auth.localId);
        const consents = await getConsents(auth.idToken, auth.localId);

        await chrome.storage.local.set({
            kycUser: auth.displayName || email,
            kycEmail: email,
            kycToken: auth.idToken,
            kycRefresh: auth.refreshToken,
            kycUid: auth.localId,
            kycVault: vault,
            kycConsents: consents
        });

        showMainView({
            kycUser: auth.displayName || email,
            kycEmail: email,
            kycToken: auth.idToken,
            kycUid: auth.localId,
            kycVault: vault,
            kycConsents: consents
        });
    } catch (e) {
        const msg = e.message.includes('INVALID') ? 'Invalid email or password' :
            e.message.includes('USER_NOT_FOUND') ? 'No account found' : e.message;
        setStatus(msg, 'error');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-icons-round">login</span> Sign In';
    }
}

async function handleLogout() {
    await chrome.storage.local.remove(['kycUser', 'kycEmail', 'kycToken', 'kycRefresh', 'kycUid', 'kycVault', 'kycConsents']);
    showLoginView();
}

async function handleAutoFill() {
    setStatus('Auto-filling...', '');
    const session = await chrome.storage.local.get(['kycVault', 'kycConsents']);
    if (!session.kycVault || Object.keys(session.kycVault).length === 0) {
        setStatus('No vault data. Add data in KYC Vault first.', 'error');
        return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, {
        action: 'autofill',
        vault: session.kycVault,
        consents: session.kycConsents || {}
    }, (response) => {
        if (response?.filled > 0) {
            setStatus(`✅ Filled ${response.filled} fields!`, 'success');
        } else {
            setStatus('No matching fields found on this page', '');
        }
    });
}

async function handleScan() {
    setStatus('Scanning page...', '');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const session = await chrome.storage.local.get(['kycVault', 'kycConsents']);

    chrome.tabs.sendMessage(tab.id, { action: 'scan' }, (response) => {
        if (!response?.fields?.length) {
            setStatus('No fillable fields found', '');
            return;
        }
        renderScanResults(response.fields, session.kycVault || {}, session.kycConsents || {});
    });
}

function handleFillSelected() {
    const checkboxes = document.querySelectorAll('#field-list input[type="checkbox"]:checked');
    if (checkboxes.length === 0) { setStatus('No fields selected', 'error'); return; }

    const fieldsToFill = {};
    checkboxes.forEach(cb => { fieldsToFill[cb.dataset.index] = cb.dataset.value; });

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { action: 'fillSelected', fields: fieldsToFill }, (response) => {
            setStatus(`✅ Filled ${response?.filled || 0} fields!`, 'success');
        });
    });
}

function renderScanResults(fields, vault, consents) {
    const container = document.getElementById('scan-results');
    const list = document.getElementById('field-list');
    container.classList.remove('hidden');

    let matchCount = 0;
    list.innerHTML = fields.map((f, i) => {
        const vaultValue = vault[f.vaultKey];
        const hasConsent = consents[f.vaultKey] !== false;
        const hasMatch = vaultValue && hasConsent;
        if (hasMatch) matchCount++;

        return `<div class="field-item">
            <input type="checkbox" ${hasMatch ? 'checked' : 'disabled'} data-index="${i}" data-value="${vaultValue || ''}">
            <span class="field-name">${f.label || f.vaultKey || 'Unknown'}</span>
            ${hasMatch
                ? `<span class="field-value">${maskValue(vaultValue)}</span><span class="field-match">✓</span>`
                : `<span class="field-nomatch">No data</span>`}
        </div>`;
    }).join('');

    document.getElementById('field-count').textContent = `${matchCount}/${fields.length} matched`;
}

function maskValue(val) {
    if (!val) return '';
    if (val.length > 8) return val.substring(0, 4) + '••••' + val.substring(val.length - 2);
    return val.substring(0, 2) + '••••';
}

// ============ UI HELPERS ============
function showLoginView() {
    document.getElementById('view-login').classList.add('active');
    document.getElementById('view-main').classList.remove('active');
}

function showMainView(session) {
    document.getElementById('view-login').classList.remove('active');
    document.getElementById('view-main').classList.add('active');

    const name = session.kycUser || 'User';
    document.getElementById('popup-name').textContent = name;
    document.getElementById('popup-email').textContent = session.kycEmail || '';
    document.getElementById('popup-avatar').textContent = (name[0] || 'U').toUpperCase();

    const vault = session.kycVault || {};
    const count = Object.values(vault).filter(v => v).length;
    document.getElementById('popup-badge').textContent = `${count} fields`;

    setStatus('Ready — click Auto-Fill to fill forms', '');
}

function setStatus(text, type) {
    const bar = document.getElementById('status-bar');
    document.getElementById('status-text').textContent = text;
    bar.className = 'status-bar' + (type ? ` ${type}` : '');
}
