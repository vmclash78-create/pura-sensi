/**
 * Gerador de payload PIX (BR Code) conforme padrão do Banco Central do Brasil.
 * Referência: Manual de Padrões para Iniciação do PIX - BACEN
 */

const PIX_KEY = "198871e4-f73c-4643-bb1d-3d3fafa2aa18";
const MERCHANT_NAME = "PURA SENSI";
const MERCHANT_CITY = "SAO PAULO";

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixPayload(amount: number): string {
  const gui = tlv("00", "br.gov.bcb.pix");
  const key = tlv("01", PIX_KEY);
  const merchantAccountInfo = tlv("26", gui + key);

  const payloadFormatIndicator = tlv("00", "01");
  const pointOfInitiation = tlv("01", "12"); // dinâmico (uso único)
  const transactionCurrency = tlv("53", "986"); // BRL
  const transactionAmount = tlv("54", amount.toFixed(2));
  const countryCode = tlv("58", "BR");
  const merchantName = tlv("59", MERCHANT_NAME);
  const merchantCity = tlv("60", MERCHANT_CITY);

  const payload =
    payloadFormatIndicator +
    pointOfInitiation +
    merchantAccountInfo +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    "6304"; // CRC placeholder (ID 63, len 04)

  const checksum = crc16(payload);
  return payload + checksum;
}
