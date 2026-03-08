import { ReactNode } from 'react'

type BaseButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'text';
}

export default function BaseButton({ children, onClick, variant = 'primary' }: BaseButtonProps) {
  const variants = {
    primary: 'bg-primary text-surface hover:bg-text',
    secondary: 'border border-primary text-primary hover:bg-background',
    text: 'underline underline-offset-4 text-primary cursor-pointer hover:text-text',
  }
  return (
    <button
    onClick={onClick}
    className={`${variants[variant]} px-6 py-3 rounded-lg text-sm uppercase transition-colors`}
    >
      {children}
    </button>
  )
}