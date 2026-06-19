import { post } from './request'

export const createOrder = (params) => {
  return post('/api/order/create', params)
}
