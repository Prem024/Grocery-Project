import React from 'react'

const SupplierSelect = ({ value, onChange, suppliers, className = '', register, name }) => {
  if (register && name) {
    return (
      <select
        {...register(name)}
        className={`input-field ${className}`}
      >
        <option value="">Select supplier</option>
        {suppliers.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-field ${className}`}
    >
      <option value="">All Suppliers</option>
      {suppliers.map((s) => (
        <option key={s._id} value={s._id}>
          {s.name}
        </option>
      ))}
    </select>
  )
}

export default SupplierSelect
