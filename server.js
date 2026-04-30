///////////////////////////////////////////////////////////////////////////////
// server.js — Express + Friendly Captcha v2 (Login only)
///////////////////////////////////////////////////////////////////////////////
require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ─── Friendly Captcha v2 Configuration ──────────────────────────────────────
const FRIENDLY_CAPTCHA_API_KEY = process.env.FRIENDLY_CAPTCHA_API_KEY;
const FRIENDLY_CAPTCHA_SITEKEY = process.env.FRIENDLY_CAPTCHA_SITEKEY;
const FRIENDLY_CAPTCHA_API_URL = 'https://global.frcapi.com/api/v2/captcha/siteverify';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * validateFriendlyCaptcha — secondary verification against Friendly Captcha API.
 * @param {string} response - The frc-captcha-response value from the form
 * @param {string} sitekey - Optional: the sitekey to verify against
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
async function validateFriendlyCaptcha(response, sitekey = null) {
    try {
        const payload = { response };
        if (sitekey) {
            payload.sitekey = sitekey;
        }

        const apiResponse = await axios.post(FRIENDLY_CAPTCHA_API_URL, payload, {
            headers: {
                'X-API-Key': FRIENDLY_CAPTCHA_API_KEY,
                'Content-Type': 'application/json',
            },
            timeout: 5000,
        });

        console.log('Friendly Captcha validation response:', apiResponse.data);
        return apiResponse.data;
    } catch (error) {
        console.error('Friendly Captcha validation error:', error.message);
        
        // Fail-open for disaster recovery (if API is down, allow the request)
        // In production, you might want to be more strict
        return { 
            success: true, 
            _failOpen: true,
            _error: error.message 
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Login Endpoint — verifies CAPTCHA and returns success
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const captchaResponse = req.body['frc-captcha-response'];

    console.log('----- /api/login -----');
    console.log('Email:', email);

    // Validate CAPTCHA response present
    if (!captchaResponse) {
        return res.status(400).json({ 
            success: false, 
            message: 'CAPTCHA verification data missing' 
        });
    }

    // Check API key is configured
    if (!FRIENDLY_CAPTCHA_API_KEY) {
        console.error('FRIENDLY_CAPTCHA_API_KEY environment variable is not set');
        return res.status(500).json({ 
            success: false, 
            message: 'Server configuration error' 
        });
    }

    // Verify with Friendly Captcha
    const verification = await validateFriendlyCaptcha(
        captchaResponse, 
        FRIENDLY_CAPTCHA_SITEKEY
    );
    
    console.log('Friendly Captcha valid? →', verification.success);
    
    if (verification._failOpen) {
        console.warn('⚠️ CAPTCHA verification failed open due to API error');
    }

    if (!verification.success) {
        const errorCode = verification.error?.error_code || 'unknown';
        console.log('CAPTCHA validation failed:', errorCode);
        return res.status(400).json({ 
            success: false, 
            message: 'CAPTCHA validation failed' 
        });
    }

    // CAPTCHA passed — return success
    console.log(`Login success for ${email}`);
    res.json({ success: true, message: 'Login successful' });
});

// ─── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;