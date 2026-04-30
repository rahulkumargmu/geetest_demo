// ─── Friendly Captcha v2 Configuration ──────────────────────────────────────
// Note: Friendly Captcha widget is automatically initialized by the SDK
// The widget is already embedded in the HTML with the 'frc-captcha' class

// ─── Login Form Handler ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get the CAPTCHA response from the form
            const captchaResponse = loginForm.querySelector('[name="frc-captcha-response"]')?.value;

            if (!captchaResponse) {
                alert('Please complete the CAPTCHA verification');
                return;
            }

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            login(email, password, captchaResponse);
        });
    }
});

// ─── Login API Call ─────────────────────────────────────────────────────────
function login(email, password, captchaResponse) {
    const submitButton = document.getElementById('submit-button');
    if (submitButton) submitButton.disabled = true;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            'frc-captcha-response': captchaResponse,
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
                // Reload page to reset CAPTCHA
                setTimeout(() => window.location.reload(), 1000);
            }
        })
        .catch((err) => {
            console.error('Login error:', err);
            alert('An error occurred. Please try again.');
            setTimeout(() => window.location.reload(), 1000);
        })
        .finally(() => {
            if (submitButton) submitButton.disabled = false;
        });
}