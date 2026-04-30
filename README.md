# Demo Webpage for Research

A demonstration website implementing **Friendly Captcha v2** for bot protection on login forms.

## Features

- ✅ Friendly Captcha v2 integration
- ✅ Express.js backend with server-side validation
- ✅ Clean, modern UI with responsive design
- ✅ Vercel-ready deployment configuration

## Prerequisites

- Node.js v20+ 
- npm v10+
- Friendly Captcha account ([Sign up here](https://friendlycaptcha.com))

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Friendly Captcha API Key (get from https://app.friendlycaptcha.eu/dashboard/accounts/-/keys)
FRIENDLY_CAPTCHA_API_KEY=your_api_key_here

# Friendly Captcha Sitekey (get from https://app.friendlycaptcha.eu/dashboard)
FRIENDLY_CAPTCHA_SITEKEY=your_sitekey_here
```

### 3. Update Frontend Sitekey

Edit `public/index.html` and replace the placeholder sitekey:

```html
<div class="frc-captcha" data-sitekey="YOUR_ACTUAL_SITEKEY"></div>
```

### 4. Run the Application

```bash
npm start
```

The app will run at `http://localhost:3001`

## Project Structure

```
.
├── api/
│   └── index.js           # Vercel serverless function entry
├── public/
│   ├── index.html         # Frontend HTML
│   ├── script.js          # Frontend JavaScript
│   └── styles.css         # Styling
├── server.js              # Express server + CAPTCHA validation
├── package.json           # Dependencies
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `FRIENDLY_CAPTCHA_API_KEY`
   - `FRIENDLY_CAPTCHA_SITEKEY`

## Documentation

- [Friendly Captcha Documentation](https://developer.friendlycaptcha.com/docs/v2/getting-started/install)
- [Friendly Captcha API Reference](https://developer.friendlycaptcha.com/docs/v2/api/)

## License

ISC
