import fs from 'fs';
import path from 'path';
import { parse } from 'subtitle';
import detectCharacterEncoding from 'detect-character-encoding';

const encodingTable = {
  "ISO-8859-1": "latin1",
  "UTF-8": "utf8"
};

var walk = function (dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function (file) {
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk("./", function (err, files) {
  if (err) {
    console.log("File cannot be properly processed for the following reason:", err);

  } else {
    const srtFiles = files.filter(el => path.extname(el).toLowerCase() === ".srt");

    if (srtFiles && srtFiles.length === 1) {
      const fileName = path.join(downloadDir, srtFiles[0]);

      // Encoding
      const fileBuffer = fs.readFileSync(fileName);
      const fileEncoding = detectCharacterEncoding(fileBuffer);

      let subtitleText = "";
      let index = 0;

      fs.createReadStream(fileName, encodingTable[fileEncoding])
        .pipe(parse())
        .on('data', (node) => {
          if (node.type === 'cue') {
            const elem = node.data;
            const text = elem.text.replace(/\n/g, " ");
            index++;

            if (text) {
              if (index % 40) {
                subtitleText += `${text} `;

              } else {
                subtitleText += `${text}\n`;
              }
            }
          }
        })
        .on('finish', () => {
          fs.writeFileSync(`${downloadDir}/new-subtitle-text.txt`, foramttedText);
        });
    } else {
      console.log("Conversion failed. Make sure you are in the Downloads folder and there is no more than one srt file present!");
    }
  }
});

