namespace pdfreader;

entity pdfFiles
{
    key ID : UUID;
    fileName : String(100);
    mimeType : String;
    createdAt : Timestamp;
    content : LargeString;
}
