using { pdfreader as my } from '../db/schema.cds';

@path : '/service/pdfreaderService'
service pdfreaderService {

  @odata.draft.enabled
  entity pdfFiles as projection on my.pdfFiles;

  action extractFromImage(
    fileName: String,
    mimeType: String,
    content: String
  ) returns {
    bookingCode: String;
    weight: Decimal;
  };
}
