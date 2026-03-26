# MTBM DriveMate — Exhaustive Page File Documentation

This document provides extremely detailed descriptions of all 12 page files in the MTBM project. Every state variable, ref, effect, function, UI section, API call, polling interval, modal/dialog, CSS/styling detail, localStorage key, and hardcoded data array/object is documented with exact variable names, exact endpoint paths, exact color hex codes, exact pixel values, and exact timer intervals in milliseconds.

---

## Table of Contents

1. [Landing.jsx](#1-landingjsx)
2. [Login.jsx](#2-loginjsx)
3. [Signup.jsx](#3-signupjsx)
4. [ForgotPassword.jsx](#4-forgotpasswordjsx)
5. [engineer/Dashboard.jsx](#5-engineerdashboardjsx)
6. [engineer/Navigation.jsx](#6-engineernavigationjsx)
7. [engineer/Sensors.jsx](#7-engineersensorsjsx)
8. [engineer/LogBook.jsx](#8-engineerlogbookjsx)
9. [engineer/CallTechnician.jsx](#9-engineercalltechnicianjsx)
10. [admin/Dashboard.jsx](#10-admindashboardjsx)
11. [admin/AlertsList.jsx](#11-adminalertslistjsx)
12. [technician/TechnicianDashboard.jsx](#12-techniciantechniciandashboardjsx)

---

## 1. Landing.jsx

**File:** `src/pages/Landing.jsx`  
**Lines:** 1203  
**Purpose:** Public-facing landing page for the MTBM (Micro Tunnel Boring Machine) product. Features product showcase with tabbed image gallery, rental packages with pricing, meeting booking, payment processing (simulated), and a multilingual service chatbot.

### Imports

- React: `useState`, `useMemo`
- `react-router-dom`: `Link`
- `lucide-react`: `Menu`, `X`, `ChevronDown`, `Star`, `Mail`, `Phone`, `MapPin`, `Clock`, `Shield`, `Zap`, `CheckCircle`, `DollarSign`, `Users`, `Wrench`, `ArrowRight`, `CreditCard`, `Smartphone`, `Globe`
- `sonner`: `toast`
- `@/lib/auth`: `API_BASE_URL`

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `activeTab` | `"overview"` | Controls which TBM image tab is active |
| `mobileMenuOpen` | `false` | Toggles mobile hamburger menu |
| `expandedSections` | `{}` | Object tracking which FAQ accordion sections are expanded |
| `toastMessage` | `null` | Custom toast message object `{type, text}` |
| `meetingOpen` | `false` | Controls meeting booking modal visibility |
| `meetingLoading` | `false` | Loading state during meeting submission |
| `meetingForm` | `{name:"", email:"", phone:"", date:"", time:"", message:""}` | Meeting form data |
| `rentalOpen` | `false` | Controls rental packages section visibility |
| `paymentOpen` | `false` | Controls payment modal visibility |
| `paymentPackage` | `null` | Currently selected payment package name |
| `paymentMethod` | `null` | Selected payment method (visa/mastercard/bkash/nagad/banking) |
| `paymentStep` | `1` | Payment flow step (1=method selection, 2=form) |
| `paymentForm` | `{cardNumber:"", expiry:"", cvv:"", name:"", phone:"", pin:"", bank:""}` | Payment form data |
| `paymentProcessing` | `false` | Loading state during payment simulation |
| `paymentSuccess` | `false` | Whether simulated payment succeeded |
| `serviceChatOpen` | `false` | Controls chatbot visibility |
| `serviceChatInput` | `""` | Current chatbot input text |
| `serviceChatMessages` | `[{from:"bot", text:"👋 Welcome to DriveMate Service..."}]` | Array of chatbot messages |

### Refs (useRef)

None.

### Effects (useEffect)

None.

### Memoized Data (useMemo)

**`tabs`** — Array of 6 tab objects, each with `id`, `label`, `image`, `description`:

| id | label | image path | description excerpt |
|---|---|---|---|
| `"overview"` | `"Overview"` | `"/assets/mtbm/landing/overview.png"` | "Complete MTBM system overview..." |
| `"exploded"` | `"Exploded View"` | `"/assets/mtbm/landing/exploded.png"` | "Detailed exploded view..." |
| `"navigation"` | `"Navigation"` | `"/assets/mtbm/landing/navigation.png"` | "Advanced INS navigation..." |
| `"propulsion"` | `"Propulsion"` | `"/assets/mtbm/landing/propulsion.png"` | "High-performance propulsion..." |
| `"cutterhead"` | `"Cutter Head"` | `"/assets/mtbm/landing/cutterhead.png"` | "Precision-engineered cutting..." |
| `"muck"` | `"Muck Removal"` | `"/assets/mtbm/landing/muck.png"` | "Efficient muck removal..." |

### Hardcoded Data

**`packagePrices`** — Object mapping package names to prices:
```js
{ "Starter": "৳7,50,000", "Growth": "৳5,90,000", "Enterprise": "Custom" }
```

**Bank list** for Internet Banking:
```js
["Dutch-Bangla Bank", "BRAC Bank", "City Bank", "Eastern Bank"]
```

**Payment methods** — 5 methods defined inline in the UI:
- Visa (icon: CreditCard, color: `text-blue-400`)
- Mastercard (icon: CreditCard, color: `text-orange-400`)
- bKash (icon: Smartphone, color: custom `#E2136E`)
- Nagad (icon: Smartphone, color: custom `#F6921E`)
- Internet Banking (icon: Globe, color: `text-green-400`)

**Multilingual chatbot replies** — Object with keys `en`, `bn`, `banglish`, each containing 14+ keyword-response pairs. Keywords include: `hello/hi/hey`, `price/cost/package`, `rental/rent`, `feature`, `support/help`, `contact`, `tunnel/tbm/boring`, `safety`, `delivery/ship`, `warranty/guarantee`, `demo`, `custom`, `payment/pay`, `location/office`.

**Rental packages** — 3 packages rendered inline:
1. **Starter** — ৳7,50,000 — features: Basic TBM access, Email support, Monthly maintenance, 1 operator license
2. **Growth** — ৳5,90,000 (marked "Most Popular") — features: Advanced TBM + navigation, Priority 24/7 support, Weekly maintenance, 3 operator licenses, Real-time monitoring
3. **Enterprise** — Custom pricing — features: Full fleet access, Dedicated support team, Daily maintenance, Unlimited licenses, Custom integration, On-site training

### Functions

**`toggleSection(section)`** — Toggles FAQ accordion. Flips `expandedSections[section]` boolean.

**`handleMeetingSubmit(e)`** — Async. Prevents default. Sets `meetingLoading=true`. POSTs to `${API_BASE_URL}/api/meetings` with body `meetingForm` (JSON). On success: closes modal, resets form, shows success toast. On error: shows error toast. Finally sets `meetingLoading=false`.

**`handlePayment(e)`** — Prevents default. Sets `paymentProcessing=true`. Uses `setTimeout` with **2500ms** delay to simulate processing. On completion: sets `paymentProcessing=false`, `paymentSuccess=true`. After another `setTimeout` of **3000ms**: closes modal, resets all payment state.

**`handleServiceChat(e)`** — Prevents default. Pushes user message to `serviceChatMessages`. Clears input. After **600ms** `setTimeout`: generates bot reply. Language detection: checks if input contains Bengali Unicode range (`[\u0980-\u09FF]`), then checks for "banglish" patterns (regex: `/ami|tumi|kemon|achen|kivabe|dhonnobad|koto|dam|price|korte|chai|ki|diben|hobe|bhai/i`), otherwise defaults to `"en"`. Searches keyword matches in the multilingual reply object. Fallback messages per language if no keyword matches.

### API Calls

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| POST | `${API_BASE_URL}/api/meetings` | `{name, email, phone, date, time, message}` | Book a meeting |

### Polling Intervals

None.

### Modals/Dialogs

1. **Meeting Booking Modal** — Triggered by `meetingOpen`. Fixed overlay (`fixed inset-0 bg-black/60 z-50`). Card: `bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8`. Fields: name (text), email (email), phone (tel), date (date), time (time), message (textarea). Submit button: `bg-[#5B89B1]`. Close: X button top-right.

2. **Payment Modal** — Triggered by `paymentOpen`. Same overlay style. Two steps:
   - Step 1: Method selection — 5 clickable method cards with icons. Selected state: `border-[#5B89B1] bg-[#5B89B1]/10`.
   - Step 2: Payment form — varies by method. Card methods: cardNumber + expiry + cvv + name. bKash/Nagad: phone + pin. Banking: bank (select) + name. Processing shows spinning Loader. Success shows CheckCircle + "Payment Successful!" in `text-green-400`.

3. **Service Chatbot** — Fixed bottom-right (`fixed bottom-6 right-6 z-50`). Toggle button: `w-14 h-14 rounded-full bg-[#5B89B1]`. Chat window: `w-80 sm:w-96 h-[500px] bg-neutral-900 border border-neutral-800 rounded-2xl`. Header: `bg-[#5B89B1] text-white rounded-t-2xl p-4`. Messages area: `flex-1 overflow-y-auto p-4 space-y-3`. Bot messages: `bg-neutral-800 text-neutral-200 rounded-lg rounded-tl-none`. User messages: `bg-[#5B89B1] text-white rounded-lg rounded-tr-none ml-auto`. Input: `bg-neutral-800 border-neutral-700 text-white`.

### CSS/Styling Details

- Page background: `bg-black text-white`
- Navigation bar: `bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800` with `sticky top-0 z-50`
- Logo: `h-10 w-10 rounded-full bg-neutral-800`
- Brand name: "Bored Tunnelers" in `text-lg font-bold`
- Active tab highlight: `bg-[#5B89B1] text-white` vs inactive `text-neutral-400 hover:text-white`
- Hero section: `min-h-screen` with gradient overlay
- Feature cards: `bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-[#5B89B1]/50 transition-colors`
- Package cards: `bg-neutral-900 border border-neutral-800 rounded-2xl p-8`. "Most Popular" package has `border-[#5B89B1] relative` with badge `bg-[#5B89B1] text-white text-xs`.
- FAQ sections: `bg-neutral-900 border border-neutral-800 rounded-xl`
- CTA buttons: `bg-orange-500 hover:bg-orange-600 text-white` or `bg-[#5B89B1] hover:bg-[#5B89B1]/80`
- Footer: `bg-neutral-900 border-t border-neutral-800`
- bKash brand color: `#E2136E`
- Nagad brand color: `#F6921E`
- Tab images: `max-h-[500px] object-contain` with `bg-neutral-900 rounded-xl p-4`

### localStorage Keys

None.

### Hardcoded Data Arrays/Objects

See "Hardcoded Data" section above. Additionally:
- Feature icons array (inline): Shield ("Safety First"), Zap ("High Performance"), Wrench ("Easy Maintenance"), Users ("Expert Support")
- Stats section: "500+" Projects, "99.9%" Uptime, "24/7" Support, "50+" Countries
- Navigation links: Features, Packages, FAQ, Contact (all `#section-id`)

---

## 2. Login.jsx

**File:** `src/pages/Login.jsx`  
**Lines:** 198  
**Purpose:** Login page with email/password authentication, role selection (engineer/technician/admin), and Google OAuth integration.

### Imports

- React: `useState`, `useEffect`, `useRef`
- `react-router-dom`: `useNavigate`, `Link`
- `@/lib/auth`: `login`, `googleLogin`
- `@/components/ui/card`: `Card`, `CardContent`
- `@/components/ui/input`: `Input`
- `@/components/ui/button`: `Button`
- `@/components/ui/toast`: `Toast`

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `toastMessage` | `null` | Toast notification `{type, text}` |
| `selectedRole` | `null` | Currently selected role: `"engineer"`, `"technician"`, or `"admin"` |
| `email` | `""` | Email input value |
| `password` | `""` | Password input value |

### Refs (useRef)

| Ref | Initial Value | Purpose |
|---|---|---|
| `selectedRoleRef` | `null` | Mirrors `selectedRole` state for use inside Google callback closure (avoids stale closure) |

### Effects (useEffect)

1. **Sync role ref** — Dependency: `[selectedRole]`. Sets `selectedRoleRef.current = selectedRole`. Keeps ref in sync with state.

2. **Google Identity Services initialization** — Dependency: `[]` (mount only). Checks if `google.accounts` is already loaded; if not, creates a `<script>` element with `src="https://accounts.google.com/gsi/client"`, appends to `document.body`. On load, calls `google.accounts.id.initialize()` with:
   - `client_id`: `import.meta.env.VITE_GOOGLE_CLIENT_ID`
   - `callback`: `handleGoogleLogin`
   Then renders the Google button into `#google-signin-btn` div with config:
   ```js
   { theme: "outline", size: "large", text: "continue_with", shape: "pill", width: 360 }
   ```

### Hardcoded Data

**`dashboardRoutes`** — Maps roles to dashboard paths:
```js
{ engineer: "/engineer", technician: "/technician", admin: "/admin" }
```

### Functions

**`handleGoogleLogin(response)`** — Async. Reads `selectedRoleRef.current`. If no role selected, shows error toast "Please select a role first". Otherwise calls `googleLogin({ credential: response.credential, role })`. On success navigates to `dashboardRoutes[role]`. On error shows toast with `err.message`.

**`handleSubmit(e)`** — Async. Prevents default. Validates:
- Role must be selected (toast: "Please select a role")
- Email must match regex `/^\S+@\S+\.\S+$/` (toast: "Enter a valid email")
- Password must not be empty (toast: "Password is required")

Calls `login({ email, password, role })`. On success navigates to `dashboardRoutes[res.user.role]`. On error shows toast `err.message || "Login failed"`.

### API Calls

| Method | Via | Parameters | Purpose |
|---|---|---|---|
| — | `login({email, password, role})` | email, password, role | Email/password login (from auth lib) |
| — | `googleLogin({credential, role})` | Google JWT credential, role | Google OAuth login (from auth lib) |

### Polling Intervals

None.

### Modals/Dialogs

None.

### CSS/Styling Details

- Page: `min-h-screen bg-neutral-950 flex items-center justify-center p-4`
- Card: `max-w-4xl w-full bg-neutral-900 border-neutral-800` — 2-column layout on `md:` (form left, image right)
- Left column: `p-6 sm:p-8 flex flex-col justify-center`
- Role buttons:
  - Engineer/Technician selected: `bg-blue-600 text-white border-blue-600` vs unselected `bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-blue-400`
  - Admin selected: `bg-purple-600 text-white border-purple-600` vs unselected `hover:border-purple-400`
- Submit button: `w-full bg-slate-600 hover:bg-slate-700 text-white py-2.5`
- Inputs: `bg-neutral-800 border-neutral-700 text-white`
- Right column (hero image): `hidden md:block relative bg-cover bg-center rounded-r-lg` with `bg-gradient-to-br from-blue-600/20 to-purple-600/20` overlay
- Links: "Forgot password?" `text-blue-400 hover:underline`, "Sign up" `text-blue-400 hover:underline`

### localStorage Keys

None (managed by auth lib).

---

## 3. Signup.jsx

**File:** `src/pages/Signup.jsx`  
**Lines:** 442  
**Purpose:** User registration with account type selection, email OTP verification, optional photo upload, and form submission.

### Imports

- React: `useState`, `useRef`
- `react-router-dom`: `useNavigate`, `Link`
- `lucide-react`: `Eye`, `EyeOff`, `Mail`, `Lock`, `User`, `Building`, `Image`, `ChevronDown`, `Loader2`, `CheckCircle`, `ShieldCheck`
- `@/lib/auth`: `signup`, `uploadAvatar`, `API_BASE_URL`
- `@/components/ui/toast`: `Toast`

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `accountType` | `"engineer"` | Selected account type |
| `fullName` | `""` | Full name input |
| `email` | `""` | Email input |
| `otp` | `""` | OTP code input |
| `otpSent` | `false` | Whether OTP email has been sent |
| `otpVerified` | `false` | Whether OTP has been verified |
| `organization` | `""` | Organization name input |
| `photoFile` | `null` | Selected photo File object |
| `password` | `""` | Password input |
| `confirmPassword` | `""` | Confirm password input |
| `sendingOtp` | `false` | Loading state for OTP send |
| `verifyingOtp` | `false` | Loading state for OTP verify |

Additionally (from UI): `showPassword` and `showConfirmPassword` (boolean) for password visibility toggles.

### Refs (useRef)

| Ref | Initial Value | Purpose |
|---|---|---|
| `photoInputRef` | — | References hidden `<input type="file">` for photo upload |

### Effects (useEffect)

None.

### Functions

**`handleSendOtp()`** — Async. Validates email with regex. Sets `sendingOtp=true`. POSTs to `${API_BASE_URL}/api/otp/send-otp` with body `{email}`. On success sets `otpSent=true`, shows toast "OTP sent! Check your email". On error shows toast with error message. Finally sets `sendingOtp=false`.

**`handleVerifyOtp()`** — Async. Validates OTP matches `/^\d{6}$/`. Sets `verifyingOtp=true`. POSTs to `${API_BASE_URL}/api/otp/verify-otp` with body `{email, otp}`. On success sets `otpVerified=true`, shows toast "Email verified!". On error shows toast with error message. Finally sets `verifyingOtp=false`.

**`handleSignup(e)`** — Async. Prevents default. Validates:
- fullName required ("Full name is required")
- email regex `/^\S+@\S+\.\S+$/` ("Enter a valid email")
- Non-admin: `otpVerified` must be true ("Please verify your email first")
- password min 6 chars ("Password must be at least 6 characters")
- password === confirmPassword ("Passwords do not match")

Uploads photo if `photoFile` exists via `uploadAvatar(photoFile)` → returns `photoUrl`. Calls `signup({ email, password, role: accountType, fullName, organization, photoUrl, emailVerified: true })`. On success navigates to `/login` with toast "Account created!". On error shows toast with error.

### API Calls

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| POST | `${API_BASE_URL}/api/otp/send-otp` | `{email}` | Send OTP to email |
| POST | `${API_BASE_URL}/api/otp/verify-otp` | `{email, otp}` | Verify OTP code |
| — | `uploadAvatar(photoFile)` | File object | Upload avatar (from auth lib) |
| — | `signup({...})` | Full user data | Register user (from auth lib) |

### Polling Intervals

None.

### Modals/Dialogs

None (single-page form).

### CSS/Styling Details

- Page: `min-h-screen bg-neutral-950 flex items-center justify-center p-4`
- Card: `max-w-md w-full bg-neutral-900 border-neutral-800 rounded-xl overflow-hidden`
- Card header: `bg-slate-800 p-6 text-center` with shield icon
- Account type buttons:
  - Engineer selected: `bg-[#5B89B1] text-white border-[#5B89B1]`
  - Technician selected: `bg-[#5B89B1] text-white border-[#5B89B1]`
  - Admin selected: `bg-purple-600 text-white border-purple-600`
  - Unselected: `bg-neutral-800 text-neutral-300 border-neutral-700`
- OTP section: Appears after email entered and not yet verified. Send button: `bg-[#5B89B1]` or `bg-green-600` for verify
- Verified badge: `text-green-500` CheckCircle icon + "Email Verified"
- Photo upload: Hidden file input triggered by `Image` icon button. Shows filename when selected.
- Submit: `w-full bg-[#5B89B1] hover:bg-[#5B89B1]/90 text-white py-2.5`
- Admin note: Yellow `text-yellow-400` notice "Admin accounts skip email verification"
- Photo note: `text-xs text-neutral-500` "Optional • Max 2MB"

### localStorage Keys

None (managed by auth lib).

### Hardcoded Data Arrays/Objects

None beyond inline UI text.

---

## 4. ForgotPassword.jsx

**File:** `src/pages/ForgotPassword.jsx`  
**Lines:** 482  
**Purpose:** Multi-step password reset flow: email entry → OTP verification → new password → success confirmation.

### Imports

- React: `useState`, `useEffect`, `useRef`
- `react-router-dom`: `Link`
- `lucide-react`: `Mail`, `KeyRound`, `Lock`, `Eye`, `EyeOff`, `ArrowLeft`, `Loader2`, `CheckCircle`, `ShieldCheck`
- `@/lib/auth`: `API_BASE_URL`
- `@/components/ui/toast`: `Toast`

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `step` | `"email"` | Current step: `"email"`, `"otp"`, `"reset"`, or `"success"` |
| `email` | `""` | Email input value |
| `otp` | `["","","","","",""]` | Array of 6 individual OTP digit strings |
| `newPassword` | `""` | New password input |
| `confirmPassword` | `""` | Confirm new password input |
| `loading` | `false` | Form submission loading state |
| `resendTimer` | `60` | Countdown timer for OTP resend (seconds) |
| `toastMessage` | `null` | Toast `{type, text}` |
| `showPassword` | `false` | Toggle new password visibility |
| `showConfirmPassword` | `false` | Toggle confirm password visibility |

### Refs (useRef)

| Ref | Initial Value | Purpose |
|---|---|---|
| `otpRefs` | `Array(6).fill(null).map(() => useRef(null))` | Array of 6 refs for individual OTP digit `<input>` elements for auto-focus |

### Effects (useEffect)

1. **Resend timer countdown** — Dependencies: `[resendTimer, step]`. If `step === "otp"` and `resendTimer > 0`, sets a `setTimeout` of **1000ms** to decrement `resendTimer` by 1. Creates a chain of setTimeout calls (not setInterval).

### Functions

**`handleSendOtp(e)`** — Async. Prevents default. Validates email regex. Sets `loading=true`. POSTs to `${API_BASE_URL}/api/auth/forgot-password` with body `{email}`. On success: sets `step="otp"`, `resendTimer=60`. On error: shows toast. Finally `loading=false`.

**`handleResendOtp()`** — Async. Sets `loading=true`. POSTs to same `${API_BASE_URL}/api/auth/forgot-password` with `{email}`. On success: `resendTimer=60`, toast "OTP resent!". On error: toast. Finally `loading=false`.

**`handleVerifyOtp(e)`** — Async. Prevents default. Joins OTP array into string, validates length === 6. Sets `loading=true`. POSTs to `${API_BASE_URL}/api/auth/verify-reset-otp` with `{email, otp: joined}`. On success: `step="reset"`. On error: toast. Finally `loading=false`.

**`handleResetPassword(e)`** — Async. Prevents default. Validates `newPassword.length >= 6` and `newPassword === confirmPassword`. Sets `loading=true`. POSTs to `${API_BASE_URL}/api/auth/reset-password` with `{email, otp: otp.join(""), newPassword}`. On success: `step="success"`. On error: toast. Finally `loading=false`.

**`handleOtpChange(index, value)`** — Handles single OTP digit input. If value matches `/^\d$/`, sets that index in OTP array, auto-focuses next input via `otpRefs[index+1].current.focus()`. If empty string, clears that index.

**`handleOtpKeyDown(index, e)`** — On Backspace with empty current field: clears previous index, focuses previous input via `otpRefs[index-1].current.focus()`.

**`handleOtpPaste(e)`** — Handles paste event. Extracts digits from pasted text via `match(/\d/g)`, fills up to 6 OTP slots, focuses the last filled or the 6th input.

### API Calls

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| POST | `${API_BASE_URL}/api/auth/forgot-password` | `{email}` | Send reset OTP |
| POST | `${API_BASE_URL}/api/auth/verify-reset-otp` | `{email, otp}` | Verify reset OTP |
| POST | `${API_BASE_URL}/api/auth/reset-password` | `{email, otp, newPassword}` | Reset password |

### Polling Intervals

None (timer is a countdown, not polling).

### Modals/Dialogs

None (multi-step inline flow).

### CSS/Styling Details

- Page: `min-h-screen bg-neutral-950 flex items-center justify-center p-4`
- Card: `max-w-md w-full bg-neutral-900 border-neutral-800 rounded-xl overflow-hidden`
- Card header: `bg-slate-800 p-6 text-center`
- Step indicator: 3 circles (`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`) connected by lines (`h-0.5 w-12 sm:w-16`):
  - Completed: `bg-green-500 text-white`, line: `bg-green-500`
  - Current: `bg-white text-black`, line: `bg-white/20`
  - Future: `bg-white/20 text-white/40`, line: `bg-white/20`
- OTP inputs: `w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#5B89B1] focus:ring-2 focus:ring-[#5B89B1]/50`
- Resend timer: `text-neutral-400 text-sm` showing countdown; when expired: `text-[#5B89B1] hover:underline cursor-pointer`
- Back link: `text-neutral-400 hover:text-white`
- Submit buttons: `w-full bg-[#5B89B1] hover:bg-[#5B89B1]/90 text-white py-2.5`
- Success state: `text-green-500` CheckCircle `w-16 h-16`, "Password Reset Successful!" in `text-2xl font-bold text-white`, description in `text-neutral-400`
- Login link on success: `bg-[#5B89B1]`

### localStorage Keys

None.

### Hardcoded Data Arrays/Objects

None beyond inline UI text.

---

## 5. engineer/Dashboard.jsx

**File:** `src/pages/engineer/Dashboard.jsx`  
**Lines:** 956  
**Purpose:** Main engineer control panel featuring a TBM (Tunnel Boring Machine) visualization with interactive controls, sensor status bars, alerts system, floating messenger, and rating prompts.

### Imports

- React: `useState`, `useEffect`, `useRef`
- `react-router-dom`: `Link`
- `lucide-react`: `Menu`, `X`, `Power`, `Thermometer`, `Gauge`, `Zap`, `AlertTriangle`, `Bell`, `ChevronDown`, `LogOut`, `MessageCircle`, `Clock`, `CheckCircle`
- `sonner`: `toast`
- `@/lib/auth`: `clearCurrentUser`
- `@/lib/repairAlertsApi`: `repairAlertsApi`, `chatApi`
- `@/lib/adminChatApi`: `adminChatApi`
- `@/lib/alert-store`: `useAlerts`
- `@/lib/useEngineerNotifications`: `useEngineerNotifications`
- `@/components/MessengerPanel`: `default as MessengerPanel`
- `@/components/RatingModal`: `default as RatingModal`
- `@/components/UserBadge`: `default as UserBadge`

### Module-Level Variables

```js
let hasLoadedOnce = false;
```
Persists across component re-mounts (e.g., navigating away and back). Controls whether LoadingScreen displays.

### Sub-Components (defined in same file)

#### LoadingScreen

**State:**
| Variable | Initial Value | Purpose |
|---|---|---|
| `progress` | `0` | Loading bar percentage |
| `status` | `"Initializing systems..."` | Status text |

**Effect:** Single useEffect on mount. Runs through 6 stages at **350ms** intervals:
1. 15% — "Connecting to TBM..."
2. 35% — "Loading sensor data..."
3. 55% — "Calibrating instruments..."
4. 75% — "Establishing communication..."
5. 90% — "Almost ready..."
6. 100% — "Systems online!"

After 6th stage, waits **400ms** then calls `onComplete()`.

**UI:** Full-screen black overlay with centered content. Logo `h-16 w-16 rounded-full`. Brand "Bored Tunnelers" text. Progress bar: `h-2 bg-neutral-800 rounded-full overflow-hidden`, inner bar `bg-[#5B89B1]` with `transition-all duration-300`. Status text: `text-neutral-400`.

#### AlertsPopover

**Props:** `alerts`, `onClear`, `onRemove`

Renders a Bell icon button with red badge showing `alerts.length`. Clicking toggles dropdown showing AlertItems. Header has "Alerts" title + "Clear All" button (`text-red-400`). If no alerts: "No alerts yet" message.

Badge: `absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px]`

#### AlertItem

**Props:** `alert`, `onRemove`

Shows alert with icon (AlertTriangle for warning `text-yellow-500`, or Zap for critical `text-red-500`), message, subsystem, timestamp. Remove on click of X button.

#### StatusItem

**Props:** `icon`, `label`, `value`, `color`

Simple status display row with icon, label, and colored value.

#### ControlSwitch

**Props:** `label`, `icon`, `isOn`, `onToggle`

Toggle switch with label, Power icon, and green/neutral visual states. On: `bg-green-500/20 border-green-500/50`, icon `text-green-400`. Off: `bg-neutral-800 border-neutral-700`, icon `text-neutral-500`.

#### SensorBar

**Props:** `sensor`, `value`, `range`, `type`, `onWarning`

Horizontal bar showing sensor value. Width calculated as `((value - range.min) / (range.max - range.min)) * 100`. Colors: if `value > range.max * 0.8` → `bg-red-500`, elif `value > range.max * 0.6` → `bg-yellow-500`, else `bg-green-500`. On click: calls `onWarning` with the sensor name.

### DashboardContent State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `selectedSensor` | `"Temperature"` | Active sensor category tab |
| `mobileMenuOpen` | `false` | Mobile nav toggle |
| `controls` | `{propulsion:false, driveMotor:false, jetPump:false, slurryPump:false}` | TBM control switches |
| `activeRequests` | `[]` | User's active repair requests |
| `messengerOpen` | `false` | Floating messenger panel visibility |
| `unreadMsgCount` | `0` | Unread message count (chat + admin chat) |
| `ratingAlert` | `null` | Alert object for rating prompt |
| `showActiveRequests` | `false` | Toggle active requests dropdown |

**From useAlerts hook:** `alerts`, `addAlert`, `clearAlerts`, `removeAlert`

### Sensor Data State

**`sensorData`** — Nested object with 3 sensor types, each containing 8 components:

```js
{
  Temperature: {
    driveMotor: 45, slurryPump: 38, jetPump: 42, hpu: 55,
    conveyor: 35, cuttingHead: 48, thrustCylinder: 40, groutPump: 37
  },
  Pressure: {
    driveMotor: 150, slurryPump: 120, jetPump: 180, hpu: 200,
    conveyor: 90, cuttingHead: 160, thrustCylinder: 140, groutPump: 110
  },
  Current: {
    driveMotor: 80, slurryPump: 65, jetPump: 75, hpu: 90,
    conveyor: 50, cuttingHead: 85, thrustCylinder: 70, groutPump: 60
  }
}
```

**`sensorRanges`** — Defines min/max/unit per sensor type:
```js
{
  Temperature: { min: 20, max: 100, unit: "°C" },
  Pressure: { min: 0, max: 500, unit: "bar" },
  Current: { min: 0, max: 200, unit: "A" }
}
```

### Effects (useEffect)

1. **Fetch active requests** — Dependencies: `[]`. Calls `repairAlertsApi.getMyAlerts()`. Filters for status `"in-progress"` or `"resolved"`. Sets `activeRequests`. Polls every **10000ms** (10 seconds) via `setInterval`. Cleanup clears interval.

2. **Fetch unread message count** — Dependencies: `[]`. Calls both `chatApi.getUnreadCount()` and `adminChatApi.getUnreadCount()`. Sums them into `unreadMsgCount`. Polls every **5000ms** (5 seconds). Cleanup clears interval.

3. **Clear unread on messenger open** — Dependencies: `[messengerOpen]`. When `messengerOpen` becomes true, sets `unreadMsgCount=0`.

4. **Sensor fluctuation** — Dependencies: `[]`. Every **1000ms** (1 second), randomly fluctuates each sensor value by ±1-3 units (using `Math.random()`), clamped within sensor ranges. Cleanup clears interval.

### Functions

**`handleControlToggle(controlName)`** — Turns all controls off, then turns the specified control on (mutual exclusivity — only one control active at a time).

**`handleSensorWarning(sensorName)`** — Generates a random alert (warning or critical). Types:
- Warning: "elevated reading", "approaching threshold", "fluctuation detected"
- Critical: "exceeded safety limit", "immediate attention required", "system overload detected"

Chooses random type, creates alert via `addAlert()`, elevates the sensor value by 15-25% of its range (sometimes exceeds max). Fires `toast.warning()` or `toast.error()` accordingly.

**`handleRatingComplete()`** — Clears `ratingAlert`, refreshes active requests.

### Custom Hooks

**`useEngineerNotifications()`** — Called in main component. Handles background notification logic.

### TBM Image Logic

Based on which control is active:
- `jetPump` on → `/assets/mtbm/jetpump.png`
- `driveMotor` on → `/assets/mtbm/drivemotor.png`
- `propulsion` on → `/assets/mtbm/propulsion.png`
- All off (default) → `/assets/mtbm/tbm.png`
- `slurryPump` on → same default `/assets/mtbm/tbm.png`

### UI Sections

1. **Header** — Same as other engineer pages: logo, "Bored Tunnelers", nav tabs (Dashboard [active], Navigation, Sensors, Log Book, Call Technician), UserBadge, Logout button, mobile hamburger.

2. **TBM Visualization** — Central image display with control switches on left side. 4 ControlSwitch components: Propulsion, Drive Motor, Jet Pump, Slurry Pump.

3. **Status Panel** — Row of StatusItems: "TBM Status" (Online/Standby), "Speed" (value), "Drive" (active control name).

4. **Active Requests Section** — Collapsible. Shows count badge. Each request: subsystem, status badge (pending=`bg-yellow-500/20 text-yellow-400`, in-progress=`bg-blue-500/20 text-blue-400`, resolved=`bg-green-500/20 text-green-400`), "Chat" button, "Rate" button (resolved only).

5. **Sensor Bars Grid** — 3 tabs (Temperature/Pressure/Current). 8 SensorBar components per tab, one per TBM component.

6. **Floating Messenger Button** — Fixed position `bottom-4 right-4`. Blue circle `bg-blue-600 hover:bg-blue-700 w-14 h-14 rounded-full`. Unread badge: `absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px]`. Shows "99+" if count > 99.

7. **MessengerPanel** — Rendered when `messengerOpen=true`. Passed `onClose` callback.

8. **RatingModal** — Rendered when `ratingAlert` is set. Props: `alertId`, `alertInfo`, `onClose`, `onRatingComplete`.

### API Calls

| Method | Via | Purpose |
|---|---|---|
| GET | `repairAlertsApi.getMyAlerts()` | Fetch engineer's repair alerts |
| GET | `chatApi.getUnreadCount()` | Get unread chat message count |
| GET | `adminChatApi.getUnreadCount()` | Get unread admin chat message count |

### Polling Intervals

| Interval | Duration | Purpose |
|---|---|---|
| Active requests fetch | 10000ms (10s) | Refresh repair alert statuses |
| Unread message count | 5000ms (5s) | Check for new messages |
| Sensor fluctuation | 1000ms (1s) | Simulate sensor readings |

### CSS/Styling Details

- Page: `min-h-screen w-full bg-black text-white`
- Header: `border-b border-neutral-800 bg-neutral-900/50`
- Active nav tab: `bg-blue-600 text-white` vs `text-neutral-400 hover:text-white`
- Logout button: `bg-red-600 hover:bg-red-700`
- Control switches: `rounded-lg p-3 border transition-colors`
- Sensor bar track: `h-3 rounded-full bg-neutral-700`
- Sensor bar fill: `h-full rounded-full transition-all duration-300`
- Alert badge: `bg-red-500 text-[10px] font-bold`

### localStorage Keys

| Key | Purpose |
|---|---|
| `mtbm_alert_seen` | Stores the last seen alert count for badge management |

### Hardcoded Data

- Loading screen stages (6 steps)
- Sensor initial values (24 values across 3 types × 8 components)
- Sensor ranges (3 types)
- Warning/critical message arrays (3 warning messages, 3 critical messages)

---

## 6. engineer/Navigation.jsx

**File:** `src/pages/engineer/Navigation.jsx`  
**Lines:** 1063  
**Purpose:** IMU-based navigation system display with flight instruments (attitude indicator, heading indicator), real-time charts for attitude/heading/gradient history, fault-tolerant INS diagnostic panel, and navigation accuracy metrics.

### Imports

- React: `useState`, `useEffect`, `useRef`, `useMemo`
- `react-router-dom`: `Link`
- `lucide-react`: `Menu`, `X`, `Navigation`, `Compass`, `Activity`, `AlertTriangle`, `CheckCircle`, `ChevronRight`, `ArrowUp`, `ArrowDown`, `Target`, `Wifi`, `Shield`, `Cpu`, `LogOut`, `MessageCircle`
- `recharts`: `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`
- `@/components/flight-indicators`: `AttitudeIndicator`, `HeadingIndicator`
- `@/lib/auth`: `clearCurrentUser`
- `@/components/UserBadge`: `default`

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `mobileMenuOpen` | `false` | Mobile nav toggle |
| `imuData` | `{pitch:1.2, roll:0.3, heading:127.5, yawRate:0.02, gradient:-0.8, chainage:1250.5}` | Current IMU readings |
| `history` | `[]` | Array of historical IMU data points |
| `targetHeading` | `128.0` | Target heading for alignment display |
| `targetGradient` | `-1.0` | Target gradient for alignment display |
| `selectedFault` | `"gyro"` | Selected fault type for INS diagnostic |

### Refs (useRef)

| Ref | Initial Value | Purpose |
|---|---|---|
| `chainageRef` | `useRef(1250.5)` | Accumulates chainage progressively (avoids state re-render on every tick) |

### Effects (useEffect)

1. **Initialize history** — Dependencies: `[]`. Creates 20 initial data points by decrementing time by **2000ms** intervals. Each point has: `time` (formatted HH:MM:SS), `pitch` (1.2 ± random fluctuation), `roll` (0.3 ± random), `heading` (127.5 ± random), `gradient` (-0.8 ± random). Sets `history` state.

2. **IMU data update interval** — Dependencies: `[]`. Every **1000ms** (1 second):
   - Advances `chainageRef.current` by `0.02 + Math.random() * 0.01` (range 0.02-0.03 per tick)
   - Applies gradual fluctuation to each IMU parameter
   - Normalizes heading to 0-360 range
   - Updates `imuData` state
   - Appends to `history` (keeps last 19 + new = 20 total points)
   - Cleanup clears interval.

### Helper Functions

**`gradualFluctuate(value, maxChange, min, max)`** — Returns value with small random change applied, clamped within [min, max]. Change formula: `(Math.random() - 0.5) * 2 * maxChange`.

**`normalizeHeading(heading)`** — Normalizes heading to 0-360 range. `((heading % 360) + 360) % 360`.

### Sub-Components (defined in same file)

#### StatusCard
**Props:** `icon`, `label`, `value`, `unit`, `status`, `color`
Card with icon, label, value+unit, status indicator. Status dot: `w-2 h-2 rounded-full` with color based on `status` — `"normal"` → `bg-green-500`, `"warning"` → `bg-yellow-500`, `"critical"` → `bg-red-500`.

#### DataRow
**Props:** `label`, `value`, `unit`
Simple label-value-unit row in `text-sm`.

#### AlignmentBar
**Props:** `label`, `current`, `target`, `unit`, `range`
Visual bar showing current vs target alignment. Bar: `h-3 bg-neutral-700 rounded-full`. Fill calculated from `Math.abs(current - target) / range * 100`, capped at 100. Color: deviation < 25% → `bg-green-500`, < 50% → `bg-yellow-500`, else `bg-red-500`.

#### LegendItem
**Props:** `color`, `label`
Colored dot + label for chart legends.

#### SensorHealthRow
**Props:** `name`, `health`, `fault`, `confidence`
Row showing sensor health (`≤30%` → `text-red-400`, `≤70%` → `text-yellow-400`, else `text-green-400`), fault status ("None" → `text-green-400`, else `text-red-400`), confidence percentage.

**8 sensor rows defined:**

| Sensor | Health | Fault | Confidence |
|---|---|---|---|
| Accelerometer X | 98% | None | 99.2% |
| Accelerometer Y | 95% | None | 98.7% |
| Accelerometer Z | 97% | None | 99.0% |
| Gyroscope X | 92% | None | 97.5% |
| Gyroscope Y | 45% | Drift | 72.3% |
| Gyroscope Z | 94% | None | 98.1% |
| Temperature | 88% | Overtemp | 85.4% |

(Note: Gyroscope Y and Temperature have faults.)

#### MetricCard
**Props:** `label`, `value`, `icon`, `color`
Small card with icon and metric value.

### Fault-Tolerant INS Panel

3-step diagnostic panel:

**Step 1: Sensor Monitoring** — 7 sensor health rows (see above table).

**Step 2: Fault Classification** — Toggle between `"gyro"` and `"temp"` faults:
- Gyro: "Drift Fault" — "Gradual offset in Gyroscope Y readings", Severity "Medium" (`text-yellow-400`), Confidence 72.3%
- Temp: "Overtemperature" — "Temperature sensor exceeding normal range", Severity "Low" (`text-blue-400`), Confidence 85.4%

**Step 3: Suggested Solution** — Based on `selectedFault`:
- Gyro: 3 suggestions — "Apply Kalman filter compensation", "Switch to redundant gyro", "Recalibrate after 10min cooldown"
- Temp: 3 suggestions — "Reduce sampling rate temporarily", "Activate cooling protocol", "Cross-reference with external sensors"

### Charts

1. **Attitude History** (LineChart, `height={200}`):
   - X axis: `dataKey="time"`, tick font size 10px, neutral-500
   - Y axis: domain auto
   - CartesianGrid: `strokeDasharray="3 3"`, stroke `#333`
   - Line 1: `dataKey="pitch"`, stroke `#3B82F6` (blue), dot=false, strokeWidth=2
   - Line 2: `dataKey="roll"`, stroke `#22C55E` (green), dot=false, strokeWidth=2
   - Legend: LegendItems for Pitch (blue) and Roll (green)

2. **Heading & Gradient** (LineChart, `height={200}`):
   - Two Y axes: left `yAxisId="heading"` domain `[125, 131]`, right `yAxisId="gradient"` domain `[-3, 1]`
   - Line 1: `dataKey="heading"`, stroke `#F59E0B` (amber), yAxisId="heading", dot=false, strokeWidth=2
   - Line 2: `dataKey="gradient"`, stroke `#EF4444` (red), yAxisId="gradient", dot=false, strokeWidth=2
   - Legend: LegendItems for Heading (amber) and Gradient (red)

### Flight Instruments

- **AttitudeIndicator**: `roll={imuData.roll * 5}`, `pitch={imuData.pitch * 3}`, `size={220}`
- **HeadingIndicator**: `heading={imuData.heading}`, `size={220}`

Both wrapped in `w-[220px] h-[220px]` containers.

### Navigation Accuracy Metrics (4 MetricCards)

| Label | Value | Icon | Color |
|---|---|---|---|
| Position Accuracy | ±2.3mm | Target | text-blue-400 |
| Heading Accuracy | ±0.05° | Compass | text-green-400 |
| Roll Accuracy | ±0.08° | Activity | text-purple-400 |
| Recovery Status | Active | Shield | text-orange-400 |

### UI Sections

1. **Header** — Same as Dashboard with "Navigation" tab highlighted.
2. **Flight Instruments Row** — 2 instruments + data panel with pitch/roll/heading/yawRate/gradient/chainage.
3. **Alignment Bars** — Heading alignment (current vs 128.0°, range 10) and Gradient alignment (current vs -1.0°, range 5).
4. **Charts Grid** — 2 columns: Attitude History + Heading & Gradient.
5. **Fault-Tolerant INS** — 3-step accordion panel.
6. **Navigation Accuracy** — 4 metric cards in grid.

### API Calls

None.

### Polling Intervals

| Interval | Duration | Purpose |
|---|---|---|
| IMU data simulation | 1000ms (1s) | Update simulated sensor readings |

### Modals/Dialogs

None.

### CSS/Styling Details

- Page: `min-h-screen w-full bg-black text-white`
- Section cards: `bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6`
- Chart containers: `bg-neutral-900 border border-neutral-800 rounded-xl p-4`
- Status dot animation: none (static)
- Fault step numbers: `w-8 h-8 rounded-full bg-[#5B89B1] flex items-center justify-center text-sm font-bold`
- Active nav tab: `bg-blue-600 text-white`

### localStorage Keys

None.

### Hardcoded Data

- Initial IMU values (see state)
- 8 sensor health entries (see SensorHealthRow table)
- Fault classification data (gyro drift + overtemp)
- Suggested solutions (3 per fault type)
- Navigation accuracy metrics (4 values)
- Target heading: 128.0, target gradient: -1.0

---

## 7. engineer/Sensors.jsx

**File:** `src/pages/engineer/Sensors.jsx`  
**Lines:** 759  
**Purpose:** Detailed sensor monitoring dashboard with gauge visualizations (GaugeComponent), line/area charts for trends, and sensor type tabs (Temperature, Pressure, Current).

### Imports

- React: `useState`, `useEffect`
- `react-router-dom`: `Link`
- `lucide-react`: `Menu`, `X`, `Thermometer`, `Gauge`, `Zap`, `LogOut`
- `recharts`: `LineChart`, `Line`, `AreaChart`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`
- `react-gauge-component`: `default as GaugeComponent`
- `@/lib/auth`: `clearCurrentUser`
- `@/components/UserBadge`: `default`

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `mobileMenuOpen` | `false` | Mobile nav toggle |
| `selectedSensor` | `"Temperature"` | Active sensor type tab |
| `sensorData` | (same structure as Dashboard) | Current sensor readings |
| `history` | `[]` | Array of historical data points per sensor type |

**`sensorData` initial values** — Same as Dashboard:
```js
{
  Temperature: { driveMotor:45, slurryPump:38, jetPump:42, hpu:55, conveyor:35, cuttingHead:48, thrustCylinder:40, groutPump:37 },
  Pressure: { driveMotor:150, slurryPump:120, jetPump:180, hpu:200, conveyor:90, cuttingHead:160, thrustCylinder:140, groutPump:110 },
  Current: { driveMotor:80, slurryPump:65, jetPump:75, hpu:90, conveyor:50, cuttingHead:85, thrustCylinder:70, groutPump:60 }
}
```

**Sensor ranges** (different from Dashboard):
```js
{
  Temperature: { min: 0, max: 100, unit: "°C" },
  Pressure: { min: 0, max: 500, unit: "bar" },
  Current: { min: 0, max: 200, unit: "A" }
}
```
Note: Temperature min is 0 here vs 20 in Dashboard.

### Effects (useEffect)

1. **Initialize history** — Dependencies: `[]`. Creates 20 initial data points at **2000ms** intervals back from current time. Each point has `time` (HH:MM:SS), `driveMotor`, `slurryPump`, `jetPump`, `hpu` values with slight random variation. Sets history for each sensor type.

2. **Sensor data update + history append** — Dependencies: `[]`. Every **2000ms** (2 seconds — NOT 1000ms like Dashboard):
   - Fluctuates each of the 8 component values by ±1-3 within ranges
   - Appends new point to history (keeps last 19 + new = 20)
   - Cleanup clears interval.

### GaugeComponent Configuration

Each gauge uses:
```jsx
<GaugeComponent
  arc={{
    subArcs: [
      { limit: 20, color: "#5BE12C" },   // green
      { limit: 40, color: "#F5CD19" },   // yellow
      { limit: 60, color: "#F5881D" },   // orange
      { limit: 80, color: "#EA4228" }    // red
    ]
  }}
  value={normalizedValue}
  labels={{
    valueLabel: {
      style: { fontSize: "28px", fill: "#FFFFFF" }
    }
  }}
/>
```

`normalizedValue` = `((value - range.min) / (range.max - range.min)) * 100`

**8 gauges displayed:**

| Gauge | Data Key |
|---|---|
| Drive Motor | `driveMotor` |
| Slurry Pump | `slurryPump` |
| Jet Pump | `jetPump` |
| HPU | `hpu` |
| Conveyor | `conveyor` |
| Cutting Head | `cuttingHead` |
| Thrust Cylinder | `thrustCylinder` |
| Grout Pump | `groutPump` |

### Charts

1. **Trend Line Chart** (LineChart, `height={250}`):
   - X axis: `dataKey="time"`, tick fontSize 10, fill `#888`
   - Y axis: tick fontSize 10, fill `#888`
   - CartesianGrid: `strokeDasharray="3 3"`, stroke `#333`
   - 4 lines:
     - `driveMotor` — stroke `#EF4444` (red), strokeWidth=2, dot=false
     - `slurryPump` — stroke `#22C55E` (green), strokeWidth=2, dot=false
     - `jetPump` — stroke `#3B82F6` (blue), strokeWidth=2, dot=false
     - `hpu` — stroke `#F59E0B` (amber), strokeWidth=2, dot=false

2. **Area Chart** (AreaChart, `height={200}`):
   - Same X/Y/Grid config
   - 2 areas:
     - `driveMotor` — stroke `#EF4444`, fill `#EF4444`, fillOpacity=0.2
     - `slurryPump` — stroke `#22C55E`, fill `#22C55E`, fillOpacity=0.2

### Functions

**Sensor bar click behavior** — Same as Dashboard: generates random warning/critical alert, elevates value, fires toast.

### UI Sections

1. **Header** — Same as other engineer pages with "Sensors" tab highlighted.
2. **Sensor Type Tabs** — 3 tabs: Temperature (Thermometer icon), Pressure (Gauge icon), Current (Zap icon). Active: `bg-blue-600 text-white`.
3. **Gauges Grid** — `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`. Each gauge card: `bg-neutral-900 border border-neutral-800 rounded-xl p-4`. Component name at top, raw value + unit below gauge.
4. **Charts Section** — 2-column grid on lg: LineChart (left) + AreaChart (right).

### API Calls

None.

### Polling Intervals

| Interval | Duration | Purpose |
|---|---|---|
| Sensor data update | 2000ms (2s) | Simulate fluctuating sensor readings |

### Modals/Dialogs

None.

### CSS/Styling Details

- Page: `min-h-screen w-full bg-black text-white`
- Gauge cards: `bg-neutral-900 border border-neutral-800 rounded-xl p-4`
- Chart cards: `bg-neutral-900 border border-neutral-800 rounded-xl p-4`
- Tab active: `bg-blue-600 text-white`
- Tab inactive: `text-neutral-400 hover:text-white bg-neutral-800`
- Gauge value label: fontSize `28px`, fill `#FFFFFF`
- Gauge arc colors: `#5BE12C` (green 0-20%), `#F5CD19` (yellow 20-40%), `#F5881D` (orange 40-60%), `#EA4228` (red 60-100%)

### localStorage Keys

None.

### Hardcoded Data

- Sensor initial values (24 values, same as Dashboard)
- Sensor ranges (3 types — note Temperature min=0 vs Dashboard min=20)
- Gauge arc sub-arcs (4 color zones)

---

## 8. engineer/LogBook.jsx

**File:** `src/pages/engineer/LogBook.jsx`  
**Lines:** 861  
**Purpose:** Log book for recording TBM operational entries. Features a searchable/filterable table with pagination, a modal for adding new entries with custom date picker, and CSV-style data management.

### Imports

- React: `useState`, `useEffect`
- `react-router-dom`: `Link`
- `lucide-react`: `Menu`, `X`, `Plus`, `Search`, `Calendar`, `ChevronLeft`, `ChevronRight`, `Download`, `LogOut`, `Loader2`, `MapPin`
- `@/lib/auth`: `API_BASE_URL`, `clearCurrentUser`
- `sonner`: `toast`
- `@/components/UserBadge`: `default`

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `mobileMenuOpen` | `false` | Mobile nav toggle |
| `entries` | `[]` | Array of log book entries |
| `isLoading` | `true` | Loading state for fetching entries |
| `isModalOpen` | `false` | Add entry modal visibility |
| `currentPage` | `1` | Current pagination page |
| `searchQuery` | `""` | Company name search filter |
| `locationQuery` | `""` | Location search filter |
| `itemsPerPage` | `10` | Number of entries per page |

### Refs (useRef)

None.

### Effects (useEffect)

1. **Fetch entries** — Dependencies: `[]`. Async IIFE. GETs `${API_BASE_URL}/api/logbook` with `Authorization: Bearer ${token}` header (token from `loadCurrentUser().token`). Parses JSON, sets `entries`, sets `isLoading=false`.

### Hardcoded Data

**`LOCATIONS`** — Array of 20 Bangladesh cities:
```js
[
  "Dhaka", "Chittagong", "Khulna", "Rangpur", "Barishal",
  "Sylhet", "Mymensingh", "Rajshahi", "Barisal", "Cox's Bazar",
  "Comilla", "Gazipur", "Narayanganj", "Tangail", "Jashore",
  "Dinajpur", "Bogra", "Pabna", "Noakhali", "Feni"
]
```

### Sub-Components (defined in same file)

#### DatePicker

**Props:** `value`, `onChange`, `label`

**State:**
- `isOpen` (false) — Calendar dropdown visibility
- `selectedDate` (null) — Currently selected Date object
- `viewMonth` (current month) — Displayed month (0-11)
- `viewYear` (current year) — Displayed year

**Functionality:**
- Month selector: prev/next arrows, displays month name
- Year selector: Range **2024-2026** in a dropdown
- Calendar grid: 7 columns (Sun-Sat headers), dates for the view month
- Formats selected date as `DD/MM/YYYY` (with zero-padded day/month)
- Today highlight: `bg-neutral-700` if the day matches today
- Selected day: `bg-[#5B89B1] text-white`
- Closes on date selection

#### AddEntryModal

**Props:** `isOpen`, `onClose`, `onAdd`

**State:**
- `issueDate` ("") — Issue date string
- `returnDate` ("") — Return date string
- `company` ("") — Company name
- `location` ("") — Location (from LOCATIONS dropdown)

**Duration calculation:**
```js
const parseDateStr = (str) => {
  const [dd, mm, yyyy] = str.split("/");
  return new Date(yyyy, mm - 1, dd);
};
```
Auto-calculates duration between issue and return dates: `X Years, Y Months, Z Days` (or just the relevant non-zero parts).

**Validation:** All 4 fields required. Return date must be after or equal to issue date.

**On submit:** Calls `onAdd({issue: issueDate, return: returnDate, duration: calculatedDuration, company, location})`.

### Functions

**`handleAddEntry(entry)`** — Async. POSTs to `${API_BASE_URL}/api/logbook` with entry body + auth header. On success: Prepends new entry to `entries`, closes modal, shows `toast.success("Entry added successfully!")`. On error: shows `toast.error()`.

**`filteredEntries`** — Computed (not memoized). Filters `entries` by:
1. `searchQuery`: case-insensitive match against `entry.company`
2. `locationQuery`: case-insensitive match against `entry.location`

**`totalPages`** — `Math.ceil(filteredEntries.length / itemsPerPage)`

**`paginatedEntries`** — Slices `filteredEntries` for current page: `[(currentPage-1)*itemsPerPage, currentPage*itemsPerPage]`

**Search handlers** — Both `setSearchQuery` and `setLocationQuery` reset `currentPage` to 1.

### UI Sections

1. **Header** — Same engineer nav with "Log Book" tab highlighted.

2. **Search/Filter Bar** — Two inputs:
   - Company search: `bg-neutral-800 border-neutral-700`, Search icon, placeholder "Search by company..."
   - Location filter: `bg-neutral-800 border-neutral-700`, MapPin icon, placeholder "Filter by location..."
   - "Add Entry" button: `bg-[#5B89B1] hover:bg-[#5B89B1]/80`

3. **Entries Table** — Headers: #, Issue Date, Return Date, Duration, Company, Location. Rows: `hover:bg-neutral-800/50 border-b border-neutral-800`. Row numbering: `(currentPage - 1) * itemsPerPage + index + 1`.

4. **Pagination** — Buttons: First (`❮❮`), Prev (`❮`), numbered pages, Next (`❯`), Last (`❯❯`). Active page: `bg-[#5B89B1] text-white`. Disabled state: `opacity-50 cursor-not-allowed`. Shows "Page X of Y" text. Items per page info: "Showing X to Y of Z entries".

5. **Empty state** — Calendar icon + "No entries found" message when `filteredEntries.length === 0`.

6. **Loading state** — Loader2 spinning icon.

### API Calls

| Method | Endpoint | Headers | Body | Purpose |
|---|---|---|---|---|
| GET | `${API_BASE_URL}/api/logbook` | `Authorization: Bearer ${token}` | — | Fetch all entries |
| POST | `${API_BASE_URL}/api/logbook` | `Authorization: Bearer ${token}` | `{issue, return, duration, company, location}` | Add new entry |

### Polling Intervals

None.

### Modals/Dialogs

**AddEntryModal** — Overlay: `fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4`. Card: `bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6`. Close X top-right. 4 fields: Issue Date (DatePicker), Return Date (DatePicker), Company (text input), Location (select dropdown from LOCATIONS). Duration shown as read-only calculated text if both dates valid. Submit: "Add Entry" button `bg-[#5B89B1]`.

### CSS/Styling Details

- Page: `min-h-screen w-full bg-black text-white`
- Table header: `bg-neutral-800/50` with `text-neutral-400 text-xs uppercase tracking-wider`
- Table rows: `border-b border-neutral-800 hover:bg-neutral-800/50`
- Pagination buttons: `px-3 py-1.5 rounded-md text-sm bg-neutral-800 hover:bg-neutral-700`
- Date picker calendar: `absolute z-50 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl p-3 w-72`
- Date picker day cells: `w-9 h-9 rounded-full flex items-center justify-center text-sm hover:bg-neutral-600`
- Location dropdown: `bg-neutral-800 border-neutral-700 text-white`

### localStorage Keys

None (auth token managed by auth lib).

### Hardcoded Data

- LOCATIONS array (20 cities — see above)
- Year range for DatePicker: 2024-2026
- itemsPerPage: 10

---

## 9. engineer/CallTechnician.jsx

**File:** `src/pages/engineer/CallTechnician.jsx`  
**Lines:** 602  
**Purpose:** Interface for engineers to create repair requests (call technicians), view pending/active/resolved requests, chat with assigned technicians, and rate completed work.

### Imports

- React: `useState`, `useEffect`
- `react-router-dom`: `Link`
- `lucide-react`: `Menu`, `X`, `Plus`, `Clock`, `AlertCircle`, `CheckCircle`, `LogOut`, `MessageCircle`, `Star`, `Loader2`
- `sonner`: `toast`
- `@/lib/auth`: `clearCurrentUser`
- `@/lib/repairAlertsApi`: `repairAlertsApi`
- `@/lib/useEngineerNotifications`: `useEngineerNotifications`
- `@/components/ChatBox`: `default as ChatBox`
- `@/components/RatingModal`: `default as RatingModal`
- `@/components/UserBadge`: `default`

### Sub-Components (defined in same file)

#### RatingDisplay
**Props:** `rating`, `size` (default "md")
Displays 1-5 stars. Filled stars: `text-yellow-400`, empty: `text-neutral-600`. Size "sm" uses `w-3 h-3`, "md" uses `w-4 h-4`.

#### CallTechnicianModal
**Props:** `isOpen`, `onClose`, `onSubmit`, `isSubmitting`

**State:**
- `subsystem` ("") — Subsystem name (text input)
- `priority` ("medium") — Priority level (select)
- `problem` ("") — Problem description (textarea)

Priority options: `low`, `medium`, `high`, `critical`

On submit: Validates subsystem and problem are non-empty. Calls `onSubmit({subsystem, issue: problem, priority})`.

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `mobileMenuOpen` | `false` | Mobile nav toggle |
| `isModalOpen` | `false` | CallTechnicianModal visibility |
| `isSubmitting` | `false` | Submission loading state |
| `myRequests` | `[]` | Engineer's repair requests |
| `loadingRequests` | `true` | Loading state for requests |
| `activeChatAlert` | `null` | Alert object for active chat |
| `ratingAlert` | `null` | Alert object for rating modal |

### Custom Hooks

**`useEngineerNotifications()`** — Background notification handler.

### Effects (useEffect)

1. **Fetch my requests** — Dependencies: `[]`. Calls `repairAlertsApi.getMyAlerts()`. Maps results into `myRequests` with fields: `_id`, `subsystem`, `issue`, `status`, `priority`, `createdAt`, `acceptedAt`, `resolvedAt`, `engineerName`, `technicianName`, `rating`, `ratingComment`. Polls every **10000ms** (10 seconds) via `setInterval`. Cleanup clears interval.

### Functions

**`handleSubmit(formData)`** — Async. Sets `isSubmitting=true`. Calls `repairAlertsApi.create({ subsystem: formData.subsystem, issue: formData.issue, priority: formData.priority })`. On success: closes modal, refreshes requests, shows `toast.success("Repair request sent!")`. On error: `toast.error()`. Finally `isSubmitting=false`.

**`handleOpenChat(request)`** — Sets `activeChatAlert` with `{id: request._id, info: {subsystem, issue, status, engineerName, technicianName, priority}}`.

**`handleOpenRating(request)`** — Sets `ratingAlert` with `{id: request._id, info: {subsystem, issue, technicianName}}`.

**`handleRatingComplete()`** — Clears `ratingAlert`, refreshes requests.

**`formatTimestamp(dateStr)`** — Returns formatted date string via `new Date(dateStr).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit"})`.

### UI Sections

1. **Header** — Same engineer nav with "Call Technician" tab highlighted.

2. **Page Title + "New Request" Button** — `bg-[#5B89B1]` button with Plus icon.

3. **Requests List** — Each request rendered as a card:
   - `bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6`
   - Top row: Subsystem name + status badge + priority badge
   - Status badges:
     - `pending`: `bg-yellow-500/20 text-yellow-400` + Clock icon
     - `in-progress`: `bg-blue-500/20 text-blue-400` + AlertCircle icon
     - `resolved`: `bg-green-500/20 text-green-400` + CheckCircle icon
   - Priority badges:
     - `low`: `bg-neutral-700 text-neutral-300`
     - `medium`: `bg-yellow-500/20 text-yellow-400`
     - `high`: `bg-orange-500/20 text-orange-400`
     - `critical`: `bg-red-500/20 text-red-400`
   - Issue text: `text-neutral-300 text-sm`
   - Timestamps: Created, Accepted (if exists), Resolved (if exists)
   - Technician name: `text-blue-400`
   - Actions row:
     - "Chat" button (for in-progress/resolved): `bg-blue-600 hover:bg-blue-700` with MessageCircle icon
     - "Rate" button (for resolved without rating): `bg-yellow-600 hover:bg-yellow-700` with Star icon
   - Rating display: RatingDisplay component + rating comment in `text-neutral-400 italic`

4. **Empty state** — When no requests: Bell icon, "No repair requests yet", "Click 'New Request' to create one"

5. **Loading state** — Loader2 spinning + "Loading requests..."

### API Calls

| Method | Via | Parameters | Purpose |
|---|---|---|---|
| GET | `repairAlertsApi.getMyAlerts()` | — | Fetch engineer's alerts |
| POST | `repairAlertsApi.create({subsystem, issue, priority})` | form data | Create new repair request |

### Polling Intervals

| Interval | Duration | Purpose |
|---|---|---|
| My requests refresh | 10000ms (10s) | Keep request statuses updated |

### Modals/Dialogs

1. **CallTechnicianModal** — Overlay: `fixed inset-0 bg-black/60 z-50`. Card: `bg-neutral-900 border-neutral-800 rounded-xl max-w-md w-full p-6`. Fields: Subsystem (text), Priority (select: low/medium/high/critical), Problem Description (textarea rows=4). Submit: "Send Request" `bg-[#5B89B1]`.

2. **ChatBox** — Rendered when `activeChatAlert` is set. Props: `alertId`, `alertInfo`, `onClose`.

3. **RatingModal** — Rendered when `ratingAlert` is set. Props: `alertId`, `alertInfo`, `onClose`, `onRatingComplete`.

### CSS/Styling Details

- Page: `min-h-screen w-full bg-black text-white`
- Request cards: `bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6`
- Status badges: rounded-full `px-2.5 py-0.5 text-xs font-medium`
- Chat button: `px-3 py-1.5 rounded-md text-sm bg-blue-600`
- Rate button: `px-3 py-1.5 rounded-md text-sm bg-yellow-600`

### localStorage Keys

None.

### Hardcoded Data

- Priority options: `["low", "medium", "high", "critical"]`
- Status display mappings (pending/in-progress/resolved)

---

## 10. admin/Dashboard.jsx

**File:** `src/pages/admin/Dashboard.jsx`  
**Lines:** 1373  
**Purpose:** Admin dashboard with overview statistics, user management (engineers/technicians), monthly reports with export, and a full-featured chat system with emoji, image, voice, location, and link sharing.

### Imports

- React: `useState`, `useEffect`, `useRef`
- `react-router-dom`: `Link`, `useNavigate`
- `lucide-react`: `Menu`, `X`, `Users`, `Wrench`, `BarChart3`, `Bell`, `LogOut`, `MessageCircle`, `Send`, `Smile`, `Paperclip`, `Mic`, `Square`, `Trash2`, `Image`, `MapPin`, `Link2`, `Download`, `Printer`, `ChevronDown`, `Star`, `AlertTriangle`, `CheckCircle`, `Clock`, `RefreshCw`
- `@/lib/auth`: `loadCurrentUser`, `clearCurrentUser`, `normalizeMediaUrl`
- `@/lib/adminApi`: `adminApi`
- `@/lib/adminChatApi`: `adminChatApi`
- `@/components/ui/button`: `Button`
- `@/components/ui/popover`: `Popover`, `PopoverContent`, `PopoverTrigger`
- `@/components/ui/scroll-area`: `ScrollArea`
- `@/components/AdminProfile`: `default`
- `sonner`: `toast`

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `loading` | `true` | Initial data loading state |
| `activeTab` | `"overview"` | Active tab: "overview", "engineers", "technicians", "reports" |
| `overviewStats` | `null` | Overview statistics object |
| `engineers` | `[]` | List of engineer users |
| `technicians` | `[]` | List of technician users |
| `monthlyReport` | `null` | Monthly report data (overall) |
| `monthlyUserReport` | `null` | Per-user monthly report data |
| `selectedMonth` | `new Date().getMonth() + 1` | Selected report month (1-12) |
| `selectedYear` | `new Date().getFullYear()` | Selected report year |
| `reportScope` | `"overall"` | Report scope: "overall", "engineer", "technician" |
| `selectedReportUserId` | `""` | Selected user ID for per-user reports |
| `chatUser` | `null` | User object for active chat |
| `chatMessages` | `[]` | Messages in active chat |
| `chatInput` | `""` | Chat text input value |
| `chatLoading` | `false` | Chat messages loading state |
| `showEmojiPicker` | `false` | Emoji picker popover state |
| `showAttachMenu` | `false` | Attachment menu popover state |
| `isRecording` | `false` | Voice recording state |
| `recordingDuration` | `0` | Voice recording duration in seconds |
| `audioBlob` | `null` | Recorded audio blob |
| `unreadCounts` | `{}` | Object mapping userId → unread message count |

### Refs (useRef)

| Ref | Purpose |
|---|---|
| `mediaRecorderRef` | MediaRecorder instance for voice recording |
| `audioChunksRef` | Array accumulating audio data chunks |
| `recordingIntervalRef` | Interval ID for recording duration timer |
| `fileInputRef` | Hidden file input element for image upload |
| `messagesEndRef` | Scroll-to-bottom anchor in chat messages |

### Effects (useEffect)

1. **Access control + initial data fetch** — Dependencies: `[]`. Checks `loadCurrentUser()` for admin role; redirects non-admin to `/login`. Calls `adminApi.getOverviewStats()` to set `overviewStats`, `adminApi.getEngineers()` to set `engineers`, `adminApi.getTechnicians()` to set `technicians`. Sets `loading=false`.

2. **Fetch monthly report (overall)** — Dependencies: `[selectedMonth, selectedYear, reportScope]`. When `reportScope === "overall"`, calls `adminApi.getMonthlyReport(selectedMonth, selectedYear)`. Sets `monthlyReport`.

3. **Fetch monthly user report** — Dependencies: `[selectedReportUserId, selectedMonth, selectedYear, reportScope]`. When `reportScope !== "overall"` and `selectedReportUserId` is set, calls `adminApi.getMonthlyUserReport(selectedReportUserId, selectedMonth, selectedYear)`. Sets `monthlyUserReport`.

4. **Poll unread counts** — Dependencies: `[]`. Every **10000ms** (10 seconds), calls `adminChatApi.getConversations()`. Maps result array to `{[conv.userId]: conv.unreadCount}` object and sets `unreadCounts`. Cleanup clears interval.

5. **Chat message polling** — Dependencies: `[chatUser]`. When `chatUser` is set, immediately calls `adminChatApi.getMessages(chatUser._id)` to load initial messages. Then polls every **3000ms** (3 seconds). Cleanup clears interval.

6. **Scroll to bottom on new messages** — Dependencies: `[chatMessages]`. Scrolls `messagesEndRef.current` into view with `behavior: "smooth"`.

### Hardcoded Data

**`EMOJI_LIST`** — Array of 32 emojis:
```js
["😀","😂","😍","🤔","😎","😢","😡","👍","👎","❤️","🔥","⭐","🎉","💯","🙏","👋","✅","❌","⚠️","💡","📌","🔧","⏰","📊","🏗️","🚧","✨","💪","🤝","📱","💻","🌟"]
```

**`months`** — Array of month names:
```js
["January","February","March","April","May","June","July","August","September","October","November","December"]
```

### Sub-Components (defined in same file)

#### VoicePlayer
**Props:** `src`, `duration`, `isMe`

**State:** `isPlaying` (false), `progress` (0), `audioRef` (useRef)

Renders audio element with custom play/pause button, progress bar, and duration display. Progress updated via `timeupdate` event. Play/pause toggles via `audioRef.current.play()/pause()`. Progress bar: `h-1 flex-1 bg-neutral-600 rounded-full`. Fill: `bg-white` (for admin sent) or `bg-purple-400`.

#### MessageContent
**Props:** `message`

Renders message text with URL auto-linking. Regex: `/https?:\/\/[^\s]+/g`. URLs rendered as `<a>` tags with `text-blue-300 underline hover:text-blue-200` and `target="_blank" rel="noopener noreferrer"`.

#### StatsCard
**Props:** `icon`, `label`, `value`, `color`, `trend`

Card: `bg-neutral-900 border border-neutral-800 rounded-xl p-5`. Icon in colored `w-12 h-12 rounded-full` container. Value in `text-3xl font-bold`. Trend in `text-xs` (green for positive, red for negative).

#### UserCard
**Props:** `user`, `onChat`, `unreadCount`

Card: `bg-neutral-900 border border-neutral-800 rounded-xl p-4`. Avatar with photo or initial. Name, email, organization, joinedAt. "Chat" button with unread badge. Status badge: `bg-green-500/20 text-green-400` ("Active") vs `bg-red-500/20 text-red-400` ("Inactive").

### Functions

**`openChatWithUser(userId, userName, userRole, userPhotoUrl)`** — Async. Sets `chatUser` object, `chatLoading=true`. Calls `adminChatApi.startConversation(userId)`. Sets `chatLoading=false`.

**`handleSendMessage()`** — Async. Trims input, if empty returns. Clears input. Calls `adminChatApi.sendMessage(chatUser._id, text)`. Refreshes messages.

**`handleEmojiClick(emoji)`** — Appends emoji to `chatInput`. Closes emoji picker.

**`handleFileChange(e)`** — Async. Gets file from input. Validates size ≤ 5MB (5 * 1024 * 1024 bytes). Calls `adminChatApi.sendImage(chatUser._id, file)`. Refreshes messages. Resets file input.

**`handleImageUpload()`** — Triggers `fileInputRef.current.click()`. Closes attach menu.

**`handleShareLocation()`** — Uses `navigator.geolocation.getCurrentPosition()`. On success: sends message `📍 Location: https://maps.google.com/?q=${lat},${lng}` via `adminChatApi.sendMessage()`. On error: `toast.error("Could not get location")`. Closes attach menu.

**`handleShareLink()`** — Calls `window.prompt("Enter a URL to share:")`. If URL provided and truthy: sends message `🔗 ${url}`. Closes attach menu.

**`startRecording()`** — Async. Calls `navigator.mediaDevices.getUserMedia({audio:true})`. Creates `new MediaRecorder(stream, {mimeType:'audio/webm'})`. On dataavailable: pushes chunk to `audioChunksRef.current`. On stop: creates Blob from chunks, sets `audioBlob`. Starts recording. Sets `isRecording=true`. Starts duration interval every **1000ms**.

**`stopRecording()`** — Stops `mediaRecorderRef.current`. Clears duration interval. Sets `isRecording=false`.

**`cancelRecording()`** — Stops recorder if active. Clears interval. Sets `isRecording=false`, `recordingDuration=0`, `audioBlob=null`.

**`sendVoiceMessage()`** — Async. Calls `adminChatApi.sendVoice(chatUser._id, audioBlob, recordingDuration)`. Refreshes messages. Sets `audioBlob=null`, `recordingDuration=0`.

**`handleDeleteMessage(msgId)`** — Async. Calls `adminChatApi.deleteMessage(msgId)`. Removes message from `chatMessages` locally.

**`formatDuration(seconds)`** — Formats as `M:SS`. `Math.floor(seconds/60)` + ":" + `String(seconds%60).padStart(2,"0")`.

**`exportCSV()`** — Constructs CSV string from `monthlyReport` data. Creates Blob with `text/csv;charset=utf-8`. Creates download link with `URL.createObjectURL(blob)`. Filename: `report-${selectedMonth}-${selectedYear}.csv`. Auto-clicks and cleans up.

**`exportPDF()`** — Calls `window.print()`.

**`handleFetchReport()`** — Triggers report refetch by toggling selectedMonth (sets twice to force re-render).

### API Calls

| Method | Via | Parameters | Purpose |
|---|---|---|---|
| GET | `adminApi.getOverviewStats()` | — | Fetch dashboard overview stats |
| GET | `adminApi.getEngineers()` | — | Fetch all engineers |
| GET | `adminApi.getTechnicians()` | — | Fetch all technicians |
| GET | `adminApi.getMonthlyReport(month, year)` | month, year | Fetch overall monthly report |
| GET | `adminApi.getMonthlyUserReport(userId, month, year)` | userId, month, year | Fetch per-user monthly report |
| GET | `adminApi.getAlerts()` | — | Fetch all alerts (used in overview) |
| POST | `adminChatApi.startConversation(userId)` | userId | Init/resume chat conversation |
| GET | `adminChatApi.getMessages(userId)` | userId | Fetch chat messages |
| POST | `adminChatApi.sendMessage(userId, text)` | userId, text | Send text message |
| POST | `adminChatApi.sendImage(userId, file)` | userId, File | Send image message |
| POST | `adminChatApi.sendVoice(userId, blob, duration)` | userId, Blob, number | Send voice message |
| DELETE | `adminChatApi.deleteMessage(msgId)` | msgId | Delete a message |
| GET | `adminChatApi.getConversations()` | — | Fetch all conversations (for unread counts) |

### Polling Intervals

| Interval | Duration | Purpose |
|---|---|---|
| Unread counts | 10000ms (10s) | Poll conversation unread counts |
| Chat messages | 3000ms (3s) | Poll messages when chat is open |
| Recording duration | 1000ms (1s) | Increment recording timer display |

### Tabs/UI Sections

#### Overview Tab
- 6 `StatsCard` components: Total Engineers, Total Technicians, Active Alerts, Resolved Alerts, Total Users, Avg Rating
- Top Engineers section: List of engineers with ratings
- Top Technicians section: List of technicians with job counts

#### Engineers Tab
- Grid of `UserCard` components (one per engineer)
- "Chat" button on each card (with unread badge)

#### Technicians Tab
- Grid of `UserCard` components (one per technician)
- "Chat" button on each card (with unread badge)

#### Reports Tab
- Report scope selector: 3 buttons — "Overall" / "Per Engineer" / "Per Technician"
- When per-user selected: User dropdown populated from `engineers` or `technicians`
- Month selector: `<select>` with months array
- Year selector: `<select>` with range 2024-2026
- Export buttons: "CSV" (Download icon), "Print PDF" (Printer icon) — `print:hidden`
- Overall report: Summary stats (Total alerts, Completed, Success rate, Avg fix time) + Engineers table (name, alerts, resolved, rating) + Technicians table (name, alerts, resolved, rating)
- Per-user report: User stats (Total, Completed, Success Rate, Avg Fix Time) for engineers OR (Assigned, Completed, Success Rate, Avg Fix Time) for technicians + Alerts table (Subsystem, Issue, Priority, Status, Created, Accepted, Resolved)

### Chat Modal

- **Overlay:** `fixed inset-0 bg-black/50 z-50`
- **Container:** `bg-neutral-900 border border-neutral-700 rounded-t-xl sm:rounded-xl w-full sm:max-w-lg h-[85vh] sm:h-[600px] flex flex-col`
- **Header:** `bg-purple-600 rounded-t-xl`, avatar `w-10 h-10 rounded-full bg-white/20`, user name + role
- **Messages:** ScrollArea, admin messages right-aligned `bg-purple-600`, other messages `bg-neutral-800`
- **Message types:** text (with URL auto-linking), image (clickable to open in new tab), voice (VoicePlayer)
- **Delete button:** `absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500` — appears on hover (`opacity-0 group-hover:opacity-100`)
- **Voice preview:** Audio controls + trash + send buttons when `audioBlob` exists
- **Recording UI:** `bg-red-900/30`, pulsing red dot (`w-3 h-3 bg-red-500 rounded-full animate-pulse`), duration display, Cancel/Stop buttons
- **Input area:**
  - Emoji picker: Popover with 8-column grid of 32 emojis
  - Attachment menu: Popover with Photo (Image icon, `text-green-400`), Location (MapPin icon, `text-red-400`), Link (Link2 icon, `text-blue-400`)
  - Text input: `bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-purple-500`
  - Send/Mic toggle: Send (purple-600) when text exists, Mic (ghost) when empty

### Print Styles

```css
@media print {
  body { background: white !important; }
  header, .print\:hidden { display: none !important; }
  main { padding: 20px !important; }
  * { color: black !important; }
}
```

Print-specific classes used throughout: `print:bg-gray-100`, `print:border-gray-300`, `print:text-gray-600`, `print:bg-gray-200`, `print:text-blue-600`, `print:text-orange-600`, `print:hidden`

### CSS/Styling Details

- Page: `min-h-screen bg-black text-white`
- Header: `bg-neutral-900/50 border-b border-neutral-800`
- Active tab: `bg-purple-600 text-white` vs `text-neutral-400 hover:text-white`
- Logout: `bg-red-600 hover:bg-red-700`
- Stats cards: `bg-neutral-900 border border-neutral-800 rounded-xl p-5`
- Report tables: `w-full text-sm`, headers `border-b border-neutral-700`, rows `border-b border-neutral-800`
- Chat admin bubbles: `bg-purple-600 text-white`
- Chat other bubbles: `bg-neutral-800 text-white`
- Timestamp text: admin `text-purple-200`, other `text-neutral-500`
- Image file size limit: 5MB (5 * 1024 * 1024)
- Voice MIME type: `audio/webm`

### localStorage Keys

None (managed by auth lib).

### Hardcoded Data

- EMOJI_LIST (32 emojis)
- months array (12 months)
- Year range: 2024, 2025, 2026 (for report selectors)
- Image max size: 5MB

---

## 11. admin/AlertsList.jsx

**File:** `src/pages/admin/AlertsList.jsx`  
**Lines:** 324  
**Purpose:** Admin-only view displaying all repair alerts in the system with status-based filtering via URL search parameters.

### Imports

- React: `useState`, `useEffect`
- `react-router-dom`: `Link`, `useSearchParams`
- `lucide-react`: `AlertTriangle`, `Clock`, `CheckCircle`, `RefreshCw`, `LogOut`, `Star`, `Filter`, `ChevronDown`
- `@/lib/auth`: `loadCurrentUser`, `clearCurrentUser`
- `@/lib/adminApi`: `adminApi`

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `user` | `null` | Current user object |
| `alerts` | `[]` | All alerts from API |
| `loading` | `true` | Loading state |

**URL State (useSearchParams):**
- `statusFilter` — Read from URL param `"status"`, defaults to `"all"`. Controls which alerts are shown.

### Effects (useEffect)

1. **Load user + fetch alerts** — Dependencies: `[]`. Calls `loadCurrentUser()` → sets `user`. Calls `adminApi.getAlerts()` → sets `alerts` (sorted by `createdAt` descending). Sets `loading=false`.

### Sub-Components (defined in same file)

#### StatusBadge
**Props:** `status`

| Status | Background | Text Color | Icon |
|---|---|---|---|
| `"pending"` | `rgba(249,115,22,0.2)` | `rgb(249,115,22)` (orange) | Clock |
| `"in-progress"` | `rgba(59,130,246,0.2)` | `rgb(59,130,246)` (blue) | AlertTriangle |
| `"resolved"` | `rgba(34,197,94,0.2)` | `rgb(34,197,94)` (green) | CheckCircle |

Badge style: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize`

#### PriorityBadge
**Props:** `priority`

| Priority | Background | Text Color |
|---|---|---|
| `"low"` | `rgba(34,197,94,0.2)` | `rgb(34,197,94)` (green) |
| `"medium"` | `rgba(234,179,8,0.2)` | `rgb(234,179,8)` (yellow) |
| `"high"` | `rgba(249,115,22,0.2)` | `rgb(249,115,22)` (orange) |
| `"critical"` | `rgba(239,68,68,0.2)` | `rgb(239,68,68)` (red) |

Badge style: `px-2 py-0.5 rounded text-xs font-semibold uppercase`

#### AlertCard
**Props:** `alert`

Card: `bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors`

Displays:
- Top row: StatusBadge + PriorityBadge
- Subsystem: `text-lg font-semibold`
- Issue: `text-neutral-400 text-sm` (truncated to 100 chars with "...")
- Engineer: `text-blue-400 text-sm`
- Technician: `text-green-400 text-sm` (if assigned)
- Created date: `text-neutral-500 text-xs`
- Resolved date: `text-green-400 text-xs` (if resolved)
- Rating: Star icon `text-yellow-400` + numeric rating + comment in `text-neutral-500 italic` (if rated)

### Functions

**`filteredAlerts`** — Computed. If `statusFilter === "all"`, returns all alerts. Otherwise filters by `alert.status === statusFilter`.

### Filter Tabs

4 tabs with inline styles:

| Tab | Label | Filter Value |
|---|---|---|
| All | "All" | `"all"` |
| Pending | "Pending" | `"pending"` |
| In Progress | "In Progress" | `"in-progress"` |
| Resolved | "Resolved" | `"resolved"` |

Active tab styling: Dynamically computed based on tab type:
- All (active): `bg: rgba(255,255,255,0.1)`, `color: white`
- Pending (active): `bg: rgba(249,115,22,0.2)`, `color: rgb(249,115,22)`
- In Progress (active): `bg: rgba(59,130,246,0.2)`, `color: rgb(59,130,246)`
- Resolved (active): `bg: rgba(34,197,94,0.2)`, `color: rgb(34,197,94)`
- Inactive: `bg: transparent`, `color: rgb(163,163,163)`

Tab click: `setSearchParams({ status: value })` — updates URL.

### UI Sections

1. **Header** — Logo "Bored Tunnelers", "Admin — Alerts" subtitle, RefreshCw button (reloads page), Logout button (red-600).
2. **Title Row** — "Repair Alerts" heading, alert count in `text-neutral-400`.
3. **Filter Tabs** — Horizontal scrollable row of 4 filter buttons.
4. **Alerts Grid** — `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` of AlertCards.
5. **Loading State** — `RefreshCw` spinning icon, `text-orange-400`.
6. **Empty State** — `AlertTriangle` icon `w-16 h-16 text-neutral-700`, "No alerts found" heading, dynamic description based on filter.

### API Calls

| Method | Via | Purpose |
|---|---|---|
| GET | `adminApi.getAlerts()` | Fetch all system alerts |

### Polling Intervals

None.

### Modals/Dialogs

None.

### CSS/Styling Details

- Page: `min-h-screen bg-black text-white`
- Header: `bg-neutral-900/50 border-b border-neutral-800`
- Logo: `h-10 w-10 rounded-full bg-neutral-800`
- Filter tabs: `rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-pointer border-none`, inline styles for dynamic colors
- Alert grid: responsive `sm:grid-cols-2 lg:grid-cols-3`
- Alert cards: `bg-neutral-900 border border-neutral-800 rounded-xl p-5`
- Loading spinner: `w-8 h-8 animate-spin text-orange-400`
- Empty state icon: `w-16 h-16 text-neutral-700`

### localStorage Keys

None.

### Hardcoded Data

- Status color mappings (3 statuses with RGBA values)
- Priority color mappings (4 priorities with RGBA values)
- Filter tab definitions (4 tabs)

---

## 12. technician/TechnicianDashboard.jsx

**File:** `src/pages/technician/TechnicianDashboard.jsx`  
**Lines:** 687  
**Purpose:** Technician dashboard for accepting repair alerts, managing repair jobs, viewing component wear status, chatting with engineers, and communicating with admin.

### Imports

- React: `useState`, `useEffect`
- `react-router-dom`: `Link`
- `lucide-react`: `Menu`, `X`, `Bell`, `LogOut`, `MessageCircle`, `Loader2`, `AlertTriangle`, `CheckCircle`
- `sonner`: `toast`
- `@/lib/auth`: `loadCurrentUser`, `clearCurrentUser`
- `@/lib/repairAlertsApi`: `repairAlertsApi`, `chatApi`
- `@/components/ChatBox`: `default as ChatBox`
- `@/components/TechnicianProfile`: `default as TechnicianProfilePopover`
- `@/components/RatingModal`: `RatingDisplay`
- `@/components/AdminChatBox`: `default as UserAdminChat`

### Sub-Components (defined in same file)

#### AlertsPopover
**Props:** `alerts`, `onClear`, `onRemove`

Bell icon button with red badge. Dropdown list of alerts with remove functionality. Clear All button in header. Same pattern as engineer Dashboard AlertsPopover.

### State Variables (useState)

| Variable | Initial Value | Purpose |
|---|---|---|
| `activeTab` | `"repair-alerts"` | Active tab: "repair-alerts", "component-wear", "repair-jobs" |
| `isLoading` | `true` | Loading state for repair alerts |
| `isAccepting` | `null` | ID of alert currently being accepted (for loading indicator) |
| `mobileMenuOpen` | `false` | Mobile nav toggle |
| `activeChatAlert` | `null` | Alert object for active chat |
| `repairAlerts` | `[]` | Pending repair alerts |
| `repairJobs` | `[]` | In-progress + resolved repair jobs |
| `chatCounts` | `{}` | Object mapping alertId → message count |
| `lastSeenCounts` | `{}` | Object mapping alertId → last seen message count |

### Effects (useEffect)

1. **Fetch repair alerts** — Dependencies: `[]`. Calls `fetchRepairAlerts(true)` initially. Sets up `setInterval` at **5000ms** (5 seconds) to call `fetchRepairAlerts(false)`. Cleanup clears interval.

2. **Fetch chat counts** — Dependencies: `[]`. Every **8000ms** (8 seconds), iterates over `repairJobs` and calls `chatApi.getMessages(job.id)` for each. Sets `chatCounts` with `{[job.id]: messages.length}`. Cleanup clears interval.

### Functions

**`fetchRepairAlerts(showLoading)`** — Async. If `showLoading`, sets `isLoading=true`. Makes 3 parallel API calls:
```js
const [pendingData, inProgressData, resolvedData] = await Promise.all([
  repairAlertsApi.getAll('pending'),
  repairAlertsApi.getAll('in-progress'),
  repairAlertsApi.getAll('resolved'),
]);
```

Maps pending alerts → `repairAlerts` with `{id, subsystem, issue, priority, timestamp, engineerName}`.

Gets current user via `loadCurrentUser()`. Filters in-progress/resolved by `currentUser.email` (matching `alert.technician.email`). Maps to `repairJobs` with:
```js
{
  id, title: alert.issue, subsystem: alert.subsystem,
  priority: capitalize(alert.priority),
  status: alert.status === 'resolved' ? 'Done' : 'In Progress',
  statusColor: alert.status === 'resolved' ? 'bg-green-600' : 'bg-blue-600',
  repairType: 'Corrective', eta: '2–4 hours',
  engineerName, technicianName, rating, ratingComment
}
```

Finally sets `isLoading=false`.

**`formatTimestamp(dateStr)`** — Returns `new Date(dateStr).toLocaleString()`.

**`handleAccept(alertId)`** — Async. Sets `isAccepting=alertId`. Calls `repairAlertsApi.update(alertId, 'in-progress')`. Shows `toast.success("Alert accepted!", {description:"Moved to your repair jobs."})`. Refreshes alerts. Switches to "repair-jobs" tab. In finally block: `setIsAccepting(null)`.

**`handleMarkFixed(jobId)`** — Async. Calls `repairAlertsApi.update(jobId, 'resolved')`. Shows `toast.success("Job marked as fixed!", {description:"Great work!"})`. Refreshes alerts. On error: `toast.error()`.

**`handleClearAlertHistory()`** — Sets `repairAlerts` to `[]`.

**`handleRemoveAlert(id)`** — Filters `repairAlerts` removing the matching id.

**`getWearColor(usage)`** — Returns Tailwind class:
- `usage <= 30` → `"bg-green-500"`
- `usage <= 60` → `"bg-yellow-500"`
- else → `"bg-red-500"`

### Hardcoded Data

**`componentWear`** — Array of 5 component wear objects:
```js
[
  { component: "Cutter Blades", usage: 60 },
  { component: "Hydraulic Seals", usage: 50 },
  { component: "Drive Gearbox", usage: 76 },
  { component: "Slurry Pump", usage: 65 },
  { component: "Steering Platform", usage: 20 }
]
```

**Hardcoded job metadata:**
- `repairType`: Always `"Corrective"`
- `eta`: Always `"2–4 hours"`

### API Calls

| Method | Via | Parameters | Purpose |
|---|---|---|---|
| GET | `repairAlertsApi.getAll('pending')` | status='pending' | Fetch pending alerts |
| GET | `repairAlertsApi.getAll('in-progress')` | status='in-progress' | Fetch in-progress alerts |
| GET | `repairAlertsApi.getAll('resolved')` | status='resolved' | Fetch resolved alerts |
| PUT | `repairAlertsApi.update(alertId, 'in-progress')` | alertId, new status | Accept alert |
| PUT | `repairAlertsApi.update(jobId, 'resolved')` | jobId, new status | Mark job as fixed |
| GET | `chatApi.getMessages(jobId)` | alertId | Get message count for unread badge |

### Polling Intervals

| Interval | Duration | Purpose |
|---|---|---|
| Repair alerts fetch | 5000ms (5s) | Refresh pending/active/resolved alerts |
| Chat counts fetch | 8000ms (8s) | Check for new messages per job |

### Tabs/UI Sections

#### Header
- Logo: `/assets/mtbm/logo.png` in `h-8 w-8 sm:h-10 sm:w-10 rounded-full`
- Brand: "Bored Tunnelers" `text-base sm:text-lg font-bold`
- Subtitle: "Technician Dashboard" `text-xs text-neutral-400 hidden sm:block`
- Desktop nav: 3 tab buttons + AlertsPopover + TechnicianProfilePopover + Logout
- Mobile nav: Bell button + hamburger → dropdown with 3 tabs + profile + logout

#### Repair Alerts Tab (`activeTab === "repair-alerts"`)
- Title: "Active Repair Alerts" with red circle icon `bg-red-500 w-6 h-6`
- Loading state: `Loader2` spinning `text-blue-500` + "Loading alerts..."
- Empty state: `Bell` icon `h-12 w-12 opacity-50`, "No pending repair alerts", "New alerts from engineers will appear here"
- Alert cards: `bg-neutral-700 px-4 sm:px-6 py-4 rounded-lg`
  - Subsystem name bold
  - Priority badge: high/critical → `bg-red-500`, else → `bg-yellow-500`
  - Issue text + timestamp
  - Engineer name: `text-xs text-blue-400`
  - "Accept" button: `bg-green-500 hover:bg-green-600 px-6 py-2` with Loader2 when accepting

#### Component Wear Tab (`activeTab === "component-wear"`)
- Title: "Component Wear Status" with blue circle icon `bg-blue-500 w-6 h-6`
- 5 progress bars, one per `componentWear` item
  - Label + usage percentage in `bg-neutral-600 px-3 py-1 rounded-md`
  - Bar: `h-8 w-full rounded-md bg-neutral-700`
  - Fill: `getWearColor(usage)` + `transition-all duration-300`, width = `${usage}%`
  - Remaining: `bg-neutral-600`

#### Repair Jobs Tab (`activeTab === "repair-jobs"`)
- Title: "Repair Job Log" with 🔧 emoji
- Empty state: 🔧 emoji `text-4xl`, "No repair jobs yet", "Accept alerts to see them here"
- Job cards: `bg-gradient-to-r from-neutral-600 to-neutral-700 p-6 border-l-4 border-blue-500 rounded-lg`
  - Header: `Job #{job.id.slice(-6)} — {job.title}`, engineer name `text-blue-400`
  - Status button: `rounded-md ${job.statusColor} px-6 py-2 font-semibold text-white`
  - Details grid (2 columns): Subsystem, Priority, Repair Type, ETA, Rating (RatingDisplay)
  - Actions:
    - "Chat with Engineer" button: `bg-blue-600 hover:bg-blue-700` with MessageCircle icon + unread badge (`bg-red-500 rounded-full`, max display "99+")
    - "Mark Fixed" button: `bg-green-600 hover:bg-green-700` or `bg-neutral-800 cursor-not-allowed opacity-60` if done. ✓ icon.

#### Floating Components
- **ChatBox** — Rendered when `activeChatAlert` is set. Props: `alertId={activeChatAlert.id}`, `alertInfo={activeChatAlert.info}`, `onClose`.
- **UserAdminChat** — Always rendered at bottom. Admin chat widget component.

### Modals/Dialogs

**ChatBox modal** — External component, rendered conditionally.

### CSS/Styling Details

- Page: `min-h-screen w-full bg-black text-white`
- Header: `border-b border-neutral-800 bg-neutral-900/50`
- Active nav tab: `bg-blue-600 text-white`
- Inactive tab: `text-neutral-400 hover:text-white`
- Mobile dropdown: `bg-neutral-900/95 border-t border-neutral-800`
- Logout (desktop): `bg-red-600 hover:bg-red-700`
- Logout (mobile): `text-red-400 hover:text-red-300`
- Alert cards: `bg-neutral-700 rounded-lg`
- Accept button: `bg-green-500 hover:bg-green-600`
- Job cards: `bg-gradient-to-r from-neutral-600 to-neutral-700 rounded-lg border-l-4 border-blue-500`
- Wear bar fill colors: green-500 (≤30%), yellow-500 (≤60%), red-500 (>60%)
- Unread badge: `bg-red-500 text-xs rounded-full h-5 min-w-[20px]`

### localStorage Keys

None (auth managed by auth lib).

---

## Summary Cross-Reference

### All API Endpoints Used Across Pages

| Endpoint | Method | Used In |
|---|---|---|
| `${API_BASE_URL}/api/meetings` | POST | Landing |
| `${API_BASE_URL}/api/otp/send-otp` | POST | Signup |
| `${API_BASE_URL}/api/otp/verify-otp` | POST | Signup |
| `${API_BASE_URL}/api/auth/forgot-password` | POST | ForgotPassword |
| `${API_BASE_URL}/api/auth/verify-reset-otp` | POST | ForgotPassword |
| `${API_BASE_URL}/api/auth/reset-password` | POST | ForgotPassword |
| `${API_BASE_URL}/api/logbook` | GET, POST | LogBook |
| `repairAlertsApi.getMyAlerts()` | GET | engineer/Dashboard, CallTechnician |
| `repairAlertsApi.getAll(status)` | GET | TechnicianDashboard |
| `repairAlertsApi.create(data)` | POST | CallTechnician |
| `repairAlertsApi.update(id, status)` | PUT | TechnicianDashboard |
| `chatApi.getUnreadCount()` | GET | engineer/Dashboard |
| `chatApi.getMessages(alertId)` | GET | TechnicianDashboard |
| `adminApi.getOverviewStats()` | GET | admin/Dashboard |
| `adminApi.getEngineers()` | GET | admin/Dashboard |
| `adminApi.getTechnicians()` | GET | admin/Dashboard |
| `adminApi.getMonthlyReport(m,y)` | GET | admin/Dashboard |
| `adminApi.getMonthlyUserReport(uid,m,y)` | GET | admin/Dashboard |
| `adminApi.getAlerts()` | GET | admin/Dashboard, AlertsList |
| `adminChatApi.startConversation(uid)` | POST | admin/Dashboard |
| `adminChatApi.getMessages(uid)` | GET | admin/Dashboard |
| `adminChatApi.sendMessage(uid, text)` | POST | admin/Dashboard |
| `adminChatApi.sendImage(uid, file)` | POST | admin/Dashboard |
| `adminChatApi.sendVoice(uid, blob, dur)` | POST | admin/Dashboard |
| `adminChatApi.deleteMessage(msgId)` | DELETE | admin/Dashboard |
| `adminChatApi.getConversations()` | GET | admin/Dashboard |
| `adminChatApi.getUnreadCount()` | GET | engineer/Dashboard |

### All Polling Intervals

| Page | Interval | Purpose |
|---|---|---|
| engineer/Dashboard | 1000ms | Sensor fluctuation |
| engineer/Dashboard | 5000ms | Unread message count |
| engineer/Dashboard | 10000ms | Active repair requests |
| engineer/Navigation | 1000ms | IMU data simulation |
| engineer/Sensors | 2000ms | Sensor data update |
| engineer/CallTechnician | 10000ms | My requests refresh |
| admin/Dashboard | 3000ms | Chat messages (when open) |
| admin/Dashboard | 10000ms | Unread conversation counts |
| admin/Dashboard | 1000ms | Recording duration timer |
| technician/TechnicianDashboard | 5000ms | Repair alerts fetch |
| technician/TechnicianDashboard | 8000ms | Chat message counts |

### All localStorage Keys

| Key | Page | Purpose |
|---|---|---|
| `mtbm_alert_seen` | engineer/Dashboard | Tracks last seen alert count |

### Recurring Brand Color: `#5B89B1`

Used in: Landing (tabs, buttons, chatbot), Signup (buttons), ForgotPassword (buttons, OTP focus ring), engineer/Dashboard (loading bar), engineer/LogBook (buttons, pagination, date picker), engineer/CallTechnician (buttons), engineer/Navigation (fault step numbers)
