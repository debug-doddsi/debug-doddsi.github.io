import { useState, useEffect } from 'react'

export function usePinkMode() {
  const [isPink, setIsPink] = useState<boolean>(() => {
    return localStorage.getItem('pink-mode') === 'true'
  })

  useEffect(() => {
    const html = document.documentElement
    if (isPink) {
      html.classList.add('pink')
    } else {
      html.classList.remove('pink')
    }
    localStorage.setItem('pink-mode', String(isPink))
  }, [isPink])

  const toggle = () => setIsPink(prev => !prev)

  return { isPink, toggle }
}
