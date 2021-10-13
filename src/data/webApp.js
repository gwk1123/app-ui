import request from '@/utils/request'

// 查询
export function search(data) {
  return request({
    url: '/api/search',
    method: 'post',
    data: data
  })
}

export function keyword(data) {
  return request({
    url: '/api/keyword',
    method: 'post',
    data: data
  })
}


export function verify(data) {
  return request({
    url: '/api/verify',
    method: 'post',
    data: data
  })
}

