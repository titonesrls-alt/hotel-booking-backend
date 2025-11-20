import multer from 'multer';

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 15);
const MAX_FILE_SIZE = maxFileSizeMb * 1024 * 1024;
const allowedMime = (process.env.ALLOWED_MIME || 'image/jpeg,image/png,application/pdf')
  .split(',').map(s => s.trim()).filter(Boolean);
const maxFiles = Number(process.env.MAX_FILES || 20);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (allowedMime.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('Tipo file non consentito: ' + file.mimetype));
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE, files: maxFiles } });

// campi supportati: guest_X_id (singoli), additional_documents (multipli)
export const uploadFields = upload.fields([
  // multer accetta pattern solo espliciti; gestiremo guest_X_id genericamente con .any() fallback se servisse
  { name: 'additional_documents', maxCount: maxFiles },
]);

export default upload;
