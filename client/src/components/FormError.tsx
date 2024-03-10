import React from 'react'

export default function FormError({message}: {message?: string}) {
    if (!message) return null;
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">❌ Error! {" "} </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  )
}
