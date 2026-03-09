import { ReactNode } from 'react'

type BaseButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'text';
}

export default function BaseButton({ children, onClick, variant = 'primary' }: BaseButtonProps) {
  const variants = {
    primary: 'bg-primary text-surface border border-transparent shadow-lg cursor-pointer hover:bg-ocean hover:border hover:border-ocean',
    secondary: 'border border-primary text-primary shadow-lg cursor-pointer hover:bg-ocean hover:text-surface hover:border-ocean',
    text: 'underline underline-offset-4 text-primary cursor-pointer text-shadow-lg hover:text-text',
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