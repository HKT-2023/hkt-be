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
  return decodeURIComponent(p.replace(/\+/g, " "));
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

export function calculateDistanceByCoordinate(
  checkingCoordinates: number[], //lat,long
  realCoordinates: number[] //lat,long
) {
  const R = 6371e3;
  const latitude1 = (checkingCoordinates[0] * Math.PI) / 180;
  const latitude2 = (realCoordinates[0] * Math.PI) / 180;
  const latitude =
    ((realCoordinates[0] - checkingCoordinates[0]) * Math.PI) / 180;
  const longitude =
    ((checkingCoordinates[1] - realCoordinates[1]) * Math.PI) / 180;

  const a =
    Math.sin(latitude / 2) * Math.sin(latitude / 2) +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(longitude / 2) *
      Math.sin(longitude / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "development" ? false : true;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV !== "production" ? false : true;
}

export function extractNumberFromString(input: string): string | null {
  const pattern = /\d+/;  // Matches one or more digits
  const match = input.match(pattern);
  if (match) {
    return match[0];
  }
}

export function _handleTime(){
  const currentDate = new Date();

  // Format time
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  
  return currentDate.toLocaleString(undefined, options);
  
}

export function _formatDate(dateString: string): string {
  const [month, day, year] = dateString.split('/');

  // Format time
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  const date = new Date(`${year}-${month}-${day}`);
  const formattedDate = date.toLocaleString(undefined, options);

  return formattedDate;
}


export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDateTime(dateTimeString: string): string {
  const dateTimeParts = dateTimeString.split(' at ');
  const formattedDateTime = `${dateTimeParts[0]} - ${dateTimeParts[1]}`;
  return formattedDateTime;
}

