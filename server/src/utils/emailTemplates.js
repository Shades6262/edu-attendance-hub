const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const layout = (title, name, body, buttonText, link) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
    <h2 style="color:#15803d;margin:0 0 16px">EduHub</h2>
    <h3 style="margin:0 0 12px">${title}</h3>
    <p>Hi ${escapeHtml(name)},</p>
    <p>${body}</p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">${buttonText}</a>
    </p>
    <p style="font-size:12px;color:#6b7280">If the button doesn't work, copy this link into your browser:<br>${link}</p>
    <p style="font-size:12px;color:#6b7280">If you didn't request this, you can ignore this email.</p>
  </div>`;

const verifyEmailTemplate = (name, link) =>
  layout('Verify your email', name, 'Confirm your email address to finish setting up your account. This link expires in 24 hours.', 'Verify email', link);

const resetPasswordTemplate = (name, link) =>
  layout('Reset your password', name, 'We received a request to reset your password. This link expires in 1 hour.', 'Reset password', link);

module.exports = { verifyEmailTemplate, resetPasswordTemplate };