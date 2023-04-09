const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname)));

app.use('/soundfont', (req, res, next) => {
    const fileExtension = path.extname(req.url);
    if (fileExtension === '.sf2') {
      res.setHeader('Content-Type', 'application/octet-stream');
    } else if (fileExtension === '.json') {
      res.setHeader('Content-Type', 'application/json');
    }
    next();
  });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'MIDIPlayer.html'));
  });

// Get the description parameter from the URL
app.get('/description/:desc', (req, res) => {
  const description = req.params.desc;

  fs.readFile(path.join(__dirname, 'MIDIPlayer.html'), 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading HTML file');
      return;
    }

    const descriptionHtml = `<div id="description">${description}</div>`;
    const modifiedData = data.replace('</body>', descriptionHtml + '</body>');
    res.send(modifiedData);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});