const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
// process env import 
require('dotenv').config();
// openai api


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const axios = require("axios");

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
app.get('/description/:desc', async (req, res) => {
  const description = req.params.desc;

  console.log(getGeneratedMei(description));

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

async function getGeneratedMei(description) {
    
    const prompt = `Could you generate sheet music using the XML MEI format, and it's just a D major chord? 
    here's an example of the format I'd like (this is a C major chord example):
    <?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei">
  <meiHead>
    <fileDesc>
      <titleStmt>
        <title>C Major Chord</title>
      </titleStmt>
    </fileDesc>
  </meiHead>
  <music>
    <body>
      <mdiv>
        <score>
          <scoreDef>
            <staffGrp>
              <staffDef n="1" clef.shape="G" clef.line="2" />
            </staffGrp>
          </scoreDef>
          <section>
            <measure n="1">
              <staff n="1">
                <layer n="1">
                  <chord dur="4">
                    <note pname="c" oct="4" />
                    <note pname="e" oct="4" />
                    <note pname="g" oct="4" />
                  </chord>
                </layer>
              </staff>
            </measure>
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      //prompt: prompt,
      //max_tokens: 10,
    });
    console.log(response.data.choices[0].message.content);
    //console.log(response.data.choices[0].text);
    
    return "actually just hardcoded for now";
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});