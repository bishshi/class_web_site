'use client'

import { useState, useEffect, ReactNode } from 'react'
import Toast from './Toast'

interface Position {
  x: number
  y: number
}

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
}

interface CustomContextMenuProps {
  children: ReactNode
}

export default function CustomContextMenu({ children }: CustomContextMenuProps) {
  const [menuPosition, setMenuPosition] = useState<Position>({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [selectedText, setSelectedText] = useState<string>('')
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })
  const [isDark, setIsDark] = useState(false)
  const [isArticlePage, setIsArticlePage] = useState(false)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type })
  }

  // 检测是否在文章页面
  useEffect(() => {
    setIsArticlePage(window.location.pathname.includes('/article/'))
  }, [])

  // 检测系统主题
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      
      const selection = window.getSelection()
      const text = selection?.toString() || ''
      setSelectedText(text)
      
      setMenuPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleClick = () => {
      if (isVisible) {
        setIsVisible(false)
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleClick)
    }
  }, [isVisible])

  const handleCopy = async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText)
        showToast('已复制到剪贴板', 'success')
      } catch (err) {
        const textarea = document.createElement('textarea')
        textarea.value = selectedText
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        showToast('已复制到剪贴板', 'success')
      }
    } else {
      showToast('请先选中要复制的文本', 'error')
    }
    setIsVisible(false)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        showToast(`已读取: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`, 'info')
      } else {
        showToast('剪贴板为空', 'info')
      }
    } catch (err) {
      showToast('无法读取剪贴板', 'error')
    }
    setIsVisible(false)
  }

  const handleDelete = () => {
    if (selectedText) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        selection.deleteFromDocument()
        showToast('已删除选中的文本', 'success')
      }
    } else {
      showToast('请先选中要删除的文本', 'error')
    }
    setIsVisible(false)
  }

  const handleSelectAll = () => {
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(document.body)
    selection?.removeAllRanges()
    selection?.addRange(range)
    showToast('已全选页面内容', 'info')
    setIsVisible(false)
  }

  const handleRandomArticle = async () => {
    setIsVisible(false)
    showToast('正在寻找随机文章...', 'info')
    
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
      const baseUrl = strapiUrl.endsWith('/') ? strapiUrl.slice(0, -1) : strapiUrl
      const apiUrl = `${baseUrl}/api/articles?pagination[pageSize]=100`
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      const articles = data.data
      
      if (!articles || articles.length === 0) {
        showToast('暂无文章', 'error')
        return
      }

      const randomArticle = articles[Math.floor(Math.random() * articles.length)]
      const documentId = randomArticle.documentId
      
      if (!documentId) {
        showToast('文章数据异常', 'error')
        return
      }

      showToast(`跳转: ${randomArticle.title}`, 'success')
      
      setTimeout(() => {
        window.location.href = `/article/${documentId}`
      }, 600)
      
    } catch (error) {
      console.error('随机文章错误:', error)
      showToast('获取失败', 'error')
    }
  }

  // 引用评论功能
  const handleQuoteComment = () => {
    if (!selectedText) {
      showToast('请先选中要引用的文本', 'error')
      setIsVisible(false)
      return
    }

    try {
      // 尝试多种方式查找 Twikoo 评论框
      let commentBox: HTMLTextAreaElement | null = null
      
      // 方式1: 通过 textarea.el-textarea__inner
      commentBox = document.querySelector('.el-textarea__inner') as HTMLTextAreaElement
      
      // 方式2: 通过 id 或其他选择器
      if (!commentBox) {
        commentBox = document.querySelector('textarea[placeholder*="评论"]') as HTMLTextAreaElement
      }
      
      // 方式3: 通过 Twikoo 的类名
      if (!commentBox) {
        commentBox = document.querySelector('.tk-input textarea') as HTMLTextAreaElement
      }

      if (commentBox) {
        // 格式化引用文本
        const quoteText = `> ${selectedText.split('\n').join('\n> ')}\n\n`
        
        // 获取当前内容
        const currentValue = commentBox.value
        
        // 插入引用文本
        if (currentValue) {
          commentBox.value = currentValue + '\n' + quoteText
        } else {
          commentBox.value = quoteText
        }
        
        // 触发输入事件（让 Vue 检测到变化）
        const event = new Event('input', { bubbles: true })
        commentBox.dispatchEvent(event)
        
        // 聚焦到评论框
        commentBox.focus()
        
        // 滚动到评论框
        commentBox.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        showToast('已引用到评论框', 'success')
      } else {
        showToast('未找到评论框', 'error')
        console.error('无法找到 Twikoo 评论框')
      }
    } catch (error) {
      console.error('引用评论失败:', error)
      showToast('引用失败', 'error')
    }
    
    setIsVisible(false)
  }

  const menuStyles = isDark ? {
    background: 'rgba(30, 30, 30, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  } : {
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(200, 200, 200, 0.3)',
  }

  return (
    <>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            ...menuStyles,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            minWidth: '180px',
            padding: '6px',
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <MenuItem 
              icon="📋" 
              label="复制" 
              onClick={handleCopy}
              disabled={!selectedText}
              isDark={isDark}
            />
            <MenuItem 
              icon="📄" 
              label="粘贴" 
              onClick={handlePaste}
              isDark={isDark}
            />
            <MenuItem 
              icon="🗑️" 
              label="删除" 
              onClick={handleDelete}
              disabled={!selectedText}
              isDark={isDark}
            />
            <div style={{ 
              height: '1px', 
              background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
              margin: '4px 8px' 
            }} />
            <MenuItem 
              icon="✅" 
              label="全选" 
              onClick={handleSelectAll}
              isDark={isDark}
            />
            <MenuItem 
              icon="🎲" 
              label="随机文章" 
              onClick={handleRandomArticle}
              isDark={isDark}
            />
            {/* 只在文章页面显示引用评论 */}
            {isArticlePage && (
              <>
                <div style={{ 
                  height: '1px', 
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
                  margin: '4px 8px' 
                }} />
                <MenuItem 
                  icon="💬" 
                  label="引用评论" 
                  onClick={handleQuoteComment}
                  disabled={!selectedText}
                  isDark={isDark}
                />
              </>
            )}
          </ul>
        </div>
      )}
      {children}
    </>
  )
}

function MenuItem({ 
  icon, 
  label, 
  onClick, 
  disabled = false,
  isDark = false
}: { 
  icon: string
  label: string
  onClick: () => void
  disabled?: boolean
  isDark?: boolean
}) {
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
  
  return (
    <li 
      onClick={disabled ? undefined : onClick}
      style={{
        padding: '10px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        opacity: disabled ? 0.5 : 1,
        color: isDark ? '#e0e0e0' : '#333',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span>{label}</span>
    </li>
  )
}