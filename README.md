# Hotel Booking Backend (Node.js)

Backend minimale per ricevere form multipart e inviare email con allegati tramite SMTP usando Nodemailer. Pensato per integrarsi con il sito statico `hotel-booking-site`.

## Requisiti
- Node.js 18+
- Credenziali SMTP (consigliato: Gmail con App Password o SMTP del provider del dominio)

## Setup
1. Clona/crea questa cartella e installa dipendenze:
   ```bash
   npm install
   ```
2. Crea un file `.env` partendo da `.env.example` e compila i valori:
   ```ini
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=tuoaccount@gmail.com
   SMTP_PASS=app_password
   MAIL_FROM="Casa Vacanze Antico Cortile <tuoaccount@gmail.com>"
   MAIL_TO=info@antico-cortile.com
   PORT=8080
   CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,file://
   MAX_FILE_SIZE_MB=15
   ALLOWED_MIME=image/jpeg,image/png,application/pdf
   MAX_FILES=20
   ```
3. Avvia in locale:
   ```bash
   npm start
   # Server su http://localhost:8080
   ```

## API
POST /api/checkin
- Content-Type: multipart/form-data
- Campi supportati
  - guests (numero)
  - checkin_date (YYYY-MM-DD)
  - checkout_date (YYYY-MM-DD)
  - guest_X_firstname / guest_X_lastname (per ogni ospite, X parte da 1)
  - File: 
    - guest_X_id (uno per ospite)
    - additional_documents (multipli)

Risposta
```json
{ "ok": true, "messageId": "...", "accepted": ["destinatario"] }
```

## Sicurezza e limiti
- Limiti upload configurabili via env.
- Filtro MIME: default accetta jpeg/png/pdf.
- Rate limiting base e Helmet.
- CORS configurabile via env.

## Integrazione Frontend (hotel-booking-site)
Nel file `js/main.js`, sostituisci l'invio EmailJS con una fetch multipart:

```js
const endpoint = 'http://localhost:8080/api/checkin';
checkinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  checkinStatus.textContent = 'Invio in corso…';
  try {
    const fd = new FormData(checkinForm);
    const res = await fetch(endpoint, { method: 'POST', body: fd });
    const data = await res.json();
    if(!res.ok || !data.ok){ throw new Error(data.error || 'Invio fallito'); }
    checkinStatus.textContent = 'Invio avvenuto con successo. Grazie.';
    checkinForm.reset();
  } catch (err){
    console.error(err);
    checkinStatus.textContent = 'Errore durante l\'invio. Riprova.';
  }
});
```

Mantieni la compressione immagini lato client per ridurre dimensioni, ma invia i File originali (gli `<input type="file">` già lo fanno automaticamente nel FormData). Rimuovi le chiamate EmailJS e le relative chiavi.

## Note Gmail
- Abilita 2FA e crea una App Password, poi usa quei dati per SMTP_USER/SMTP_PASS.
- Porta 465 con secure=true, oppure 587 con secure=false (STARTTLS).

## Deploy
- Puoi distribuire su qualsiasi hosting Node (Render, Fly.io free tier, VPS personale). Usa HTTPS in produzione.
