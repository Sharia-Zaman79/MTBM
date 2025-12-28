import { useEffect, useState } from 'react'

const Toast = ({ message, duration = 4000, onClose }) => {
  const [visible, setVisible] = useState(!!message)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      onClose && onClose()
    }, duration)
    return () => clearTimeout(t)
  }, [message, duration, onClose])

  if (!message) return null

  return (
    <div
      className={`fixed right-6 top-6 z-50 transform transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      <div className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
        {message}
      </div>
    </div>
  )
}

export default Toast
