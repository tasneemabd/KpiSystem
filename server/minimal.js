const express = require('express');
const app = express();
const PORT = 3000;

app.get('/test', (req, res) => {
  res.json({ message: 'Minimal server working' });
});

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
