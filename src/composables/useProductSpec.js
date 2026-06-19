import { ref, computed, watch } from 'vue'
import { getSkuStock } from '../api/product'

export function useProductSpec(basePrice, specGroups, skuList, options = {}) {
  const { productId = 1001, enableServerSync = false } = options

  const selectedSpecs = ref({})
  const quantity = ref(1)
  const loading = ref(false)

  const initDefaultSpecs = () => {
    const newSpecs = { ...selectedSpecs.value }
    specGroups.value.forEach(group => {
      const availableOption = group.options.find(opt => {
        if (skuList.value.length > 0) {
          return skuList.value.some(sku => {
            const skuParts = sku.key.split('-')
            return skuParts.includes(opt.id) && sku.stock > 0
          })
        }
        return opt.stock > 0
      })
      if (availableOption) {
        newSpecs[group.key] = availableOption.id
      }
    })
    selectedSpecs.value = newSpecs
  }

  const isSelected = (groupKey, optionId) => {
    return selectedSpecs.value[groupKey] === optionId
  }

  const selectSpec = (groupKey, optionId) => {
    selectedSpecs.value = {
      ...selectedSpecs.value,
      [groupKey]: optionId
    }
  }

  const selectedSpecText = computed(() => {
    const texts = []
    specGroups.value.forEach(group => {
      const selectedId = selectedSpecs.value[group.key]
      const option = group.options.find(opt => opt.id === selectedId)
      if (option) {
        texts.push(option.name)
      }
    })
    return texts.length > 0 ? texts.join('，') : '请选择规格'
  })

  const skuKey = computed(() => {
    return Object.values(selectedSpecs.value).join('-')
  })

  const matchedSku = computed(() => {
    if (skuList.value.length === 0) return null
    return skuList.value.find(sku => sku.key === skuKey.value) || null
  })

  const specPriceAdjust = computed(() => {
    if (matchedSku.value && matchedSku.value.priceAdjust !== undefined) {
      return matchedSku.value.priceAdjust
    }
    let adjust = 0
    specGroups.value.forEach(group => {
      const selectedId = selectedSpecs.value[group.key]
      const option = group.options.find(opt => opt.id === selectedId)
      if (option) {
        adjust += option.priceAdjust || 0
      }
    })
    return adjust
  })

  const unitPrice = computed(() => {
    return basePrice.value + specPriceAdjust.value
  })

  const currentStock = computed(() => {
    if (matchedSku.value) {
      return matchedSku.value.stock
    }
    let minStock = Infinity
    specGroups.value.forEach(group => {
      const selectedId = selectedSpecs.value[group.key]
      const option = group.options.find(opt => opt.id === selectedId)
      if (option && option.stock !== undefined) {
        minStock = Math.min(minStock, option.stock)
      }
    })
    return minStock === Infinity ? 999 : minStock
  })

  const maxQuantity = computed(() => {
    return Math.max(1, currentStock.value)
  })

  const totalPrice = computed(() => {
    return unitPrice.value * quantity.value
  })

  const decreaseQty = () => {
    if (quantity.value > 1) {
      quantity.value--
    }
  }

  const increaseQty = () => {
    if (quantity.value < maxQuantity.value) {
      quantity.value++
    }
  }

  const onQuantityChange = () => {
    if (quantity.value < 1) {
      quantity.value = 1
    } else if (quantity.value > maxQuantity.value) {
      quantity.value = maxQuantity.value
    }
  }

  const syncStockFromServer = async () => {
    if (!enableServerSync || !productId) return
    loading.value = true
    try {
      const data = await getSkuStock(productId, skuKey.value)
      if (matchedSku.value) {
        matchedSku.value.stock = data.stock
        matchedSku.value.priceAdjust = data.priceAdjust
      }
    } catch (error) {
      console.error('同步库存失败:', error)
    } finally {
      loading.value = false
    }
  }

  watch(selectedSpecs, () => {
    if (quantity.value > currentStock.value) {
      quantity.value = currentStock.value
    }
    if (enableServerSync) {
      syncStockFromServer()
    }
  }, { deep: true })

  return {
    selectedSpecs,
    quantity,
    loading,
    selectedSpecText,
    skuKey,
    matchedSku,
    specPriceAdjust,
    unitPrice,
    currentStock,
    maxQuantity,
    totalPrice,
    initDefaultSpecs,
    isSelected,
    selectSpec,
    decreaseQty,
    increaseQty,
    onQuantityChange,
    syncStockFromServer
  }
}
