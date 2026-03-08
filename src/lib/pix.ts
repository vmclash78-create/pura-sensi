/**
 * Gerador de payload PIX (BR Code) conforme padrão EMV do Banco Central do Brasil.
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
  const polynomial = 0x1021;
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixPayload(amount: number): string {
  // 00 - Payload Format Indicator
  const payloadFormatIndicator = tlv("00", "01");

  // 01 - Point of Initiation Method (11 = static, 12 = dynamic)
  const pointOfInitiation = tlv("01", "12");

  // 26 - Merchant Account Information
  const gui = tlv("00", "br.gov.bcb.pix");
  const key = tlv("01", PIX_KEY);
  const merchantAccountInfo = tlv("26", gui + key);

  // 52 - Merchant Category Code (0000 = não informado)
  const merchantCategoryCode = tlv("52", "0000");

  // 53 - Transaction Currency (986 = BRL)
  const transactionCurrency = tlv("53", "986");

  // 54 - Transaction Amount
  const transactionAmount = tlv("54", amount.toFixed(2));

  // 58 - Country Code
  const countryCode = tlv("58", "BR");

  // 59 - Merchant Name (max 25 chars, no accents)
  const merchantName = tlv("59", MERCHANT_NAME.substring(0, 25));

  // 60 - Merchant City (max 15 chars, no accents)
  const merchantCity = tlv("60", MERCHANT_CITY.substring(0, 15));

  // 62 - Additional Data Field Template (txid)
  const txId = tlv("05", "***");
  const additionalData = tlv("62", txId);

  // Build payload without CRC
  const payloadWithoutCRC =
    payloadFormatIndicator +
    pointOfInitiation +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalData +
    "6304"; // CRC16 field ID (63) + length (04)

  // Calculate and append CRC16
  const checksum = crc16(payloadWithoutCRC);
  return payloadWithoutCRC + checksum;
}
