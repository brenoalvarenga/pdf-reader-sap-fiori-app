sap.ui.define(
  ['sap/fe/core/PageController'],
  function (PageController) {
    'use strict';

    return PageController.extend('pdfreader.pdfreader.ext.main.Main', {
      onChange: function () {
        const oFileUploader = this.byId("fileUploader");
        const oFile = oFileUploader.getDomRef("fu")?.files[0];

        if (!oFile) {
          sap.m.MessageToast.show("Please upload a PDF file.");
          return;
        }

        if (oFile.type !== "application/pdf") {
          sap.m.MessageToast.show("Only PDF files are allowed.");
          return;
        }

        sap.m.MessageToast.show("📄 PDF uploaded. Processing...");
        this._renderPdfToImage(oFile);
      },

      _renderPdfToImage: async function (file) {
        const reader = new FileReader();

        reader.onload = async () => {
          try {
            const typedarray = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            const page = await pdf.getPage(1);

            const scale = 1.2;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

            if (dataUrl && dataUrl.startsWith("data:image/jpeg")) {
              const base64String = dataUrl.split(",")[1];
              const imageFileName = file.name.replace(/\.pdf$/i, '.jpg');

              sap.m.MessageToast.show("🖼️ Image extracted from PDF. Sending to backend...");
              await this._sendToBackend(imageFileName, 'image/jpeg', base64String);
            } else {
              sap.m.MessageToast.show("❌ Failed to convert PDF to image.");
            }
          } catch (err) {
            console.error("❌ Error rendering PDF to image:", err);
            sap.m.MessageToast.show("❌ Error rendering PDF to image.");
          }
        };

        reader.readAsArrayBuffer(file);
      },

      _sendToBackend: async function (fileName, mimeType, base64Content) {
        const payload = {
          fileName,
          mimeType,
          content: base64Content
        };

        try {
          const response = await fetch("/service/pdfreaderService/extractFromImage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Server error response:", errorText);
            throw new Error(`Server responded with status ${response.status}`);
          }

          const result = await response.json();
          console.log("📬 Backend response:", result);

          const bookingCode = result.bookingCode || "não encontrado";
          const weight = result.weight != null ? result.weight : "não encontrado";

          sap.m.MessageToast.show(`✔️ Booking: ${bookingCode}, Peso: ${weight}`);
        } catch (err) {
          console.error("❌ Error sending to backend:", err);
          sap.m.MessageToast.show("❌ Error sending file to backend.");
        }
      }
    });
  }
);
