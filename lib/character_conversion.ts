import * as A from "./array_data";
import Jimp = require("jimp");

export const ASCII_TO_ARRAY = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  A.BLANK,
  A.EXCLAMATION,
  A.DQUOTE,
  null, // hash
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  A.PLUS,
  A.COMMA,
  A.MINUS,
  A.PERIOD,
  null,
  A.NUM_0,
  A.NUM_1,
  A.NUM_2,
  A.NUM_3,
  A.NUM_4,
  A.NUM_5,
  A.NUM_6,
  A.NUM_7,
  A.NUM_8,
  A.NUM_9,
  A.COLON,
  A.SEMICOLON,
  null,
  null,
  null,
  null,
  null,
  A.A,
  A.B,
  A.C,
  A.D,
  A.E,
  A.F,
  A.G,
  A.H,
  A.I,
  A.J,
  A.K,
  A.L,
  A.M,
  A.N,
  A.O,
  A.P,
  A.Q,
  A.R,
  A.S,
  A.T,
  A.U,
  A.V,
  A.W,
  A.X,
  A.Y,
  A.Z,
  null,
  null,
  null,
  null,
  null,
  null,
  A.A,
  A.B,
  A.C,
  A.D,
  A.E,
  A.F,
  A.G,
  A.H,
  A.I,
  A.J,
  A.K,
  A.L,
  A.M,
  A.N,
  A.O,
  A.P,
  A.Q,
  A.R,
  A.S,
  A.T,
  A.U,
  A.V,
  A.W,
  A.X,
  A.Y,
  A.Z,
  null,
  null,
  null,
  null,
  null
];

export const arrToInt = (arr: number[]) => {
  let retval = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] > 0) {
      retval += Math.pow(2, i);
    }
  }
  return retval;
};

export const charmap = new Map<number, string>(
  ASCII_TO_ARRAY.map<[number, string]>((x, i) => {
    if (x === null) {
      return null;
    }
    return [arrToInt(x), String.fromCharCode(i)];
  })
    .filter(x => x !== null)
    .concat([[arrToInt(A.TOPDOT), "°"], [arrToInt(A.CENTERDOT), "⋅"]])
    .reverse() // prio lower codes
);

export function getCharacter(arr: number[]) {
  return charmap.get(arrToInt(arr));
}

export function getCharacterFromImg(img: Jimp, dark: number, light: number) {
  const arr = [];
  img.scanQuiet(0, 0, img.bitmap.width, img.bitmap.height, (x, y, index) => {
    if (img.bitmap.data[index] === dark) {
      arr.push(1);
    } else {
      arr.push(0);
    }
  });
  return getCharacter(arr);
}
