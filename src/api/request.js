const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const request = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(fullUrl, config)
    const data = await response.json()
    if (data.code !== 0) {
      throw new Error(data.message || '请求失败')
    }
    return data.data
  } catch (error) {
    console.error('请求错误:', error)
    throw error
  }
}

export const get = (url, params) => {
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : ''
  return request(url + queryString, { method: 'GET' })
}

export const post = (url, data) => {
  return request(url, {
    method: 'POST',
    body: data
  })
}

export default request
