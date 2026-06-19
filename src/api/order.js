import { post } from './request'

export const createOrder = (params) => {
  return post('/api/order/create', params)
}

export const payOrder = (params) => {
  return post('/api/order/pay', params)
}
