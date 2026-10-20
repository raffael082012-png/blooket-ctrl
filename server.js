const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// raid endpoint — spawns N blooket socket bots, no browser
app.post('/api/raid', async (req, res) => {
  const { pin, count, base } = req.body;
  if (!pin) return res.status(400).json({ error: 'need pin' });

  const total = Math.min(80, Math.max(1, parseInt(count) || 10));
  let ok = 0;
  const results = [];

  // require inside handler so missing dep doesn't crash the server on boot
  let Blooket;
  try { Blooket = require('blooket'); } catch(e) {
    return res.status(500).json({ error: 'blooket package not installed — run npm install' });
  }

  const tasks = Array.from({ length: total }, (_, i) => {
    const name = `${base || 'HACKEDLOL'}${i + 1}`;
    return new Promise((resolve) => {
      try {
        const client = new Blooket();
        let joined = false;
        const timeout = setTimeout(() => {
          if (!joined) { results.push({ name, ok: false, reason: 'timeout' }); resolve(); }
        }, 8000);

        client.joinGame(String(pin), name, 'Dog');
        client.on('Joined', () => {
          joined = true;
          ok++;
          results.push({ name, ok: true });
          clearTimeout(timeout);
          resolve();
        });
        client.on('error', (e) => {
          if (!joined) {
            joined = true;
            results.push({ name, ok: false, reason: String(e) });
            clearTimeout(timeout);
            resolve();
          }
        });
      } catch(e) {
        results.push({ name, ok: false, reason: String(e) });
        resolve();
      }
    });
  });

  await Promise.all(tasks);
  res.json({ ok, total, results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`blooket.ctrl on ${PORT}`));
