import { ReactNode } from 'react'
import Link from 'next/link'

type BaseButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'text'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  href?: string
  active?: boolean
}

export default function BaseButton({
  children,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
  disabled,
  href,
  active = false,
}: BaseButtonProps) {
  const variants = {
    primary: active
      ? 'bg-ocean text-surface border border-ocean shadow-lg cursor-pointer px-6 py-3 rounded-lg text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      : 'bg-primary text-surface border border-transparent shadow-lg cursor-pointer hover:bg-ocean hover:border hover:border-ocean px-6 py-3 rounded-lg text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: active
      ? 'border border-ocean bg-ocean text-surface shadow-lg cursor-pointer px-6 py-3 rounded-lg text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      : 'border border-primary text-primary shadow-lg cursor-pointer hover:bg-ocean hover:text-surface hover:border-ocean px-6 py-3 rounded-lg text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    text: active
      ? 'underline underline-offset-4 text-ocean font-semibold cursor-pointer text-shadow-lg'
      : 'underline underline-offset-4 text-primary cursor-pointer text-shadow-lg hover:text-text',
  }
  const classes = `${variants[variant]}${className ? ` ${className}` : ''}`
  if (href) {
    return (
      <Link className={`inline-block ${classes}`} href={href}>
        {children}
      </Link>
    )
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  )
}
