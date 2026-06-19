import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import seedProduct, { getInitialSalesCount, getInventorySummary } from './seedData.js'

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

const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj))
const mockProduct = cloneDeep(seedProduct)
let salesCount = getInitialSalesCount()

const inventorySummary = getInventorySummary()
console.log('=== 商品库存种子数据加载完成 ===')
console.log(`商品ID: ${mockProduct.id}`)
console.log(`商品名称: ${mockProduct.title}`)
console.log(`基础价格: ¥${mockProduct.price}`)
console.log(`初始销量: ${salesCount}`)
console.log(`SKU总数: ${inventorySummary.totalSkus}`)
console.log(`在售SKU: ${inventorySummary.inStockSkus}`)
console.log(`缺货SKU: ${inventorySummary.outOfStockSkus}`)
console.log(`总库存: ${inventorySummary.totalStock}件`)
console.log('================================')

const orders = new Map()

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: '服务运行正常' })
})

app.get('/api/product/:id', (req, res) => {
  const { id } = req.params
  res.json({
    code: 0,
    message: 'success',
    data: {
      id: mockProduct.id,
      title: mockProduct.title,
      subtitle: mockProduct.subtitle,
      brand: mockProduct.brand,
      model: mockProduct.model,
      parameters: mockProduct.parameters,
      servicePromises: mockProduct.servicePromises,
      price: mockProduct.price,
      originalPrice: mockProduct.originalPrice,
      discount: mockProduct.discount,
      rating: mockProduct.rating,
      images: mockProduct.images,
      video: mockProduct.video,
      specGroups: mockProduct.specGroups,
      description: mockProduct.description
    }
  })
})

app.get('/api/product/:id/description', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      productId: mockProduct.id,
      description: mockProduct.description,
      plainText: mockProduct.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    }
  })
})

app.get('/api/product/:id/sales', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      sales: salesCount,
      salesText: salesCount >= 10000 ? (salesCount / 10000).toFixed(1) + '万' : salesCount.toString()
    }
  })
})

app.get('/api/product/:id/stock', (req, res) => {
  const { skuKey } = req.query
  if (!skuKey) {
    return res.status(400).json({ code: 1, message: '缺少skuKey参数' })
  }
  const sku = mockProduct.skuList.find(s => s.key === skuKey)
  if (!sku) {
    return res.status(404).json({ code: 1, message: 'SKU不存在' })
  }
  res.json({
    code: 0,
    message: 'success',
    data: {
      skuKey: sku.key,
      stock: sku.stock,
      priceAdjust: sku.priceAdjust
    }
  })
})

app.post('/api/order/create', (req, res) => {
  const { productId, skuKey, quantity } = req.body
  if (!productId || !skuKey || !quantity) {
    return res.status(400).json({ code: 1, message: '参数不完整' })
  }
  const sku = mockProduct.skuList.find(s => s.key === skuKey)
  if (!sku) {
    return res.status(404).json({ code: 1, message: 'SKU不存在' })
  }
  if (sku.stock < quantity) {
    return res.status(400).json({ code: 1, message: '库存不足' })
  }
  const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
  const unitPrice = mockProduct.price + sku.priceAdjust
  const totalPrice = unitPrice * quantity
  const order = {
    orderId,
    productId,
    skuKey,
    quantity,
    unitPrice,
    totalPrice,
    status: 'pending',
    createTime: new Date().toISOString(),
    payTime: null
  }
  orders.set(orderId, order)
  res.json({
    code: 0,
    message: '下单成功',
    data: order
  })
})

app.post('/api/order/pay', (req, res) => {
  const { orderId } = req.body
  if (!orderId) {
    return res.status(400).json({ code: 1, message: '参数不完整' })
  }
  const order = orders.get(orderId)
  if (!order) {
    return res.status(404).json({ code: 1, message: '订单不存在' })
  }
  if (order.status === 'paid') {
    return res.status(400).json({ code: 1, message: '订单已支付' })
  }
  const sku = mockProduct.skuList.find(s => s.key === order.skuKey)
  if (!sku) {
    return res.status(404).json({ code: 1, message: 'SKU不存在' })
  }
  if (sku.stock < order.quantity) {
    return res.status(400).json({ code: 1, message: '库存不足' })
  }
  sku.stock -= order.quantity
  salesCount += order.quantity
  order.status = 'paid'
  order.payTime = new Date().toISOString()
  orders.set(orderId, order)
  res.json({
    code: 0,
    message: '支付成功',
    data: order
  })
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

export const getAppState = () => ({
  mockProduct,
  salesCount,
  orders
})

export const setAppState = (state) => {
  if (state.mockProduct) {
    Object.assign(mockProduct, state.mockProduct)
    mockProduct.skuList = state.mockProduct.skuList
  }
  if (state.salesCount !== undefined) {
    salesCount = state.salesCount
  }
  if (state.orders !== undefined) {
    orders.clear()
    if (state.orders instanceof Map) {
      state.orders.forEach((order, orderId) => orders.set(orderId, order))
    }
  }
}

export const formatSalesText = (count) => {
  return count >= 10000 ? (count / 10000).toFixed(1) + '万' : count.toString()
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`上传服务已启动: http://localhost:${PORT}`)
  })
}

export default app
