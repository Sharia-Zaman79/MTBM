import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

const router = express.Router()

const uploadsDir = path.join(process.cwd(), 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '')
    const safeExt = ext && ext.length <= 10 ? ext : ''
    cb(null, `${crypto.randomUUID()}${safeExt}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true)
    return cb(new Error('Only image uploads are allowed'))
  },
})

router.post('/avatar', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload failed' })
    }

    if (!req.file?.filename) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const publicPath = `/uploads/${req.file.filename}`
    const url = `${req.protocol}://${req.get('host')}${publicPath}`
    return res.json({ url, path: publicPath })
  })
})

export default router
