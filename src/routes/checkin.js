import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { sendMail } from '../email.js';
import { clampGuests, isValidDateStr, sanitize } from '../utils/validation.js';

const router = Router();

router.post('/', upload.any(), async (req, res) => {
  try {
    // Estrazione campi testo
    const guestsCount = clampGuests(req.body.guests);
    const checkin_date = req.body.checkin_date || '';
    const checkout_date = req.body.checkout_date || '';

    if (!isValidDateStr(checkin_date) || !isValidDateStr(checkout_date)) {
      return res.status(400).json({ error: 'Date non valide' });
    }

    // Estrazione ospiti
    const guests = [];
    for (let i = 1; i <= guestsCount; i++) {
      guests.push({
        firstname: sanitize(req.body[`guest_${i}_firstname`]),
        lastname: sanitize(req.body[`guest_${i}_lastname`])
      });
    }

    // Allegati: req.files è array di tutti i file (upload.any())
    const files = Array.isArray(req.files) ? req.files : [];
    const attachments = files.map(f => ({
      filename: f.originalname,
      content: f.buffer,
      contentType: f.mimetype
    }));

    // Corpo email
    const subject = `Check-in — ${new Date().toISOString().slice(0,10)} — Ospiti: ${guestsCount}`;

    const lines = [];
    lines.push(`Check-in`);
    lines.push(`Ospiti: ${guestsCount}`);
    lines.push(`Check-in: ${checkin_date}`);
    lines.push(`Check-out: ${checkout_date}`);
    lines.push('');
    lines.push('Dettaglio ospiti:');
    guests.forEach((g, i) => lines.push(`  ${i+1}. ${g.firstname} ${g.lastname}`));

    const text = lines.join('\n');

    const html = `
      <h2>Check-in</h2>
      <p><strong>Ospiti:</strong> ${guestsCount}</p>
      <p><strong>Check-in:</strong> ${checkin_date}<br/>
      <strong>Check-out:</strong> ${checkout_date}</p>
      <h3>Dettaglio ospiti</h3>
      <ol>
        ${guests.map(g => `<li>${g.firstname} ${g.lastname}</li>`).join('')}
      </ol>
      <p>In allegato i documenti inviati dal cliente.</p>
    `;

    const info = await sendMail({ subject, text, html, attachments });

    return res.json({ ok: true, messageId: info.messageId, accepted: info.accepted });
  } catch (err) {
    // Log dettagliato lato server
    console.error('checkin error', {
      message: err?.message,
      name: err?.name,
      code: err?.code,
      response: err?.response,
      responseCode: err?.responseCode,
      command: err?.command
    });
    const isDev = (process.env.NODE_ENV !== 'production');
    const safeMsg = err?.message || 'Errore interno';
    const detail = (err?.code || err?.responseCode || err?.command || '').toString();
    const payload = isDev ? { error: `Invio email fallito: ${safeMsg}`, detail } : { error: 'Errore interno durante l\'invio dell\'email' };
    return res.status(500).json(payload);
  }
});

export default router;
