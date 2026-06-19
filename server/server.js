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

const mockProduct = {
  id: 1001,
  title: '【全新旗舰】主动降噪无线蓝牙耳机 头戴式',
  subtitle: '40dB主动降噪 | 40小时超长续航 | Hi-Res金标认证 | 蓝牙5.3',
  brand: '声域/SoundPro',
  model: 'SP-NC9000',
  parameters: [
    { key: '驱动单元', value: '40mm 动圈' },
    { key: '频响范围', value: '20Hz - 40kHz' },
    { key: '降噪深度', value: '40dB' },
    { key: '蓝牙版本', value: '蓝牙 5.3' },
    { key: '续航时间', value: '40小时' },
    { key: '充电接口', value: 'Type-C' }
  ],
  servicePromises: [
    { icon: 'delivery', label: '配送方式', value: '快递发货' },
    { icon: 'warranty', label: '质保', value: '全国联保' },
    { icon: 'location', label: '可交付区域', value: '全国' }
  ],
  price: 899,
  originalPrice: 1299,
  discount: '限时6.9折',
  sales: 128000,
  rating: 4.9,
  description: `<h2>商品详情</h2>
<p>这款<strong>主动降噪无线蓝牙耳机</strong>采用最新一代降噪技术，为您带来沉浸式音乐体验。以下从产品参数、功能介绍、场景案例与售后保障四个维度，带您全面了解这款耳机。</p>

<h2 id="section-params">产品参数</h2>
<table border="1" cellpadding="8" cellspacing="0">
  <tr><td>品牌型号</td><td>声域 SoundPro SP-NC9000</td></tr>
  <tr><td>驱动单元</td><td>40mm 动圈</td></tr>
  <tr><td>频响范围</td><td>20Hz - 40kHz</td></tr>
  <tr><td>阻抗</td><td>32Ω</td></tr>
  <tr><td>灵敏度</td><td>105dB</td></tr>
  <tr><td>降噪深度</td><td>40dB</td></tr>
  <tr><td>蓝牙版本</td><td>蓝牙 5.3</td></tr>
  <tr><td>续航时间</td><td>40小时（降噪关闭）/ 28小时（降噪开启）</td></tr>
  <tr><td>充电时间</td><td>约 2 小时</td></tr>
  <tr><td>充电接口</td><td>Type-C</td></tr>
  <tr><td>整机重量</td><td>约 258g</td></tr>
</table>
<p><em>注：以上数据为实验室测试结果，实际使用可能因环境而异。</em></p>

<h2 id="section-features">功能介绍</h2>
<h3>🎵 深度主动降噪</h3>
<p><strong>40dB 深度主动降噪</strong>，搭配双反馈麦克风，可隔绝 95% 环境噪音，地铁、航班中也能享受纯净音乐。</p>
<h3>🔋 超长续航</h3>
<p><strong>40小时超长续航</strong>，单次充电可使用一周；支持快充，充电 10 分钟即可使用 5 小时。</p>
<h3>🎧 Hi-Res 金标音质</h3>
<p><strong>Hi-Res 金标认证</strong>，支持 LDAC 高清音频编码，无损音质、细节丰富，还原现场听感。</p>
<h3>📶 稳定低延迟连接</h3>
<p><strong>蓝牙 5.3</strong>，连接更稳定、功耗更低；游戏模式延迟低至 45ms，音画同步畅玩。</p>
<h3>☁️ 舒适佩戴</h3>
<p>蛋白皮耳罩搭配自适应头梁，长时间佩戴无压迫感；可折叠设计，便于随身收纳。</p>

<h2 id="section-cases">场景案例</h2>
<div class="case-card">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20woman%20wearing%20over%20ear%20wireless%20headphones%20commuting%20on%20city%20subway%20lifestyle%20photography&image_size=landscape_16_9" alt="通勤出行场景" />
  <div class="case-body">
    <h3>通勤出行</h3>
    <p>地铁、公交嘈杂环境中开启主动降噪，沉浸聆听喜爱的歌单，让通勤时光更惬意。</p>
  </div>
</div>
<div class="case-card">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=man%20wearing%20noise%20cancelling%20headphones%20working%20focused%20at%20modern%20office%20desk%20lifestyle&image_size=landscape_16_9" alt="办公专注场景" />
  <div class="case-body">
    <h3>办公专注</h3>
    <p>开放式办公区屏蔽键盘与人声干扰，专注投入工作，效率倍增。</p>
  </div>
</div>
<div class="case-card">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20wearing%20bluetooth%20headphones%20running%20outdoors%20in%20park%20at%20sunset%20fitness%20lifestyle&image_size=landscape_16_9" alt="运动健身场景" />
  <div class="case-body">
    <h3>运动健身</h3>
    <p>稳固佩戴不夹耳，运动时享受节奏感强烈的音乐，激发运动潜能。</p>
  </div>
</div>
<div class="case-card">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traveler%20wearing%20headphones%20relaxing%20on%20airplane%20by%20the%20window%20travel%20lifestyle&image_size=landscape_16_9" alt="旅行途中场景" />
  <div class="case-body">
    <h3>旅行途中</h3>
    <p>长途飞行开启降噪，隔绝引擎轰鸣，配合超长续航，旅途不再漫长。</p>
  </div>
</div>

<h2 id="section-service">售后保障</h2>
<ul>
  <li>✅ <strong>7 天无理由退货</strong>：商品完好且不影响二次销售，支持 7 天无理由退货。</li>
  <li>✅ <strong>15 天质量问题换货</strong>：因质量问题，15 天内可免费换新。</li>
  <li>✅ <strong>全国联保 1 年</strong>：全国联保，1 年内非人为损坏免费维修。</li>
  <li>✅ <strong>终身技术支持</strong>：提供终身免费的固件升级与技术咨询服务。</li>
  <li>✅ <strong>7×24 客服</strong>：全天候在线客服，随时响应您的售后需求。</li>
  <li>✅ <strong>顺丰包邮</strong>：全国大部分地区顺丰包邮，偏远地区另议。</li>
</ul>
<p><em>售后服务由声域官方旗舰店提供，最终解释权归商家所有。</em></p>`,
  images: [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20wireless%20headphones%20on%20white%20background%20product%20photography&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20headphones%20detail%20shot%20ear%20cups%20close%20up%20product%20photo&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20bluetooth%20headphones%20side%20view%20lifestyle%20product%20shot&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20headphones%20packaging%20box%20unboxing%20product%20photography&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=headphones%20charging%20case%20accessories%20flat%20lay%20product%20photo&image_size=square_hd'
  ],
  video: '',
  specGroups: [
    {
      key: 'color',
      name: '颜色',
      options: [
        { id: 'color_black', name: '曜石黑', priceAdjust: 0 },
        { id: 'color_white', name: '珍珠白', priceAdjust: 0 },
        { id: 'color_silver', name: '星空银', priceAdjust: 50 },
        { id: 'color_gold', name: '玫瑰金', priceAdjust: 50 }
      ]
    },
    {
      key: 'version',
      name: '版本',
      options: [
        { id: 'version_standard', name: '标准版', priceAdjust: 0 },
        { id: 'version_pro', name: 'Pro版', priceAdjust: 200 },
        { id: 'version_ultra', name: 'Ultra版', priceAdjust: 400 }
      ]
    }
  ],
  skuList: [
    { key: 'color_black-version_standard', priceAdjust: 0, stock: 156 },
    { key: 'color_black-version_pro', priceAdjust: 200, stock: 80 },
    { key: 'color_black-version_ultra', priceAdjust: 400, stock: 35 },
    { key: 'color_white-version_standard', priceAdjust: 0, stock: 89 },
    { key: 'color_white-version_pro', priceAdjust: 200, stock: 45 },
    { key: 'color_white-version_ultra', priceAdjust: 400, stock: 20 },
    { key: 'color_silver-version_standard', priceAdjust: 50, stock: 42 },
    { key: 'color_silver-version_pro', priceAdjust: 250, stock: 28 },
    { key: 'color_silver-version_ultra', priceAdjust: 450, stock: 12 },
    { key: 'color_gold-version_standard', priceAdjust: 50, stock: 0 },
    { key: 'color_gold-version_pro', priceAdjust: 250, stock: 0 },
    { key: 'color_gold-version_ultra', priceAdjust: 450, stock: 0 }
  ]
}

let salesCount = mockProduct.sales

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
  sku.stock -= quantity
  salesCount += quantity
  const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
  const unitPrice = mockProduct.price + sku.priceAdjust
  const totalPrice = unitPrice * quantity
  res.json({
    code: 0,
    message: '下单成功',
    data: {
      orderId,
      productId,
      skuKey,
      quantity,
      unitPrice,
      totalPrice,
      createTime: new Date().toISOString()
    }
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
  salesCount
})

export const setAppState = (state) => {
  if (state.mockProduct) {
    Object.assign(mockProduct, state.mockProduct)
    mockProduct.skuList = state.mockProduct.skuList
  }
  if (state.salesCount !== undefined) {
    salesCount = state.salesCount
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
