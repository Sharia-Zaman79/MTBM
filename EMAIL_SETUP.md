# Email Setup Guide for Password Reset

## Current Status
✅ Backend code is ready to send password reset emails
✅ Frontend pages for forgot/reset password exist
⚠️ SendGrid credentials need to be configured

## Step-by-Step Setup

### 1. Create a SendGrid Account (Free)

1. Go to [SendGrid](https://signup.sendgrid.com/)
2. Sign up for a free account (100 emails/day free forever)
3. Verify your email address

### 2. Get Your SendGrid API Key

1. Log in to [SendGrid](https://app.sendgrid.com/)
2. Go to **Settings** → **API Keys** 
   - Direct link: https://app.sendgrid.com/settings/api_keys
3. Click **Create API Key**
4. Name it (e.g., "MTBM Password Reset")
5. Select **Full Access** (or at minimum, **Mail Send** access)
6. Click **Create & View**
7. **IMPORTANT**: Copy the API key immediately (you won't see it again!)

### 3. Verify Your Sender Email

SendGrid requires you to verify the email address you'll send from:

**Option A: Single Sender Verification (Easiest for testing)**
1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
   - Direct link: https://app.sendgrid.com/settings/sender_auth/senders
2. Click **Create New Sender**
3. Fill in your details:
   - From Name: "MTBM System" (or your app name)
   - From Email: Your email (e.g., yourname@gmail.com)
   - Reply To: Same email
   - Fill in address fields (required by SendGrid)
4. Click **Create**
5. Check your email and click the verification link

**Option B: Domain Authentication (For production)**
- Requires you to own a domain and add DNS records
- Follow: https://app.sendgrid.com/settings/sender_auth/domain/create

### 4. Configure Your Server

Edit `server/.env` and add:

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=yourname@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `SG.xxxxxxxxx...` with your actual SendGrid API key (starts with "SG.")
- `yourname@gmail.com` with the email you verified in step 3

### 5. Restart Your Server

```bash
cd server
npm run dev
```

You should see:
```
MTBM server listening on http://localhost:5000
```

If you see "SENDGRID_API_KEY not set", check your `.env` file.

### 6. Test Password Reset

1. Start your frontend: `npm run dev`
2. Go to http://localhost:5173/login
3. Click "Forgot Password?"
4. Enter your email (must be registered in your app)
5. Click "Send Reset Link"
6. **Check your email inbox** for the password reset link
7. Click the link, enter new password, submit
8. Log in with new password

## Troubleshooting

### Email not arriving?

1. **Check spam folder** - first-time emails often go to spam
2. **Verify SendGrid status**:
   - Go to https://app.sendgrid.com/email_activity
   - Search for your email to see delivery status
3. **Check server logs** - look for SendGrid errors
4. **Verify FROM_EMAIL** matches your verified sender
5. **Check SendGrid API key** has mail send permissions

### "Failed to send reset email" error?

- Check server terminal for error details
- Verify API key is correct (starts with "SG.")
- Make sure FROM_EMAIL is verified in SendGrid
- Check SendGrid account isn't suspended

### Still using console logging instead of email?

- Make sure all 3 env vars are set: SENDGRID_API_KEY, FROM_EMAIL, FRONTEND_URL
- Restart the server after editing .env
- Server should NOT show "SENDGRID_API_KEY not set" warning

## Email Template

Users will receive this email:

**Subject:** Reset your MTBM password

**Body:**
```
Hi [Full Name],

Use this link to reset your password (expires in 1 hour):

http://localhost:5173/forgot-password?token=...

If you didn't request this, you can ignore this email.
```

## Security Notes

- Reset tokens expire after 1 hour
- Tokens are hashed in the database
- Email address is never revealed if account doesn't exist
- Old tokens are invalidated when password is reset
- Never commit your `.env` file with real credentials

## Production Checklist

Before deploying:
- [ ] Use domain authentication instead of single sender
- [ ] Update FRONTEND_URL to your production domain
- [ ] Use a professional FROM_EMAIL (noreply@yourdomain.com)
- [ ] Customize email template HTML
- [ ] Monitor SendGrid email activity dashboard
- [ ] Consider upgrading SendGrid plan if you have many users
- [ ] Add rate limiting to forgot-password endpoint

## Support

- SendGrid docs: https://docs.sendgrid.com/
- SendGrid support: https://support.sendgrid.com/
- Check server logs for detailed error messages
