# LDCU Guidance Office Booking Portal — Login Page

Angular 17 standalone component replication of the login screen.

## Project Structure

```
ldcu-login/
├── src/
│   ├── app/
│   │   ├── app.component.html   ← Login page template
│   │   ├── app.component.ts     ← Component logic
│   │   └── app.component.css    ← All styles
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
ng serve

# 3. Open browser at
http://localhost:4200
```

## Features

- ✅ Two-column layout (image panel + form panel)
- ✅ Blue gradient overlay on left panel
- ✅ Email/Student ID input
- ✅ Password input with show/hide toggle
- ✅ Remember Me checkbox
- ✅ Forgot password link
- ✅ Sign In button
- ✅ Register link
- ✅ Responsive (stacks vertically on mobile)
- ✅ Angular 17 standalone component with FormsModule (ngModel)
