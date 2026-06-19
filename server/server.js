import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|webp/
    const videoTypes = /mp4|webm|mov|avi/
    const ext = path.extname(file.originalname).toLowerCase()
    const isImage = imageTypes.test(ext)
    const isVideo = videoTypes.test(ext)
    if (isImage || isVideo) {
      cb(null, true)
    } else {
      cb(new Error('仅支持图片和视频文件'))
    }
  }
})

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 1, message: '未接收到文件' })
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`
  const isVideo = /\.(mp4|webm|mov|avi)$/i.test(req.file.filename)
  res.json({
    code: 0,
    message: '上传成功',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: isVideo ? 'video' : 'image'
    }
  })
})

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: '服务运行正常' })
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ code: 1, message: '文件大小超过限制（最大500MB）' })
    }
    return res.status(400).json({ code: 1, message: err.message })
  }
  if (err) {
    return res.status(400).json({ code: 1, message: err.message })
  }
  next()
})

app.listen(PORT, () => {
  console.log(`上传服务已启动: http://localhost:${PORT}`)
})
