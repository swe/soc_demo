'use client'

import { ReactElement } from 'react'

import Icon from '@/components/ui/icon'

interface ToastProps {
  children: React.ReactNode
  className?: string
  type?: 'warning' | 'error' | 'success' | ''
  open: boolean
  setOpen: (open: boolean) => void
}

export default function Toast({
  children,
  className = '',
  type = '',
  open,
  setOpen
}: ToastProps) {

  const typeIcon = (type: string): ReactElement => {
    const cls = 'shrink-0 opacity-90 mt-[3px] mr-3 w-4 h-4'
    switch (type) {
      case 'warning':
        return <Icon name="warning-outline" className={cls} />
      case 'error':
        return <Icon name="close-circle-outline" className={cls} />
      case 'success':
        return <Icon name="checkmark-circle-outline" className={cls} />
      default:
        return <Icon name="information-circle-outline" className={cls} />
    }
  }

  const typeColor = (type: string): string => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500'
      case 'error':
        return 'bg-rose-500'
      case 'success':
        return 'bg-emerald-500'
      default:
        return 'bg-indigo-600'
    }
  }

  return (
    <>
      {open &&
        <div className={className} role="alert">
          <div className={`inline-flex min-w-[20rem] px-4 py-2 rounded-lg text-sm text-white ${typeColor(type)}`}>
            <div className="flex w-full justify-between items-start">
              <div className="flex">
                {typeIcon(type)}
                <div className="font-medium">
                {children}
                </div>
              </div>
              <button className="opacity-60 hover:opacity-70 ml-3 mt-[3px]" type="button" onClick={() => setOpen(false)}>
                <span className="sr-only">Close</span>
                <Icon name="close-outline" className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      }
    </>
  )
}