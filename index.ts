import * as Jimp from "jimp";
import * as glob from "glob";
import { getCharacter, getCharacterFromImg } from "./lib/character_conversion";
import { Noctis } from "noctis-starmap";

const Starmap = new Noctis("./data/starmap2.bin", "./data/guide.bin");

let images = glob.sync("./out/**/*.png").concat(glob.sync("./out/**/*.gif"));
console.log(`Found ${images.length} images`);
//images = images.slice(0, 1000);

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
    const OccuranceMap: Map<string, number> = new Map();
    results = results.filter(x => x !== null);
    const noctisImages = results.filter(r => r.numColors === 2);
    const notNoctisImages = results.filter(r => r.numColors !== 2); // not usable noctis images with parsis line
    console.log(
      `Found ${noctisImages.length} Noctis images with status line (${notNoctisImages.length} non-noctis or without statusline)`
    );
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
        .replace(/5TAR/gi, "STAR")
        .replace(/5\°/gi, "S°")
        .replace(/M00N/gi, "MOON");

      const parsis = str.match(
        /LOCATION PARSIS\: ([0-9-]*)\;([0-9-]*)\;([0-9-]*)/
      );
      if (parsis !== null) {
        const starCoords = {
          x: parseInt(parsis[1]),
          y: -parseInt(parsis[2]),
          z: parseInt(parsis[3])
        };
        const id = Starmap.getIDForStarCoordinates(
          starCoords.x,
          starCoords.y,
          starCoords.z
        );
        const star = Starmap.getStarByID(id, 0.001);
        if (star !== undefined) {
          OccuranceMap.set(star.name, (OccuranceMap.get(star.name) || 0) + 1);
          /*const entries = Starmap.getGuideEntriesForStar(star.object_id);
          if (entries.length > 0 || star !== undefined) {
            console.log(str);
            console.log(id);
            console.log(star);
            //console.log(entries);
          }*/
        }
      }
    });
    console.log(
      JSON.stringify({
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        description: "A simple bar chart with embedded data.",
        title:
          "Number of pictures uploaded to 0x44.com per solar system in the Noctis universe",
        data: {
          values: Array.from(OccuranceMap.entries()).map(
            ([starname, pictures]) => {
              return { starname, pictures };
            }
          )
        },
        background: "white",
        mark: "bar",
        encoding: {
          x: {
            field: "starname",
            type: "ordinal",
            title: "Solar system (star name)",
            sort: "-y"
          },
          y: { field: "pictures", type: "quantitative" }
        }
      })
    );
  })
  .catch(console.error);
