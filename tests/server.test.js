import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app, { formatSalesText, getAppState, setAppState } from '../server/server.js'

const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj))

describe('Server - 销量格式化 formatSalesText', () => {
  it('销量小于 10000 时直接返回数字字符串', () => {
    expect(formatSalesText(0)).toBe('0')
    expect(formatSalesText(99)).toBe('99')
    expect(formatSalesText(9999)).toBe('9999')
  })

  it('销量 >= 10000 时格式化为 x.x万', () => {
    expect(formatSalesText(10000)).toBe('1.0万')
    expect(formatSalesText(128000)).toBe('12.8万')
    expect(formatSalesText(99999)).toBe('10.0万')
    expect(formatSalesText(1234567)).toBe('123.5万')
  })
})

describe('Server - 库存扣减 /api/order/create', () => {
  let initialState

  beforeEach(() => {
    initialState = cloneDeep(getAppState())
    setAppState({
      salesCount: 128000,
      mockProduct: {
        skuList: [
          { key: 'color_black-version_standard', priceAdjust: 0, stock: 100 },
          { key: 'color_black-version_pro', priceAdjust: 200, stock: 50 },
          { key: 'color_silver-version_ultra', priceAdjust: 450, stock: 10 }
        ]
      }
    })
  })

  it('下单成功：正确扣减库存', async () => {
    const res = await request(app)
      .post('/api/order/create')
      .send({ productId: 1001, skuKey: 'color_black-version_standard', quantity: 3 })

    expect(res.statusCode).toBe(200)
    expect(res.body.code).toBe(0)

    const state = getAppState()
    const sku = state.mockProduct.skuList.find(s => s.key === 'color_black-version_standard')
    expect(sku.stock).toBe(97)
  })

  it('下单成功：返回正确的订单信息（单价、总价）', async () => {
    const res = await request(app)
      .post('/api/order/create')
      .send({ productId: 1001, skuKey: 'color_black-version_pro', quantity: 2 })

    expect(res.statusCode).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data.unitPrice).toBe(1099)
    expect(res.body.data.totalPrice).toBe(2198)
    expect(res.body.data.quantity).toBe(2)
    expect(res.body.data.orderId).toMatch(/^ORD/)
  })

  it('库存不足时返回错误', async () => {
    const res = await request(app)
      .post('/api/order/create')
      .send({ productId: 1001, skuKey: 'color_silver-version_ultra', quantity: 20 })

    expect(res.statusCode).toBe(400)
    expect(res.body.code).toBe(1)
    expect(res.body.message).toBe('库存不足')

    const state = getAppState()
    const sku = state.mockProduct.skuList.find(s => s.key === 'color_silver-version_ultra')
    expect(sku.stock).toBe(10)
  })

  it('SKU不存在时返回 404', async () => {
    const res = await request(app)
      .post('/api/order/create')
      .send({ productId: 1001, skuKey: 'nonexistent_sku', quantity: 1 })

    expect(res.statusCode).toBe(404)
    expect(res.body.code).toBe(1)
    expect(res.body.message).toBe('SKU不存在')
  })

  it('参数不完整时返回 400', async () => {
    const res = await request(app)
      .post('/api/order/create')
      .send({ productId: 1001 })

    expect(res.statusCode).toBe(400)
    expect(res.body.code).toBe(1)
    expect(res.body.message).toBe('参数不完整')
  })

  it('数量为 0 时被视为参数不完整（falsy 值校验）', async () => {
    const res = await request(app)
      .post('/api/order/create')
      .send({ productId: 1001, skuKey: 'color_black-version_standard', quantity: 0 })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('参数不完整')
  })
})

describe('Server - 已售数量 /api/product/:id/sales', () => {
  let initialState

  beforeEach(() => {
    initialState = cloneDeep(getAppState())
  })

  it('获取初始销量', async () => {
    setAppState({ salesCount: 128000 })
    const res = await request(app).get('/api/product/1001/sales')
    expect(res.statusCode).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data.sales).toBe(128000)
    expect(res.body.data.salesText).toBe('12.8万')
  })

  it('下单后销量累加', async () => {
    setAppState({
      salesCount: 128000,
      mockProduct: {
        skuList: [
          { key: 'color_black-version_standard', priceAdjust: 0, stock: 100 }
        ]
      }
    })

    await request(app)
      .post('/api/order/create')
      .send({ productId: 1001, skuKey: 'color_black-version_standard', quantity: 5 })

    const res = await request(app).get('/api/product/1001/sales')
    expect(res.body.data.sales).toBe(128005)
    expect(res.body.data.salesText).toBe('12.8万')
  })

  it('多次下单销量累加正确', async () => {
    setAppState({
      salesCount: 0,
      mockProduct: {
        skuList: [
          { key: 'sku_a', priceAdjust: 0, stock: 100 },
          { key: 'sku_b', priceAdjust: 0, stock: 100 }
        ]
      }
    })

    await request(app).post('/api/order/create').send({ productId: 1001, skuKey: 'sku_a', quantity: 3 })
    await request(app).post('/api/order/create').send({ productId: 1001, skuKey: 'sku_b', quantity: 7 })
    await request(app).post('/api/order/create').send({ productId: 1001, skuKey: 'sku_a', quantity: 10 })

    const res = await request(app).get('/api/product/1001/sales')
    expect(res.body.data.sales).toBe(20)
    expect(res.body.data.salesText).toBe('20')
  })

  it('销量小于 10000 时不使用万单位', async () => {
    setAppState({ salesCount: 9999 })
    const res = await request(app).get('/api/product/1001/sales')
    expect(res.body.data.salesText).toBe('9999')
  })

  it('销量刚好 10000 时显示 1.0万', async () => {
    setAppState({ salesCount: 10000 })
    const res = await request(app).get('/api/product/1001/sales')
    expect(res.body.data.salesText).toBe('1.0万')
  })
})

describe('Server - 商品详情富文本', () => {
  it('/api/product/:id 返回 description 字段', async () => {
    const res = await request(app).get('/api/product/1001')
    expect(res.statusCode).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data.description).toBeDefined()
    expect(typeof res.body.data.description).toBe('string')
    expect(res.body.data.description.length).toBeGreaterThan(0)
  })

  it('/api/product/:id/description 返回富文本详情', async () => {
    const res = await request(app).get('/api/product/1001/description')
    expect(res.statusCode).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data.productId).toBe(1001)
    expect(res.body.data.description).toContain('<h2>')
    expect(res.body.data.description).toContain('<h3>')
    expect(res.body.data.description).toContain('<ul>')
    expect(res.body.data.description).toContain('<table')
    expect(res.body.data.description).toContain('<strong>')
  })

  it('/api/product/:id/description 返回纯文本版本', async () => {
    const res = await request(app).get('/api/product/1001/description')
    expect(res.body.data.plainText).toBeDefined()
    expect(res.body.data.plainText).not.toContain('<')
    expect(res.body.data.plainText).not.toContain('>')
    expect(res.body.data.plainText.length).toBeGreaterThan(0)
  })

  it('富文本包含核心卖点关键词', async () => {
    const res = await request(app).get('/api/product/1001/description')
    expect(res.body.data.description).toContain('40dB')
    expect(res.body.data.description).toContain('40小时')
    expect(res.body.data.description).toContain('Hi-Res')
    expect(res.body.data.description).toContain('蓝牙 5.3')
  })

  it('纯文本版本正确剥离HTML标签', async () => {
    setAppState({
      mockProduct: {
        description: '<h1>标题</h1><p>段落<strong>加粗</strong></p>',
        skuList: []
      }
    })
    const res = await request(app).get('/api/product/1001/description')
    expect(res.body.data.plainText).toBe('标题段落加粗')
  })
})

describe('Server - SKU 库存查询 /api/product/:id/stock', () => {
  let initialState

  beforeEach(() => {
    initialState = cloneDeep(getAppState())
    setAppState({
      mockProduct: {
        skuList: [
          { key: 'sku_test_1', priceAdjust: 50, stock: 42 },
          { key: 'sku_test_2', priceAdjust: 0, stock: 0 }
        ]
      }
    })
  })

  it('查询指定 SKU 库存', async () => {
    const res = await request(app).get('/api/product/1001/stock?skuKey=sku_test_1')
    expect(res.statusCode).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data.skuKey).toBe('sku_test_1')
    expect(res.body.data.stock).toBe(42)
    expect(res.body.data.priceAdjust).toBe(50)
  })

  it('库存为 0 的 SKU 正确返回', async () => {
    const res = await request(app).get('/api/product/1001/stock?skuKey=sku_test_2')
    expect(res.statusCode).toBe(200)
    expect(res.body.data.stock).toBe(0)
  })

  it('缺少 skuKey 参数返回 400', async () => {
    const res = await request(app).get('/api/product/1001/stock')
    expect(res.statusCode).toBe(400)
    expect(res.body.code).toBe(1)
  })

  it('SKU不存在返回 404', async () => {
    const res = await request(app).get('/api/product/1001/stock?skuKey=not_exist')
    expect(res.statusCode).toBe(404)
    expect(res.body.code).toBe(1)
  })
})
