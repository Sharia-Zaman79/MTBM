# Gmail Setup for Password Reset Emails (No Account Approval Needed!)

Since SendGrid account was rejected, we're using **Gmail + Nodemailer** instead. This is:
- ✅ Free
- ✅ No account approval needed
- ✅ Instant setup
- ✅ No third-party service management

## 3-Step Setup (2 minutes)

### Step 1: Enable 2-Step Verification

1. Go to https://myaccount.google.com/security
2. Scroll down to "2-Step Verification"
3. Click it and follow prompts (usually verify with your phone)
4. Once enabled, come back to this setup

### Step 2: Create an App Password

1. Go to https://myaccount.google.com/apppasswords
   - (If you don't see this option, make sure 2-Step Verification is ON)
2. Select **"Mail"** and **"Windows Computer"** (or your device type)
3. Click **"Generate"**
4. Google will show a 16-character password like: `xxxx xxxx xxxx xxxx`

### Step 3: Add to Your .env

Edit `server/.env`:

```env
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

**Replace:**
- `your_email@gmail.com` with your actual Gmail address
- `xxxxxxxxxxxxxxxx` with the 16-character app password (remove spaces)

Example:
```env
GMAIL_EMAIL=john.doe@gmail.com
GMAIL_APP_PASSWORD=abcdEFGH1234ijkl
```

### Step 4: Restart Server

```bash
cd server
npm run dev
```

You should see:
```
MTBM server listening on http://localhost:5000
```

(No more SendGrid warning!)

## Test Password Reset

1. Go to http://localhost:5173/login
2. Click "Forgot Password?"
3. Enter your email
4. **Check Gmail inbox** for reset email (check spam too!)
5. Click the button in the email
6. Set new password
7. Login with new password ✅

## Troubleshooting

### Email not arriving?

1. **Check Gmail Inbox & Spam** - first emails sometimes go to spam
2. **Check server logs** - look for any error messages
3. **Verify app password** - copy it exactly (16 characters, no spaces)
4. **Verify email address** - make sure GMAIL_EMAIL matches your actual Gmail

### "Failed to send email" error?

- Check `GMAIL_EMAIL` matches your Gmail
- Check `GMAIL_APP_PASSWORD` is correct (16 chars, no spaces)
- Make sure 2-Step Verification is enabled
- Restart server after editing .env

### "Gmail says 'Access Denied'" or "Login failed"?

- You probably didn't enable 2-Step Verification
- Or the app password is wrong
- Go back to Step 2 and create a NEW app password

## Security

- App passwords are Gmail-only, not your real password
- You can delete the app password anytime from https://myaccount.google.com/apppasswords
- If leaked, just delete it and create a new one
- Never commit `.env` file with real passwords

## For Production

If you want to use a business email or custom domain:
1. Use a dedicated "noreply" Gmail account
2. Or switch to Mailgun/Brevo (similar free setup)
3. Update GMAIL_EMAIL to your business email

## That's It!

Your password reset emails now work! 🎉

Questions? Check the server terminal for detailed errors.
