// 🔹 extractfromimage-logic.js
// Lógica de OCR isolada, não registra evento diretamente

const vision = require('@google-cloud/vision');
const path = require('path');

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.resolve(__dirname, '../../env/cloud-vision-api-key.json')
});

module.exports = async function extractOCR(req) {
  const { content } = req.data;
  const buffer = Buffer.from(content, 'base64');

  let bookingCode = null;
  let weight = null;

  try {
    const [result] = await client.textDetection({ image: { content: buffer } });
    const fullText = result?.textAnnotations?.[0]?.description || '';
    console.log('🧠 Texto extraído:', fullText);

    const bookingMatch = fullText.match(/Nr\.?\s*Booking:\s*(\w+)/i);
    if (bookingMatch?.[1]) {
      bookingCode = bookingMatch[1];
      console.log("📦 Booking code:", bookingCode);
    }

    const pesoMatch = fullText.match(/([\d.,]+)\s*Kgs/i);
    if (pesoMatch?.[1]) {
      const raw = pesoMatch[1];

      if (/^\d{1,3}(,\d{3})+\.\d+$/.test(raw)) {
        weight = raw.replace(/,/g, '');
      } else if (/^\d{1,3}(\.\d{3})+,\d+$/.test(raw)) {
        weight = raw.replace(/\./g, '').replace(',', '.');
      } else {
        weight = raw.replace(',', '.');
      }

      weight = parseFloat(weight);
      console.log("⚖️ Peso extraído:", weight);
    }
  } catch (err) {
    console.error('❌ Erro na API Cloud Vision:', err.message || err);
  }

  return { bookingCode, weight };
};
