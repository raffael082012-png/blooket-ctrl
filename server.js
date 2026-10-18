// server.js — paste this into glitch as server.js
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// proxy blooket join so browser CORS doesn't block it
app.put('/api/join', async (req, res) => {
  try {
    const r = await fetch('https://api.blooket.com/api/firebase/join', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await r.json().catch(() => ({}));
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('blooket.ctrl running'));
