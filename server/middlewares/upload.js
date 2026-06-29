import multer from "multer";

// Храним файл в памяти, чтобы конвертировать его в Base64 (без записи на диск)
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
