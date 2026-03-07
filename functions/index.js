import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

initializeApp();
const db = getFirestore();

// ---------- SMTP config (set via firebase functions:secrets:set or env) ----------
const SMTP_HOST = defineString('SMTP_HOST', { default: 'smtp.zoho.com' });
const SMTP_PORT = defineString('SMTP_PORT', { default: '465' });
const SMTP_USER = defineString('SMTP_USER');
const SMTP_PASS = defineString('SMTP_PASS');
const SMTP_FROM = defineString('SMTP_FROM', { default: '' });
const APP_URL = defineString('APP_URL', { default: 'https://emg-portal.web.app' });

function createTransport() {
    return nodemailer.createTransport({
        host: SMTP_HOST.value(),
        port: parseInt(SMTP_PORT.value(), 10),
        secure: parseInt(SMTP_PORT.value(), 10) === 465,
        auth: {
            user: SMTP_USER.value(),
            pass: SMTP_PASS.value(),
        },
    });
}

function fromAddress() {
    return SMTP_FROM.value() || SMTP_USER.value();
}

// ---------- Notification type → email subject/body ----------
const NOTIFICATION_TEMPLATES = {
    update: {
        subject: (p) => `New update on ${p}`,
        body: (msg, link) => `A new progress update has been posted:\n\n${msg}\n\nView it here: ${link}`,
    },
    photo_upload: {
        subject: (p) => `New photos uploaded — ${p}`,
        body: (msg, link) => `New site photos have been uploaded:\n\n${msg}\n\nView them here: ${link}`,
    },
    document_upload: {
        subject: (p) => `New document added — ${p}`,
        body: (msg, link) => `A new document has been added:\n\n${msg}\n\nView it here: ${link}`,
    },
    action_assigned: {
        subject: (p) => `New action item — ${p}`,
        body: (msg, link) => `A new action item has been created:\n\n${msg}\n\nView it here: ${link}`,
    },
    qa_question: {
        subject: (p) => `New question posted — ${p}`,
        body: (msg, link) => `A new question has been posted:\n\n${msg}\n\nView it here: ${link}`,
    },
    qa_answer: {
        subject: (p) => `Question answered — ${p}`,
        body: (msg, link) => `A question has been answered:\n\n${msg}\n\nView it here: ${link}`,
    },
};

// ==========================================================================
// 1. Send email when a notification is created for a user
// ==========================================================================
export const sendNotificationEmail = onDocumentCreated(
    'users/{userId}/notifications/{notificationId}',
    async (event) => {
        const snap = event.data;
        if (!snap) return;

        const notification = snap.data();
        const userId = event.params.userId;

        try {
            // Fetch user doc to check email prefs
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) return;

            const userData = userDoc.data();
            const email = userData.email;
            if (!email) return;

            // Check notification preferences
            const prefs = userData.notificationPrefs || {};
            if (prefs.emailEnabled === false) return;

            const notifType = notification.type || 'update';
            if (prefs.types && prefs.types[notifType] === false) return;

            // Build email content
            const template = NOTIFICATION_TEMPLATES[notifType] || NOTIFICATION_TEMPLATES.update;
            const projectName = notification.projectName || 'your project';
            const link = notification.link
                ? `${APP_URL.value()}${notification.link}`
                : APP_URL.value();

            const subject = template.subject(projectName);
            const text = template.body(notification.message || '', link);

            const html = buildHtmlEmail({
                preheader: notification.message || '',
                heading: subject,
                body: `<p>${(notification.message || '').replace(/\n/g, '<br>')}</p>`,
                ctaText: 'View in Portal',
                ctaUrl: link,
                projectName,
            });

            const transporter = createTransport();
            await transporter.sendMail({
                from: `"EMG Portal" <${fromAddress()}>`,
                to: email,
                subject,
                text,
                html,
            });

            console.log(`Notification email sent to ${email} for ${notifType}`);
        } catch (err) {
            console.error(`Failed to send notification email to user ${userId}:`, err);
        }
    }
);

// ==========================================================================
// 2. Send invite email when a pending_invite is created
// ==========================================================================
export const sendInviteEmail = onDocumentCreated(
    'pending_invites/{inviteId}',
    async (event) => {
        const snap = event.data;
        if (!snap) return;

        const invite = snap.data();
        const email = invite.email;
        if (!email) return;

        try {
            const projectNames = (invite.projects || []).join(', ') || 'the portal';
            const signUpUrl = `${APP_URL.value()}/login`;

            const subject = `You've been invited to EMG Project Portal`;
            const text = [
                `Hello,`,
                ``,
                `You've been invited to join the EMG Project Portal by ${invite.invitedBy || 'an administrator'}.`,
                ``,
                `Projects: ${projectNames}`,
                `Role: ${invite.globalRole || 'user'}`,
                ``,
                `Sign up here: ${signUpUrl}`,
                ``,
                `Use this email address (${email}) when creating your account so your access is automatically configured.`,
                ``,
                `— EMG Project Portal`,
            ].join('\n');

            const html = buildHtmlEmail({
                preheader: `You've been invited to EMG Project Portal`,
                heading: `You're Invited!`,
                body: `
                    <p>Hello,</p>
                    <p>You've been invited to join the <strong>EMG Project Portal</strong> by ${invite.invitedBy || 'an administrator'}.</p>
                    <p><strong>Projects:</strong> ${projectNames}<br>
                    <strong>Role:</strong> ${invite.globalRole || 'user'}</p>
                    <p>Use this email address (<strong>${email}</strong>) when creating your account so your access is automatically configured.</p>
                `,
                ctaText: 'Sign Up Now',
                ctaUrl: signUpUrl,
                projectName: 'EMG Portal',
            });

            const transporter = createTransport();
            await transporter.sendMail({
                from: `"EMG Portal" <${fromAddress()}>`,
                to: email,
                subject,
                text,
                html,
            });

            // Mark invite as email_sent
            await snap.ref.update({ emailSent: true, emailSentAt: new Date() });

            console.log(`Invite email sent to ${email}`);
        } catch (err) {
            console.error(`Failed to send invite email to ${email}:`, err);
        }
    }
);

// ==========================================================================
// Branded HTML email template
// ==========================================================================
function buildHtmlEmail({ preheader, heading, body, ctaText, ctaUrl, projectName }) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${heading}</title>
<style>
  body { margin:0; padding:0; background:#f4f5f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
  .container { max-width:560px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb; }
  .header { background:#1e293b; padding:24px 32px; }
  .header h1 { margin:0; color:#ffffff; font-size:18px; font-weight:600; }
  .body { padding:32px; color:#374151; font-size:14px; line-height:1.6; }
  .body h2 { margin:0 0 16px; color:#1e293b; font-size:20px; }
  .cta { display:inline-block; margin:24px 0 8px; padding:12px 28px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; }
  .footer { padding:20px 32px; background:#f9fafb; border-top:1px solid #e5e7eb; text-align:center; color:#9ca3af; font-size:12px; }
  .preheader { display:none; max-height:0; overflow:hidden; }
</style>
</head>
<body>
<span class="preheader">${preheader}</span>
<div class="container">
  <div class="header"><h1>EMG Project Portal</h1></div>
  <div class="body">
    <h2>${heading}</h2>
    ${body}
    ${ctaText ? `<a href="${ctaUrl}" class="cta">${ctaText}</a>` : ''}
    <p style="margin-top:24px; color:#6b7280; font-size:13px;">Project: ${projectName}</p>
  </div>
  <div class="footer">
    <p>EMG Project Portal &middot; Sent automatically</p>
    <p>You can manage your notification preferences in your account settings.</p>
  </div>
</div>
</body>
</html>`;
}
