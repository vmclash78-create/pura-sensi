/**
 * Gerador de payload PIX (BR Code) conforme padrão EMV do Banco Central do Brasil.
 */

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

export function generatePixPayload(
  amount: number,
  pixKey: string = "198871e4-f73c-4643-bb1d-3d3fafa2aa18",
  merchantName: string = "PURA SENSI",
  merchantCity: string = "SAO PAULO"
): string {
  const payloadFormatIndicator = tlv("00", "01");
  const pointOfInitiation = tlv("01", "12");

  const gui = tlv("00", "br.gov.bcb.pix");
  const key = tlv("01", pixKey);
  const merchantAccountInfo = tlv("26", gui + key);

  const merchantCategoryCode = tlv("52", "0000");
  const transactionCurrency = tlv("53", "986");
  const transactionAmount = tlv("54", amount.toFixed(2));
  const countryCode = tlv("58", "BR");
  const mName = tlv("59", merchantName.substring(0, 25));
  const mCity = tlv("60", merchantCity.substring(0, 15));

  const txId = tlv("05", "***");
  const additionalData = tlv("62", txId);

  const payloadWithoutCRC =
    payloadFormatIndicator +
    pointOfInitiation +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    mName +
    mCity +
    additionalData +
    "6304";

  const checksum = crc16(payloadWithoutCRC);
  return payloadWithoutCRC + checksum;
}
