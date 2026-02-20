/* ============================================
   KYC VAULT - Background Service Worker
   Handles token refresh and badge updates
   ============================================ */

const FIREBASE_API_KEY = 'AIzaSyD6a3U8BH8-IjKUBk3GrJqtZakd1L9rIkU';
const TOKEN_REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`;

// Refresh Firebase token (tokens expire in 1 hour)
async function refreshToken() {
    try {
        const session = await chrome.storage.local.get(['kycRefresh', 'kycUid']);
        if (!session.kycRefresh) return;

        const resp = await fetch(TOKEN_REFRESH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=refresh_token&refresh_token=${session.kycRefresh}`
        });

        if (!resp.ok) throw new Error('Token refresh failed');
        const data = await resp.json();

        await chrome.storage.local.set({
            kycToken: data.id_token,
            kycRefresh: data.refresh_token
        });

        console.log('KYC Vault: Token refreshed');
    } catch (e) {
        console.error('KYC Vault token refresh error:', e);
    }
}

// Update badge based on login status
async function updateBadge() {
    try {
        const session = await chrome.storage.local.get(['kycToken']);
        if (session.kycToken) {
            chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
            chrome.action.setBadgeText({ text: '✓' });
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    } catch (e) {
        console.error('Badge update error:', e);
    }
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.kycToken) updateBadge();
});

// Handle extension install
chrome.runtime.onInstalled.addListener(() => {
    console.log('KYC Vault extension installed');
    updateBadge();

    // Set up periodic token refresh (every 45 min)
    if (chrome.alarms) {
        chrome.alarms.create('refreshToken', { periodInMinutes: 45 });
    }
});

// Listen for alarms
if (chrome.alarms) {
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'refreshToken') refreshToken();
    });
}

// Init badge on startup
updateBadge();
