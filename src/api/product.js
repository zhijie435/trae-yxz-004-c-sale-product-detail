import { get } from './request'

export const getProductDetail = (productId) => {
  return get(`/api/product/${productId}`)
}

export const getProductSales = (productId) => {
  return get(`/api/product/${productId}/sales`)
}

export const getSkuStock = (productId, skuKey) => {
  return get(`/api/product/${productId}/stock`, { skuKey })
}

export const getProductDescription = (productId) => {
  return get(`/api/product/${productId}/description`)
}

export const stripHtmlTags = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}
