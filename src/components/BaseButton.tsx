import { ReactNode } from 'react'

type BaseButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'text'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export default function BaseButton({
  children,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
  disabled,
}: BaseButtonProps) {
  const variants = {
    primary:
      'bg-primary text-surface border border-transparent shadow-lg cursor-pointer hover:bg-ocean hover:border hover:border-ocean',
    secondary:
      'border border-primary text-primary shadow-lg cursor-pointer hover:bg-ocean hover:text-surface hover:border-ocean',
    text: 'underline underline-offset-4 text-primary cursor-pointer text-shadow-lg hover:text-text',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variants[variant]} ${className}  px-6 py-3 rounded-lg text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}
