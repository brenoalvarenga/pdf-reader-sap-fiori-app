const extractOCR = require('./extractfromimage-logic');

module.exports = (srv) => {
  srv.on('extractFromImage', async (req) => {
    const { fileName, mimeType, content } = req.data;

    if (!fileName || !content || !/^image\/jpe?g$/i.test(mimeType)) {
      return req.reject(400, 'Invalid upload: JPEG image required.');
    }

    console.log(`📥 Arquivo recebido: ${fileName} (${content.length} base64 chars)`);

    const result = await extractOCR(req); // 🔁 Chama lógica separada
    return result;
  });
};
