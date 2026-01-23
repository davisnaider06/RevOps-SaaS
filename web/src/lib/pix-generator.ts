// Esta função gera o padrão "BR Code" do Banco Central

function crc16(payload: string): string {
  const polynomial = 0x1021;
  let crc = 0xFFFF;

  for (let i = 0; i < payload.length; i++) {
    let c = payload.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      let bit = ((c >> (7 - j)) & 1) === 1;
      let c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) crc ^= polynomial;
    }
  }

  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function generatePixPayload({ key, name, city, amount, txid = "***" }: {
    key: string, name: string, city: string, amount: number, txid?: string
}) {
  const merchantAccount = formatField("00", "br.gov.bcb.pix") + formatField("01", key);
  const merchantCategory = "0000"; // Não especificado
  const transactionCurrency = "986"; // BRL
  const transactionAmount = amount.toFixed(2);
  const countryCode = "BR";
  const merchantName = name.substring(0, 25).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove acentos
  const merchantCity = city.substring(0, 15).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  let payload = 
    formatField("00", "01") + // Payload Format Indicator
    formatField("26", merchantAccount) +
    formatField("52", merchantCategory) +
    formatField("53", transactionCurrency) +
    formatField("54", transactionAmount) +
    formatField("58", countryCode) +
    formatField("59", merchantName) +
    formatField("60", merchantCity) +
    formatField("62", formatField("05", txid)) +
    "6304"; // Placeholder para o CRC

  payload += crc16(payload);
  
  return payload;
}