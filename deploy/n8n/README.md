# Contact form → n8n → email

The site's `/api/contact` route validates each message, filters spam and rate-limits,
then POSTs it to an n8n webhook:

```json
{
  "name": "Jane Recruiter",
  "email": "jane@company.com",
  "message": "Hi Asadullah…",
  "source": "asadullahafzal.com",
  "submittedAt": "2026-10-06T12:00:00.000Z",
  "userAgent": "Mozilla/5.0 …"
}
```

with the header `X-Contact-Secret: <your secret>` so only your site can trigger the workflow.

## 1. Build the workflow in n8n (3 nodes)

1. **Webhook**
   - HTTP Method: `POST`
   - Path: `portfolio-contact`
   - Authentication: **Header Auth** → create a credential with
     Name `X-Contact-Secret` and Value = the `N8N_CONTACT_SECRET` from `/etc/portfolio.env`
   - Respond: **Using 'Respond to Webhook' node**
2. **Gmail → Send a message** (or **Send Email** with SMTP)
   - To: `asadullahafzal840@gmail.com`
   - Subject: `New message from {{ $json.body.name }} via asadullahafzal.com`
   - Message: 
     ```
     From: {{ $json.body.name }} <{{ $json.body.email }}>
     Sent: {{ $json.body.submittedAt }}

     {{ $json.body.message }}
     ```
   - Options → **Reply To**: `{{ $json.body.email }}` (so hitting Reply answers the sender)
3. **Respond to Webhook**: Respond With `JSON`, body `{ "ok": true }`

**Activate** the workflow and copy its **Production URL** (not the Test URL).

## 2. Connect the site

On the VPS, put the Production URL in `/etc/portfolio.env`:

```
N8N_CONTACT_WEBHOOK_URL=https://YOUR-N8N/webhook/portfolio-contact
N8N_CONTACT_SECRET=…already generated…
```

then `systemctl restart portfolio`. The form appears on the site automatically. Until the URL
is set, visitors see an "Email me" button instead.

## 3. Test

```bash
curl -X POST https://asadullahafzal.com/api/contact -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"you@example.com","message":"Testing the contact form","elapsedMs":9000}'
```

`{"ok":true}` + an email in your inbox = working. Ideas to extend the workflow: save each
message to a Google Sheet or PostgreSQL, or ping you on Telegram/WhatsApp.
