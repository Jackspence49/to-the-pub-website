"use client"

import { Toaster } from 'sonner'

export function ToastProvider() {
  console.log("ToastProvider component rendered")
  
  return (
    <Toaster 
      position="top-right"
      richColors
      expand
      duration={5000}
      closeButton
    />
  )
}