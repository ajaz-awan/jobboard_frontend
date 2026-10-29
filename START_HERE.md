# Start your new frontend

1. Keep your existing backend running at `http://localhost:5000`.
2. Extract this ZIP into a **new folder**. Keep the old frontend as a backup for now.
3. On Windows, double-click **START_FRONTEND.cmd**. You do not need PowerShell.
4. Wait for **Ready**. First launch installs packages automatically (internet required).
5. Open **http://localhost:3000** and log in with your existing account.

**Roman Urdu:** Backend chalta rehne dein. ZIP ko naye folder mein extract karein, phir `START_FRONTEND.cmd` par double-click karein. Ready aane ke baad browser mein `http://localhost:3000` kholein.

- Install Node.js 22 LTS if needed.
- The launcher creates the frontend `.env.local` from `.env.example`. Never copy backend secrets into the frontend.
- If your API uses another port, edit `BACKEND_URL` in the frontend `.env.local` and restart.
- Leave `NEXT_PUBLIC_API_URL` empty for the recommended same-origin proxy.
- Backend settings: `CLIENT_URL=http://localhost:3000` and `FRONTEND_URL=http://localhost:3000`. Restart after changes.
- Use `localhost`, not `127.0.0.1`. Close the old frontend terminal if port 3000 is occupied.
- Existing accounts, jobs and applications remain in your existing database.

## Verification

Verify your email before applying, saving jobs, posting/editing listings or uploading a logo. Open the complete email link and click **Verify my email**. In local outbox mode, email previews are in the backend's private `.mail-outbox` folder instead of your inbox. Open the link from that preview yourself; never upload/share that private folder.

Admins are provisioned through the backend admin script. There is no public admin signup.

## Hosted preview

The preview shows the frontend; it does not contain your local backend or database. Run this downloaded Next.js app for your existing API. A fully hosted app needs a hosted backend, SMTP, HTTPS, and same-site API routing.
