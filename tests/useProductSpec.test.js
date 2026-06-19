import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useProductSpec } from '../src/composables/useProductSpec'

vi.mock('../src/api/product', () => ({
  getSkuStock: vi.fn()
}))

const mockSpecGroups = () => ref([
  {
    key: 'color',
    name: '颜色',
    options: [
      { id: 'color_black', name: '曜石黑', priceAdjust: 0, stock: 100 },
      { id: 'color_white', name: '珍珠白', priceAdjust: 0, stock: 50 },
      { id: 'color_silver', name: '星空银', priceAdjust: 50, stock: 20 },
      { id: 'color_gold', name: '玫瑰金', priceAdjust: 50, stock: 0 }
    ]
  },
  {
    key: 'version',
    name: '版本',
    options: [
      { id: 'version_standard', name: '标准版', priceAdjust: 0, stock: 200 },
      { id: 'version_pro', name: 'Pro版', priceAdjust: 200, stock: 80 },
      { id: 'version_ultra', name: 'Ultra版', priceAdjust: 400, stock: 30 }
    ]
  }
])

const mockSkuList = () => ref([
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
])

describe('useProductSpec - 销售规格价格计算', () => {
  let basePrice
  let specGroups
  let skuList

  beforeEach(() => {
    basePrice = ref(899)
    specGroups = mockSpecGroups()
    skuList = mockSkuList()
    vi.clearAllMocks()
  })

  it('基础价格 + 标准版 = 无价格调整', () => {
    const { unitPrice, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_black')
    selectSpec('version', 'version_standard')
    expect(unitPrice.value).toBe(899)
  })

  it('星空银(+50) + Pro版(+200) = SKU价格调整 250', () => {
    const { unitPrice, specPriceAdjust, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_silver')
    selectSpec('version', 'version_pro')
    expect(specPriceAdjust.value).toBe(250)
    expect(unitPrice.value).toBe(1149)
  })

  it('曜石黑 + Ultra版 = 价格调整 400', () => {
    const { unitPrice, specPriceAdjust, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_black')
    selectSpec('version', 'version_ultra')
    expect(specPriceAdjust.value).toBe(400)
    expect(unitPrice.value).toBe(1299)
  })

  it('无SKU列表时，使用规格选项价格调整累加', () => {
    const emptySkuList = ref([])
    const { unitPrice, specPriceAdjust, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, emptySkuList)
    initDefaultSpecs()
    selectSpec('color', 'color_silver')
    selectSpec('version', 'version_pro')
    expect(specPriceAdjust.value).toBe(250)
    expect(unitPrice.value).toBe(1149)
  })

  it('总价 = 单价 × 数量', () => {
    const { unitPrice, totalPrice, quantity, selectSpec, initDefaultSpecs, increaseQty } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_black')
    selectSpec('version', 'version_pro')
    expect(unitPrice.value).toBe(1099)
    expect(totalPrice.value).toBe(1099)
    increaseQty()
    increaseQty()
    expect(quantity.value).toBe(3)
    expect(totalPrice.value).toBe(3297)
  })

  it('正确生成 skuKey', () => {
    const { skuKey, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_white')
    selectSpec('version', 'version_ultra')
    expect(skuKey.value).toBe('color_white-version_ultra')
  })

  it('正确匹配 SKU', () => {
    const { matchedSku, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_silver')
    selectSpec('version', 'version_standard')
    expect(matchedSku.value).toBeDefined()
    expect(matchedSku.value.key).toBe('color_silver-version_standard')
    expect(matchedSku.value.stock).toBe(42)
  })

  it('正确生成已选规格文本', () => {
    const { selectedSpecText, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_black')
    selectSpec('version', 'version_pro')
    expect(selectedSpecText.value).toBe('曜石黑，Pro版')
  })
})

describe('useProductSpec - 库存与数量控制', () => {
  let basePrice
  let specGroups
  let skuList

  beforeEach(() => {
    basePrice = ref(899)
    specGroups = mockSpecGroups()
    skuList = mockSkuList()
    vi.clearAllMocks()
  })

  it('currentStock 从匹配的 SKU 获取库存', () => {
    const { currentStock, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_black')
    selectSpec('version', 'version_standard')
    expect(currentStock.value).toBe(156)
  })

  it('无SKU列表时，取各规格选项最小库存', () => {
    const emptySkuList = ref([])
    const { currentStock, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, emptySkuList)
    initDefaultSpecs()
    selectSpec('color', 'color_silver')
    selectSpec('version', 'version_ultra')
    expect(currentStock.value).toBe(20)
  })

  it('无任何库存信息时默认 999', () => {
    const simpleSpecGroups = ref([
      {
        key: 'size',
        name: '尺寸',
        options: [
          { id: 'size_s', name: 'S' },
          { id: 'size_m', name: 'M' }
        ]
      }
    ])
    const emptySkuList = ref([])
    const { currentStock, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, simpleSpecGroups, emptySkuList)
    initDefaultSpecs()
    selectSpec('size', 'size_m')
    expect(currentStock.value).toBe(999)
  })

  it('maxQuantity = max(1, currentStock)', () => {
    const { maxQuantity, currentStock, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_silver')
    selectSpec('version', 'version_ultra')
    expect(currentStock.value).toBe(12)
    expect(maxQuantity.value).toBe(12)
  })

  it('库存为 0 时 maxQuantity 至少为 1', () => {
    const { maxQuantity, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_gold')
    selectSpec('version', 'version_standard')
    expect(maxQuantity.value).toBe(1)
  })

  it('increaseQty 不超过 maxQuantity', () => {
    const { quantity, increaseQty, maxQuantity, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_silver')
    selectSpec('version', 'version_ultra')
    expect(maxQuantity.value).toBe(12)
    for (let i = 0; i < 20; i++) {
      increaseQty()
    }
    expect(quantity.value).toBe(12)
  })

  it('decreaseQty 不低于 1', () => {
    const { quantity, decreaseQty, increaseQty, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_black')
    selectSpec('version', 'version_standard')
    increaseQty()
    increaseQty()
    expect(quantity.value).toBe(3)
    decreaseQty()
    decreaseQty()
    decreaseQty()
    decreaseQty()
    expect(quantity.value).toBe(1)
  })

  it('onQuantityChange 限制边界值', () => {
    const { quantity, onQuantityChange, selectSpec, initDefaultSpecs, maxQuantity } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_silver')
    selectSpec('version', 'version_ultra')
    quantity.value = -5
    onQuantityChange()
    expect(quantity.value).toBe(1)
    quantity.value = 999
    onQuantityChange()
    expect(quantity.value).toBe(maxQuantity.value)
  })

  it('切换规格后若数量超过新库存，自动调整数量', async () => {
    const { quantity, selectSpec, initDefaultSpecs, currentStock, increaseQty } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_black')
    selectSpec('version', 'version_standard')
    for (let i = 0; i < 50; i++) increaseQty()
    expect(quantity.value).toBe(51)
    selectSpec('color', 'color_silver')
    selectSpec('version', 'version_ultra')
    await new Promise(r => setTimeout(r, 10))
    expect(quantity.value).toBeLessThanOrEqual(currentStock.value)
    expect(quantity.value).toBe(12)
  })

  it('isSelected 正确判断选中状态', () => {
    const { isSelected, selectSpec, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    selectSpec('color', 'color_black')
    selectSpec('version', 'version_pro')
    expect(isSelected('color', 'color_black')).toBe(true)
    expect(isSelected('color', 'color_white')).toBe(false)
    expect(isSelected('version', 'version_pro')).toBe(true)
    expect(isSelected('version', 'version_ultra')).toBe(false)
  })

  it('initDefaultSpecs 自动选择有库存的规格', () => {
    const { selectedSpecs, initDefaultSpecs } = useProductSpec(basePrice, specGroups, skuList)
    initDefaultSpecs()
    expect(selectedSpecs.value.color).toBeDefined()
    expect(selectedSpecs.value.version).toBeDefined()
    expect(selectedSpecs.value.color).not.toBe('color_gold')
  })
})
