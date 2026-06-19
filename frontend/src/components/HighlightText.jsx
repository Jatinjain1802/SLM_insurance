import React from 'react'

export default function HighlightText({ text, highlight }) {
  if (!text) return null
  if (!highlight || !highlight.trim()) {
    return <>{text}</>
  }
  
  const textStr = String(text)
  const searchStr = String(highlight).trim()
  
  // Safe regex escape
  const escapedHighlight = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = textStr.split(new RegExp(`(${escapedHighlight})`, 'gi'))
  
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchStr.toLowerCase() ? (
          <mark 
            key={index} 
            style={{ 
              backgroundColor: '#fef08a', 
              color: '#1f2937', 
              padding: '0 2px', 
              borderRadius: '2px' 
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}
