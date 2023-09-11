const crypto = require("crypto");

export const cryptoRandom = () => {
  const typedArray = new Uint8Array(1);
  const randomValue = crypto.getRandomValues(typedArray)[0];
  return randomValue / Math.pow(2, 8);
};

export const randomString = (length: number): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(cryptoRandom() * charactersLength));
  }
  return result;
};

export const randomNumber = (length: number): string => {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(cryptoRandom() * charactersLength));
  }
  return result;
};

export function decodeQueryParam(p) {
  const encodedStr = encodeURIComponent(p);
  return decodeURIComponent(encodedStr);
}

export function filterArray(array: string[]) {
  const result = [];
  for (const item of array) {
    if (item) {
      result.push(item);
    }
  }
  return result;
}

export function replaceParenthesis(text: string) {
  text = text.replace("(", "\\(");
  text = text.replace(")", "\\)");
  return text;
}
