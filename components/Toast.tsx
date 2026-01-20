'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 2000) // 2秒后自动关闭

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '✅'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success': return 'rgba(34, 197, 94, 0.9)'
      case 'error': return 'rgba(239, 68, 68, 0.9)'
      case 'info': return 'rgba(59, 130, 246, 0.9)'
      default: return 'rgba(34, 197, 94, 0.9)'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getColor(),
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '200px',
        animation: 'slideIn 0.3s ease-out',
        fontSize: '14px',
        fontWeight: '500',
      }}
    >
      <span style={{ fontSize: '18px' }}>{getIcon()}</span>
      <span>{message}</span>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}