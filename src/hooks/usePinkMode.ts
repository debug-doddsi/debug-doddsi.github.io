import { useState, useEffect } from 'react'

export function usePinkMode() {
  // Pink mode's toggle is hidden for now (strawberry matcha is the go-to
  // palette), so ignore any previously stored preference — otherwise a
  // returning visitor who'd switched to pink mode would be stuck on it with
  // no way to switch back. Restore the localStorage read once the toggle
  // is re-enabled (e.g. as part of a future light/dark mode switch).
  const [isPink, setIsPink] = useState<boolean>(false)

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
