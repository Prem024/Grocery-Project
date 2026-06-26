import React from 'react'

const CategorySelect = ({ value, onChange, categories, className = '', register, name, required }) => {
  // If registered with react-hook-form, use the registration props, else use default state handler.
  if (register && name) {
    return (
      <select
        {...register(name, { required })}
        className={`input-field ${className}`}
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
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
      <option value="">All Categories</option>
      {categories.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}

export default CategorySelect
