import * as Jimp from "jimp";
import * as glob from "glob";
import { getCharacter, getCharacterFromImg } from "./lib/character_conversion";

console.log("GLOB!");
let images = glob.sync("./out/**/*.png").concat(glob.sync("./out/**/*.gif"));
console.log(`Found ${images.length} images`);
//images = images.slice(0, 1);

interface ImageSearchResult {
  imagePath: Jimp;
  parsisLine: Jimp;
  image: Jimp;
  numColors: number;
  dark: number;
  light: number;
}

const promises: Promise<ImageSearchResult>[] = images.map<
  Promise<ImageSearchResult>
>(imagePath => {
  return Jimp.read(imagePath)
    .then((j: Jimp) => {
      const img = j
        .clone()
        .crop(
          (j.bitmap.width / 320) * 3,
          (j.bitmap.height / 200) * 192,
          (j.bitmap.width / 320) * 314,
          (j.bitmap.height / 200) * 5
        )
        .greyscale();

      const hgram = new Array(256).fill(0);
      img.scanQuiet(0, 0, img.bitmap.width, img.bitmap.height, function(
        x,
        y,
        index
      ) {
        hgram[img.bitmap.data[index + 0]]++;
      });
      const numColors = hgram.reduce((memo, v) => {
        return memo + (v === 0 ? 0 : 1);
      }, 0);
      let dark = null;
      let light = null;
      if (numColors === 2) {
        dark = hgram.findIndex(x => x !== 0);
        light = hgram.length - hgram.reverse().find(x => x !== 0);
      }
      const retval: ImageSearchResult = {
        imagePath,
        parsisLine: img,
        image: j,
        numColors,
        dark,
        light
      };
      return retval;
    })
    .catch(e => {
      console.error(e);
      return null;
    });
});

Promise.all(promises)
  .then(results => {
    results = results.filter(x => x !== null);
    const noctisImages = results.filter(r => r.numColors === 2);
    const notNoctisImages = results.filter(r => r.numColors !== 2); // not usable noctis images with parsis line

    noctisImages.forEach(ni => {
      const line = [];
      for (let x = 0; x < ni.parsisLine.bitmap.width - 3; x = x + 4) {
        const character = ni.parsisLine.clone().crop(x, 0, 3, 5);
        const c = getCharacterFromImg(character, ni.dark, ni.light);
        if (c !== null) {
          line.push(c);
        }
      }
      let str = line.join("");
      str = str
        .replace(/L0CATI0N/gi, "LOCATION")
        .replace(/PAR5I5/gi, "PARSIS")
        .replace(/0F/gi, "OF")
        .replace(/M00N/gi, "MOON");
      console.log(str);
    });
  })
  .catch(console.error);
