# Email Verification with OTP - Setup Guide

## Overview
Your signup system now requires **email verification using OTP (One-Time Password)** before account creation. This ensures that users have access to their email address and prevents fake signups.

## How It Works

### Email Signup with OTP Flow:
1. User enters their email address on the signup page
2. User clicks "Send Verification Code"
3. System generates a 6-digit OTP and sends it via email (Gmail)
4. User receives email with the verification code
5. User enters the 6-digit OTP on the signup page
6. User clicks "Verify Code"
7. System validates the OTP
8. User completes remaining fields (password, full name, etc.)
9. User clicks "Create Account"
10. Account is created with verified email

## Email Configuration (Already Set Up)

Your system uses **Gmail SMTP** to send OTP emails. The configuration is already in your `.env` file:

```env
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password
```

### Gmail Setup (If you need to reconfigure):

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Find "2-Step Verification" and turn it ON

2. **Create an App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Google generates a 16-character password
   - Copy it (remove spaces): `xxxx xxxx xxxx xxxx` → `xxxxxxxxxxxxxxxx`

3. **Add to .env:**
   ```env
   GMAIL_EMAIL=your_email@gmail.com
   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
   ```

## Development Mode (Without Gmail)

If Gmail credentials are not configured, the system automatically falls back to **console logging**:
- OTP will be printed to the server terminal
- No email will be sent
- Useful for development and testing without email setup

Example console output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 [DEV MODE] OTP for user@example.com
🔐 CODE: 123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Testing

### Test Email Signup with OTP:
1. Go to signup page at http://localhost:5174/signup
2. Select account type (Engineer or Technician)
3. Enter full name
4. Enter your email address
5. Click "Send Verification Code"
6. Check your email inbox for the verification code
   - **Or** check the server terminal if in dev mode
7. Enter the 6-digit code in the "Enter Verification Code" field
8. Click "Verify Code"
9. See "✓ Email verified" confirmation
10. Fill in remaining fields:
    - Organization
    - Photo (optional)
    - Password
    - Confirm Password
11. Click "Create Account"

## Email Template

The verification email includes:
- **Subject:** "Your MTBM Verification Code"
- **Design:** Branded email with MTBM colors
- **Content:** 
  - Large, centered 6-digit code
  - Expiration notice (10 minutes)
  - Security disclaimer

## Security Features

1. **OTP Expiry**: OTPs expire after **10 minutes**
2. **One-time Use**: Each OTP can only be used once (marked as verified in database)
3. **Auto Cleanup**: Expired OTPs are automatically deleted from database (TTL index)
4. **Email Validation**: Email addresses must be in valid format
5. **Unique Email**: Each email can only be registered once per role

## Troubleshooting

### "Failed to send OTP"
- Check Gmail credentials in `.env` file
- Verify 2-Step Verification is enabled on your Google account
- Confirm App Password is correct (16 characters, no spaces)
- Check server logs for specific error messages

### "OTP verification failed"
- Make sure to enter the correct 6-digit code
- OTP expires after 10 minutes - request a new one if expired
- Each OTP can only be used once - don't reuse old codes
- Check that you're using the most recent OTP if you requested multiple

### "Please verify your email with OTP first"
- You must complete the OTP verification before signing up
- Click "Send Verification Code" and verify your email
- Look for the "✓ Email verified" confirmation before proceeding

### Server Shows OTP but Email Not Received
- This is normal for development mode (when Gmail credentials are missing)
- Add Gmail credentials to `.env` to enable real email sending
- Restart the server after adding credentials
- Check your spam/junk folder

### Email Field is Disabled
- After verifying OTP, the email field becomes read-only
- This prevents changing email after verification
- If you need to use a different email, refresh the page and start over

## Database Schema

### OTP Model
```javascript
{
  email: String,        // Lowercase email address
  otp: String,          // 6-digit code
  expiresAt: Date,      // 10 minutes from creation
  verified: Boolean,    // false until verified
  createdAt: Date       // Auto-added
}
```

### User Model
```javascript
{
  email: String,              // Required, unique per role
  role: String,               // "engineer" or "technician"
  fullName: String,
  organization: String,
  photoUrl: String,
  passwordHash: String,
  resetToken: String,         // For password reset
  resetTokenExpires: Date
}
```

## API Endpoints

### POST /api/otp/send-otp
Send OTP verification code to email
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully"
}
```

### POST /api/otp/verify-otp
Verify OTP code
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

### POST /api/auth/signup
Create new account (requires verified email)
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "engineer",
  "fullName": "John Doe",
  "organization": "Example Corp",
  "photoUrl": "https://...",
  "emailVerified": true
}
```

## Production Recommendations

1. **Use Environment Variables** - Never commit `.env` file to git
2. **Monitor Email Sending** - Track successful/failed email deliveries
3. **Rate Limiting** - Add cooldown between OTP requests to prevent spam
4. **IP Rate Limiting** - Prevent abuse from same IP address
5. **Email Blacklist** - Block disposable email services if needed
6. **Logging** - Log OTP requests for security monitoring
7. **Error Handling** - Provide clear error messages to users

## Cost Considerations

**Gmail SMTP:**
- ✅ **FREE** for personal use
- ✅ No per-email charges
- ✅ 500 emails per day limit (Gmail)
- ✅ 2000 emails per day limit (Google Workspace)
- ✅ No trial restrictions
- ✅ No account verification required

**Alternative Email Services:**
- **SendGrid** - 100 emails/day free, then paid
- **Mailgun** - 5,000 emails/month free
- **AWS SES** - $0.10 per 1,000 emails
- **Postmark** - 100 emails/month free

## Benefits of Email OTP

1. **No External Dependencies** - Uses existing Gmail setup
2. **Cost-Free** - No additional service fees
3. **High Deliverability** - Gmail SMTP has excellent delivery rates
4. **Professional** - Branded email templates
5. **Secure** - Email-based verification is widely trusted
6. **Simple** - No phone number format issues
7. **Global** - Works worldwide without regional restrictions

## Support

For email delivery issues:
- Gmail Help: https://support.google.com/mail
- Check spam/junk folders
- Verify sender email is not blacklisted
- Test with different email providers

For application issues:
- Check server logs for errors
- Verify `.env` configuration
- Ensure MongoDB connection is active
- Test with development mode first (no Gmail credentials)
