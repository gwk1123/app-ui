import request from '@/utils/request'

// 查询
export function search(data) {
  return request({
    url: '/api/search',
    method: 'post',
    data: data
  })
}
