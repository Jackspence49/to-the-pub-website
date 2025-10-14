"use client"

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        style: {
          background: '#333333', // charcoal-gray
          border: '1px solid #E0E0E0', // light-gray
          color: '#FFFFFF', // white text
          fontFamily: 'inherit',
        },
        className: 'toast-notification',
      }}
    />
  )
}