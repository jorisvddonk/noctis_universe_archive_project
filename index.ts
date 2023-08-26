import * as Jimp from "jimp";
import * as glob from "glob";
import { getCharacterFromImg, charmap, ASCII_TO_ARRAY } from "./lib/character_conversion";
import { Noctis } from "noctis-starmap";
import * as vega from "vega";
import * as vegaLite from "vega-lite";
import { createWriteStream, fstat, mkdirSync } from "fs";

const Starmap = new Noctis("./data/starmap2.bin", "./data/guide.bin");

try {
  mkdirSync("charmap_export");
} catch (e) { }

Jimp.create((128 * 3), (1 * 5), 0x000000FF).then(img => {
  for (let i = 0; i < ASCII_TO_ARRAY.length; i++) {
    let char = ASCII_TO_ARRAY[i];
    let x_start = i * 3;
    let y_start = 0;
    if (char != null) {
      for (let j = 0; j < char.length; j++) {
        img.setPixelColor(char[j] == 1 ? 0xFFFFFFFF : 0x000000FF, x_start + (j % 3), y_start + Math.floor(j / 3));
      }
    }
  }

  return img.writeAsync("./charmap_export/charmap.png");
}).then(o => {
  console.log("Done! NOTE: image does not contain any pixels with alpha transparency, and it doesn't contain all Noctis IV characters! You'll have to alter it manually in post using an image editing tool!");
}).catch(e => console.error(e));