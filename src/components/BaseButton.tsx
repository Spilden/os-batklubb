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
}

export default function BaseButton({
  children,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
  disabled,
  href,
}: BaseButtonProps) {
  const variants = {
    primary:
      'bg-primary text-surface border border-transparent shadow-lg cursor-pointer hover:bg-ocean hover:border hover:border-ocean px-6 py-3 rounded-lg text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'border border-primary text-primary shadow-lg cursor-pointer hover:bg-ocean hover:text-surface hover:border-ocean px-6 py-3 rounded-lg text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    text: 'underline underline-offset-4 text-primary cursor-pointer text-shadow-lg hover:text-text',
  }
  const classes = `${variants[variant]}${className ? ` ${className}` : ''}`
  if (href){
    console.log(classes)
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
