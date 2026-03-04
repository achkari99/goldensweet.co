const multer = require('multer');
const path = require('path');

function createUploader({ projectRoot }) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(projectRoot, 'public', 'images'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp|gif/;
      const ext = allowed.test(path.extname(file.originalname).toLowerCase());
      const mime = allowed.test(file.mimetype);

      if (ext && mime) {
        cb(null, true);
      } else {
        cb(new Error('Only images are allowed'));
      }
    },
  });
}

module.exports = { createUploader };