/*
This snippet converts the output of a set of Postline DBX files into an Aria2 download list containing all images with a size that's a multiple of 320x200.
*/

const fs = require("fs");

const makeAriaFile = BASENAME => {
  const lines = fs
    .readFileSync(`./cdisk_${BASENAME}s.txt`)
    .toString()
    .replace(/\" /g, "")
    .split(/\r?\n/);

  const files = lines.reduce((memo, line) => {
    match = line.match(
      /\<file\>(.*)\<owner\>(.*)\<stored\>(.*)\<width\>(.*)\<height\>(.*)\<size\>(.*)\</
    );
    if (match !== null) {
      const obj = {
        file: match[1],
        owner: match[2],
        stored: match[3],
        width: parseInt(match[4]),
        height: parseInt(match[5]),
        size: parseInt(match[6])
      };
      if (
        obj.width % 320 === 0 &&
        obj.height % 200 === 0 &&
        parseInt(obj.width / 320) === parseInt(obj.height / 200)
      ) {
        memo.push(obj);
      }
    }
    return memo;
  }, []);

  const aria2_urls = files.map(file => {
    return (
      "" +
      `
# ${JSON.stringify(file)}
http://anynowhere.com/bb/${file.file}
  dir=./out/${BASENAME}

`
    );
  });

  fs.writeFileSync(`aria2_${BASENAME}s.urls`, aria2_urls.join("\n"));
};

makeAriaFile("png");
makeAriaFile("gif");
makeAriaFile("jpg");
