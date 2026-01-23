# Frontend Configuration for Email Setup

## Port Update

Your backend is running on **http://localhost:5001** (port 5000 was in use).

### Update Frontend API URL

Create or edit `.env` in the root folder:

```env
VITE_API_URL=http://localhost:5001
```

Then restart the frontend:
```bash
npm run dev
```

Your frontend will now point to the correct backend port.

---

## Complete Setup Summary

✅ **Backend**: Running on http://localhost:5001
✅ **Email**: Switched from SendGrid to Gmail
✅ **All endpoints** ready: signup, login, forgot-password, reset-password

## Now Test Email

1. Start frontend: `npm run dev` (in root folder, different terminal)
2. Go to http://localhost:5173
3. **Signup** or **Login** first
4. Click **"Forgot Password?"**
5. Enter your email
6. **Check Gmail inbox** for reset link
7. Click the link and set new password
8. Login with new password ✅

---

## Next: Configure Gmail

Before testing, you MUST add Gmail credentials to `server/.env`:

```env
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

See [GMAIL_SETUP.md](../GMAIL_SETUP.md) for step-by-step instructions.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| API requests fail | Update VITE_API_URL to `http://localhost:5001` |
| Email not sending | Add GMAIL_EMAIL and GMAIL_APP_PASSWORD to server/.env |
| Gmail password error | Enable 2-Step Verification on your Google Account first |
| Email goes to spam | Check Gmail spam folder, mark as "Not Spam" |
| Server won't start | Port 5001 might be in use; set PORT=5002 in .env |

