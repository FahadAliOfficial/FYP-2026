/**
 * Toast notification hook with proper UI
 * 
 * Provides toast notifications that appear in the bottom-right corner
 */

import { useState, useCallback } from 'react'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

export type ToastActionElement = React.ReactElement<any>

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: 'default' | 'destructive'
  open?: boolean
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ToasterToast = Toast & {
  id: string
}

const listeners: Array<(state: ToasterToast[]) => void> = []
let memoryState: ToasterToast[] = []

function dispatch(toast: Omit<ToasterToast, 'id'>) {
  const id = genId()
  const newToast = { ...toast, id, open: true }
  
  memoryState = [newToast, ...memoryState].slice(0, TOAST_LIMIT)
  listeners.forEach((listener) => {
    listener(memoryState)
  })

  // Auto remove after delay
  setTimeout(() => {
    removeToast(id)
  }, TOAST_REMOVE_DELAY)

  return id
}

function removeToast(toastId: string) {
  memoryState = memoryState.filter((t) => t.id !== toastId)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export function useToast() {
  const [state, setState] = useState<ToasterToast[]>(memoryState)

  useState(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  })

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    return dispatch(props)
  }, [])

  return {
    toast,
    toasts: state,
    dismiss: removeToast,
  }
}
