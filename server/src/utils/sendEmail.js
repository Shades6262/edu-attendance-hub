const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error('Email is not configured');
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: process.env.EMAIL_FROM_NAME || 'EduHub', email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    console.error('Brevo error:', res.status, await res.text());
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;