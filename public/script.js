// ─── GeeTest v4 CAPTCHA Configuration ───────────────────────────────────────
// captchaId is your GeeTest Site Key (safe to expose on frontend)
const GEETEST_CAPTCHA_ID = '54168e66e1ec88dded41d7d56c8a86be';
// riskType controls the challenge shown to risky users
// Options: 'slide' | 'icon' | 'winlinze'
const GEETEST_RISK_TYPE = 'slide';

let loginCaptchaObj = null;

// ─── Initialize GeeTest CAPTCHA ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initGeetest4(
        {
            captchaId: GEETEST_CAPTCHA_ID, // Site Key
            product: 'float',              // Widget style
            riskType: GEETEST_RISK_TYPE,   // Risk challenge type
            language: 'eng',
        },
        function (captchaObj) {
            loginCaptchaObj = captchaObj;
            captchaObj.appendTo('#login-captcha-box');
            captchaObj
                .onReady(function () {
                    console.log('Login CAPTCHA ready');
                })
                .onSuccess(function () {
                    console.log('Login CAPTCHA success');
                })
                .onError(function (err) {
                    console.error('Login CAPTCHA error:', err);
                });
        }
    );

    // ── Login Form Handler ──
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!loginCaptchaObj) {
                alert('CAPTCHA is still loading. Please wait.');
                return;
            }

            const captchaResult = loginCaptchaObj.getValidate();
            if (!captchaResult) {
                alert('Please complete the CAPTCHA verification');
                return;
            }

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            login(email, password, captchaResult);
        });
    }
});

// ─── Login API Call ─────────────────────────────────────────────────────────
function login(email, password, captchaResult) {
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            lot_number: captchaResult.lot_number,
            captcha_output: captchaResult.captcha_output,
            pass_token: captchaResult.pass_token,
            gen_time: captchaResult.gen_time,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Hide the form and show success message
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('success-message').style.display = 'block';
            } else {
                alert('Login failed: ' + (data.message || 'Unknown error'));
                if (loginCaptchaObj) loginCaptchaObj.reset();
            }
        })
        .catch((err) => {
            console.error(err);
            if (loginCaptchaObj) loginCaptchaObj.reset();
        });
}