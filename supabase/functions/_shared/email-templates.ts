// Henrietta Email Templates
// Location: supabase/functions/_shared/email-templates.ts

// ============================================
// STYLES
// ============================================

const styles = {
  body: 'background-color: #FAFAFA; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0;',
  container: 'max-width: 540px; margin: 0 auto; padding: 40px 24px;',
  greeting: 'color: #111111; font-size: 15px; line-height: 26px; margin: 0 0 24px;',
  greetingTight: 'color: #111111; font-size: 15px; line-height: 26px; margin: 0 0 8px;',
  paragraph: 'color: #111111; font-size: 15px; line-height: 26px; margin: 0 0 16px;',
  mutedParagraph: 'color: #555555; font-size: 14px; line-height: 24px; margin: 0 0 16px;',
  heroText: 'color: #111111; font-size: 22px; font-weight: 500; line-height: 32px; margin: 0 0 32px; letter-spacing: -0.3px;',
  urgentText: 'color: #111111; font-size: 18px; font-weight: 500; line-height: 28px; margin: 0 0 24px;',
  button: 'display: inline-block; background-color: #7B85B8; color: #ffffff; padding: 14px 24px; border-radius: 4px; font-weight: 500; font-size: 15px; text-decoration: none; text-align: center;',
  buttonSection: 'margin: 32px 0;',
  signature: 'color: #111111; font-size: 15px; line-height: 26px; margin: 32px 0 0;',
  footerSection: 'margin-top: 40px;',
  footerText: 'color: #888888; font-size: 13px; line-height: 22px; margin: 0 0 8px;',
  footerLink: 'color: #7B85B8; text-decoration: underline;',
  divider: 'border: none; border-top: 1px solid #E5E5E5; margin: 40px 0 24px;',
  tagline: 'color: #888888; font-size: 13px; line-height: 20px; margin: 0;',
};

// ============================================
// EMAIL 1: VERIFICATION
// Subject: An invitation to something different
// Tagline: Yours. Actually.
// ============================================

export function getVerificationEmailHtml(
  firstName: string | null,
  verifyUrl: string,
  unsubscribeUrl: string
): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="${styles.body}">
  <div style="${styles.container}">
    <p style="${styles.greeting}">${greeting}</p>
    <p style="${styles.paragraph}">You asked to be part of what we are building.</p>
    <p style="${styles.paragraph}">We do not take that lightly.</p>
    <div style="${styles.buttonSection}">
      <a href="${verifyUrl}" style="${styles.button}">Verify my email</a>
    </div>
    <p style="${styles.signature}">Henrietta</p>
    <div style="${styles.footerSection}">
      <p style="${styles.footerText}">If this ever stops feeling relevant, you can <a href="${unsubscribeUrl}" style="${styles.footerLink}">step out here</a>.</p>
    </div>
    <hr style="${styles.divider}">
    <p style="${styles.tagline}">Henrietta — Yours. Actually.</p>
  </div>
</body>
</html>`;
}

export function getVerificationEmailText(
  firstName: string | null,
  verifyUrl: string,
  unsubscribeUrl: string
): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return `${greeting}

You asked to be part of what we are building.

We do not take that lightly.

Verify your email: ${verifyUrl}

Henrietta

---

If this ever stops feeling relevant, you can step out here: ${unsubscribeUrl}

Henrietta — Yours. Actually.`;
}

// ============================================
// EMAIL 2: WELCOME
// Subject: You are in
// Tagline: Asking first, this time.
// ============================================

export function getWelcomeEmailHtml(
  firstName: string | null,
  unsubscribeUrl: string
): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="${styles.body}">
  <div style="${styles.container}">
    <p style="${styles.greetingTight}">${greeting}</p>
    <p style="${styles.heroText}">You are in.</p>
    <p style="${styles.paragraph}">Your email is verified and you are now part of the Henrietta registry.</p>
    <p style="${styles.paragraph}">We will reach out only when something real happens. A pilot, a finding, or a chance to help shape what we are building.</p>
    <p style="${styles.mutedParagraph}">Until then, we are heads down working.</p>
    <p style="${styles.signature}">Henrietta</p>
    <div style="${styles.footerSection}">
      <p style="${styles.footerText}">If this ever stops feeling relevant, you can <a href="${unsubscribeUrl}" style="${styles.footerLink}">step out here</a>.</p>
      <p style="${styles.footerText}">If you want us to delete everything we have about you, just reply and ask.</p>
    </div>
    <hr style="${styles.divider}">
    <p style="${styles.tagline}">Henrietta — Asking first, this time.</p>
  </div>
</body>
</html>`;
}

export function getWelcomeEmailText(
  firstName: string | null,
  unsubscribeUrl: string
): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return `${greeting}

You are in.

Your email is verified and you are now part of the Henrietta registry.

We will reach out only when something real happens. A pilot, a finding, or a chance to help shape what we are building.

Until then, we are heads down working.

Henrietta

---

If this ever stops feeling relevant, you can step out here: ${unsubscribeUrl}

If you want us to delete everything we have about you, just reply and ask.

Henrietta — Asking first, this time.`;
}

// ============================================
// EMAIL 3: 24-HOUR REMINDER
// Subject: Quick reminder
// Tagline: Built to leave with you.
// ============================================

export function getReminder24hEmailHtml(
  verifyUrl: string,
  unsubscribeUrl: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="${styles.body}">
  <div style="${styles.container}">
    <p style="${styles.greeting}">Hi,</p>
    <p style="${styles.paragraph}">You started joining the Henrietta registry yesterday but did not finish verifying your email.</p>
    <p style="${styles.paragraph}">If you still want in, just click below:</p>
    <div style="${styles.buttonSection}">
      <a href="${verifyUrl}" style="${styles.button}">Verify my email</a>
    </div>
    <p style="${styles.mutedParagraph}">If not, no action needed. We will remove your information automatically.</p>
    <p style="${styles.signature}">Henrietta</p>
    <div style="${styles.footerSection}">
      <p style="${styles.footerText}">If this ever stops feeling relevant, you can <a href="${unsubscribeUrl}" style="${styles.footerLink}">step out here</a>.</p>
    </div>
    <hr style="${styles.divider}">
    <p style="${styles.tagline}">Henrietta — Built to leave with you.</p>
  </div>
</body>
</html>`;
}

export function getReminder24hEmailText(
  verifyUrl: string,
  unsubscribeUrl: string
): string {
  return `Hi,

You started joining the Henrietta registry yesterday but did not finish verifying your email.

If you still want in, just click below:

${verifyUrl}

If not, no action needed. We will remove your information automatically.

Henrietta

---

If this ever stops feeling relevant, you can step out here: ${unsubscribeUrl}

Henrietta — Built to leave with you.`;
}

// ============================================
// EMAIL 4: 72-HOUR REMINDER
// Subject: Still interested?
// Tagline: Built to leave with you.
// ============================================

export function getReminder72hEmailHtml(
  verifyUrl: string,
  unsubscribeUrl: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="${styles.body}">
  <div style="${styles.container}">
    <p style="${styles.greeting}">Hi,</p>
    <p style="${styles.paragraph}">This is our last reminder about your Henrietta signup.</p>
    <p style="${styles.paragraph}">If you want to be part of what we are building, a patient owned health data registry, you can verify here:</p>
    <div style="${styles.buttonSection}">
      <a href="${verifyUrl}" style="${styles.button}">Verify my email</a>
    </div>
    <p style="${styles.mutedParagraph}">Otherwise, your signup will expire and we will delete your information.</p>
    <p style="${styles.signature}">Henrietta</p>
    <div style="${styles.footerSection}">
      <p style="${styles.footerText}">If this ever stops feeling relevant, you can <a href="${unsubscribeUrl}" style="${styles.footerLink}">step out here</a>.</p>
    </div>
    <hr style="${styles.divider}">
    <p style="${styles.tagline}">Henrietta — Built to leave with you.</p>
  </div>
</body>
</html>`;
}

export function getReminder72hEmailText(
  verifyUrl: string,
  unsubscribeUrl: string
): string {
  return `Hi,

This is our last reminder about your Henrietta signup.

If you want to be part of what we are building, a patient owned health data registry, you can verify here:

${verifyUrl}

Otherwise, your signup will expire and we will delete your information.

Henrietta

---

If this ever stops feeling relevant, you can step out here: ${unsubscribeUrl}

Henrietta — Built to leave with you.`;
}

// ============================================
// EMAIL 5: FINAL REMINDER
// Subject: Your signup expires tomorrow
// Tagline: Yours. Actually.
// ============================================

export function getReminderFinalEmailHtml(
  verifyUrl: string,
  unsubscribeUrl: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="${styles.body}">
  <div style="${styles.container}">
    <p style="${styles.greetingTight}">Hi,</p>
    <p style="${styles.urgentText}">Your signup expires tomorrow.</p>
    <p style="${styles.paragraph}">If you still want to join, verify here:</p>
    <div style="${styles.buttonSection}">
      <a href="${verifyUrl}" style="${styles.button}">Verify before it expires</a>
    </div>
    <p style="${styles.mutedParagraph}">If not, we will delete your information and you will not hear from us again.</p>
    <p style="${styles.signature}">Henrietta</p>
    <div style="${styles.footerSection}">
      <p style="${styles.footerText}">If this ever stops feeling relevant, you can <a href="${unsubscribeUrl}" style="${styles.footerLink}">step out here</a>.</p>
    </div>
    <hr style="${styles.divider}">
    <p style="${styles.tagline}">Henrietta — Yours. Actually.</p>
  </div>
</body>
</html>`;
}

export function getReminderFinalEmailText(
  verifyUrl: string,
  unsubscribeUrl: string
): string {
  return `Hi,

Your signup expires tomorrow.

If you still want to join, verify here:

${verifyUrl}

If not, we will delete your information and you will not hear from us again.

Henrietta

---

If this ever stops feeling relevant, you can step out here: ${unsubscribeUrl}

Henrietta — Yours. Actually.`;
}
