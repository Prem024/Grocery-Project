import React from 'react'
import BasePagination from '../UI/Pagination'

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination) return null
  return (
    <BasePagination
      page={pagination.page}
      pages={pagination.totalPages}
      onPage={onPageChange}
    />
  )
}

export default Pagination
