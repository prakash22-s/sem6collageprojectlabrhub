const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

function getAuthHeader() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  const basic = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  return `Basic ${basic}`;
}

export async function sendSMSAlert(to, body) {
  const from = process.env.TWILIO_FROM_PHONE;
  const auth = getAuthHeader();
  const accountSid = process.env.TWILIO_ACCOUNT_SID;

  if (!to || !body) return;
  if (!from || !auth || !accountSid) {
    console.log(`[Alert:SMS][dry-run] to=${to} body="${body}"`);
    return;
  }

  const params = new URLSearchParams();
  params.set('To', to);
  params.set('From', from);
  params.set('Body', body);

  await fetch(`${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
}

export async function sendVoiceAlert(to, message) {
  const from = process.env.TWILIO_FROM_PHONE;
  const auth = getAuthHeader();
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const twimlUrl = process.env.TWILIO_VOICE_TWIML_URL;

  if (!to || !message) return;
  if (!from || !auth || !accountSid || !twimlUrl) {
    console.log(`[Alert:VOICE][dry-run] to=${to} message="${message}"`);
    return;
  }

  const params = new URLSearchParams();
  params.set('To', to);
  params.set('From', from);
  params.set('Url', twimlUrl);

  await fetch(`${TWILIO_API_BASE}/Accounts/${accountSid}/Calls.json`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
}
