/* ============================================
   KYC VAULT - Content Script
   Runs on every webpage to detect and fill forms
   ============================================ */

// Field pattern matching (same as popup.js)
const FIELD_PATTERNS = {
    firstName: [/first.?name/i, /given.?name/i, /fname/i, /name.*first/i],
    lastName: [/last.?name/i, /sur.?name/i, /family.?name/i, /lname/i, /name.*last/i],
    email: [/e.?mail/i, /email.?addr/i],
    phone: [/phone/i, /mobile/i, /tel/i, /contact.?number/i, /cell/i],
    dob: [/birth/i, /dob/i, /date.?of.?birth/i, /birthday/i],
    gender: [/gender/i, /sex/i],
    nationality: [/national/i, /citizen/i],
    aadhaar: [/aadhaar/i, /aadhar/i, /uid.?no/i],
    pan: [/pan.?no/i, /pan.?card/i, /permanent.?account/i],
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

// Get the text label for a form field
function getFieldLabel(input) {
    // 1. Check <label> via for attribute
    if (input.labels && input.labels.length > 0) return input.labels[0].textContent.trim();
    // 2. Check parent containers
    const parent = input.closest('.form-group, .form-field, .field, label, .input-group, .form-row, .col, [class*="form"], [class*="field"]');
    if (parent) {
        const lbl = parent.querySelector('label, .label, [class*="label"]');
        if (lbl) return lbl.textContent.trim();
    }
    // 3. Previous sibling
    const prev = input.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN')) return prev.textContent.trim();
    // 4. Aria label / title
    return input.getAttribute('aria-label') || input.title || '';
}

// Match an input element to a vault field
function matchFieldToVault(input) {
    const attrs = [
        input.name || '',
        input.id || '',
        input.placeholder || '',
        input.getAttribute('aria-label') || '',
        input.getAttribute('autocomplete') || ''
    ].join(' ');
    const label = getFieldLabel(input);
    const text = (attrs + ' ' + label).toLowerCase();

    for (const [vaultKey, patterns] of Object.entries(FIELD_PATTERNS)) {
        for (const p of patterns) {
            if (p.test(text)) return vaultKey;
        }
    }
    return null;
}

// Get all fillable inputs on the page
function scanFormFields() {
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="image"]), select, textarea');
    const fields = [];

    inputs.forEach((input, index) => {
        // Skip hidden or disabled fields
        if (input.offsetParent === null || input.disabled || input.readOnly) return;

        const vaultKey = matchFieldToVault(input);
        fields.push({
            index,
            vaultKey,
            label: getFieldLabel(input) || input.placeholder || input.name || `Field ${index + 1}`,
            tagName: input.tagName,
            type: input.type || 'text',
            selector: generateSelector(input)
        });
    });

    return fields;
}

// Generate a unique CSS selector for an element
function generateSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    if (el.name) return `[name="${CSS.escape(el.name)}"]`;
    // Fallback: build path
    const path = [];
    let current = el;
    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();
        if (current.id) { selector = `#${CSS.escape(current.id)}`; path.unshift(selector); break; }
        const parent = current.parentElement;
        if (parent) {
            const idx = Array.from(parent.children).filter(c => c.tagName === current.tagName).indexOf(current);
            selector += `:nth-of-type(${idx + 1})`;
        }
        path.unshift(selector);
        current = current.parentElement;
    }
    return path.join(' > ');
}

// Fill a single input with a value (with React/Vue compatibility)
function fillInput(input, value) {
    if (!input || !value) return false;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        input.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype,
        'value'
    )?.set;

    if (input.tagName === 'SELECT') {
        // Try to match option text or value
        const options = Array.from(input.options);
        const match = options.find(o =>
            o.value.toLowerCase() === value.toLowerCase() ||
            o.textContent.trim().toLowerCase() === value.toLowerCase()
        );
        if (match) {
            input.value = match.value;
        } else {
            return false;
        }
    } else {
        // For React compatibility, use native setter
        if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, value);
        } else {
            input.value = value;
        }
    }

    // Dispatch events to trigger framework reactivity
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));

    // Visual feedback
    input.classList.add('kyc-vault-filled', 'kyc-vault-filled-flash');
    setTimeout(() => input.classList.remove('kyc-vault-filled-flash'), 800);
    setTimeout(() => input.classList.remove('kyc-vault-filled'), 3000);

    return true;
}

// ============ MESSAGE LISTENER ============
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scan') {
        const fields = scanFormFields();
        sendResponse({ fields });
    }

    if (message.action === 'autofill') {
        const vault = message.vault || {};
        const consents = message.consents || {};
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), select, textarea');
        let filled = 0;

        inputs.forEach(input => {
            if (input.offsetParent === null || input.disabled || input.readOnly) return;
            const vaultKey = matchFieldToVault(input);
            if (!vaultKey) return;

            // Check consent
            if (consents[vaultKey] === false) return;

            const value = vault[vaultKey];
            if (value && fillInput(input, value)) filled++;
        });

        sendResponse({ filled });
    }

    if (message.action === 'fillSelected') {
        const fieldsToFill = message.fields || {};
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), select, textarea');
        const visible = Array.from(inputs).filter(i => i.offsetParent !== null && !i.disabled && !i.readOnly);
        let filled = 0;

        for (const [idx, value] of Object.entries(fieldsToFill)) {
            const input = visible[parseInt(idx)];
            if (input && fillInput(input, value)) filled++;
        }

        sendResponse({ filled });
    }

    if (message.action === 'ping') {
        sendResponse({ ok: true });
    }

    return true; // Keep the message channel open for async
});

// ============ FLOATING ACTION BUTTON ============
(async function initFAB() {
    // Only show if user is logged in
    const session = await chrome.storage.local.get(['kycToken', 'kycVault']);
    if (!session.kycToken) return;

    // Don't add on extension pages or the vault itself
    if (location.href.startsWith('chrome') || location.href.includes('localhost:8080')) return;

    // Check if there are form fields
    const fields = scanFormFields();
    const matchedFields = fields.filter(f => f.vaultKey);
    if (matchedFields.length === 0) return;

    // Create floating button
    const fab = document.createElement('button');
    fab.id = 'kyc-vault-fab';
    fab.innerHTML = `<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>`;
    fab.title = `KYC Vault: ${matchedFields.length} fields can be filled`;

    const tooltip = document.createElement('div');
    tooltip.id = 'kyc-vault-tooltip';
    tooltip.textContent = `⚡ ${matchedFields.length} fields can be auto-filled`;

    document.body.appendChild(fab);
    document.body.appendChild(tooltip);

    // Show tooltip briefly
    setTimeout(() => tooltip.classList.add('show'), 1000);
    setTimeout(() => tooltip.classList.remove('show'), 5000);

    // Click handler
    fab.addEventListener('click', async () => {
        tooltip.textContent = '⏳ Filling...';
        tooltip.classList.add('show');

        const session = await chrome.storage.local.get(['kycVault', 'kycConsents']);
        const vault = session.kycVault || {};
        const consents = session.kycConsents || {};
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), select, textarea');
        let filled = 0;

        inputs.forEach(input => {
            if (input.offsetParent === null || input.disabled || input.readOnly) return;
            const vaultKey = matchFieldToVault(input);
            if (!vaultKey || consents[vaultKey] === false) return;
            if (vault[vaultKey] && fillInput(input, vault[vaultKey])) filled++;
        });

        tooltip.textContent = filled > 0 ? `✅ Filled ${filled} fields!` : '❌ No matching data found';
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 3000);
    });

    // Hover tooltip
    fab.addEventListener('mouseenter', () => {
        tooltip.textContent = `⚡ ${matchedFields.length} fields can be auto-filled`;
        tooltip.classList.add('show');
    });
    fab.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
})();

console.log('🔒 KYC Vault extension loaded');
