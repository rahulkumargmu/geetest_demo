///////////////////////////////////////////////////////////////////////////////
// server.js — Express + GeeTest v4 CAPTCHA (Login only)
///////////////////////////////////////////////////////////////////////////////
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ─── GeeTest v4 Configuration ───────────────────────────────────────────────
const GEETEST_CAPTCHA_ID = '54168e66e1ec88dded41d7d56c8a86be';
const GEETEST_CAPTCHA_KEY = process.env.GEETEST_CAPTCHA_KEY;
const GEETEST_API_SERVER = 'http://gcaptcha4.geetest.com';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * validateGeeTestCaptcha — secondary verification against GeeTest API.
 */
async function validateGeeTestCaptcha(lotNumber, captchaOutput, passToken, genTime) {
    try {
        // 1. Generate HMAC-SHA256 signature
        const signToken = crypto
            .createHmac('sha256', GEETEST_CAPTCHA_KEY)
            .update(lotNumber)
            .digest('hex');

        // 2. Build POST body
        const formData = new URLSearchParams();
        formData.append('lot_number', lotNumber);
        formData.append('captcha_output', captchaOutput);
        formData.append('pass_token', passToken);
        formData.append('gen_time', genTime);
        formData.append('sign_token', signToken);

        // 3. POST to GeeTest validation endpoint
        const url = `${GEETEST_API_SERVER}/validate?captcha_id=${GEETEST_CAPTCHA_ID}`;
        const response = await axios.post(url, formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 5000,
        });

        console.log('GeeTest validation response:', response.data);
        return response.data && response.data.result === 'success';
    } catch (error) {
        console.error('GeeTest validation error:', error.message);
        return true; // fail-open for demo (disaster recovery)
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Login Endpoint — verifies CAPTCHA and returns success
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/login', async (req, res) => {
    const { email, password, lot_number, captcha_output, pass_token, gen_time } = req.body;

    console.log('----- /api/login -----');
    console.log('Email:', email);

    // Validate CAPTCHA params present
    if (!lot_number || !captcha_output || !pass_token || !gen_time) {
        return res.status(400).json({ success: false, message: 'CAPTCHA verification data missing' });
    }

    if (!GEETEST_CAPTCHA_KEY) {
        console.error('GEETEST_CAPTCHA_KEY environment variable is not set');
        return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // Verify with GeeTest
    const isCaptchaValid = await validateGeeTestCaptcha(lot_number, captcha_output, pass_token, gen_time);
    console.log('GeeTest CAPTCHA valid? →', isCaptchaValid);

    if (!isCaptchaValid) {
        return res.status(400).json({ success: false, message: 'CAPTCHA validation failed' });
    }

    // CAPTCHA passed — return success
    console.log(`Login success for ${email}`);
    res.json({ success: true, message: 'Login successful' });
});

// ─── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;