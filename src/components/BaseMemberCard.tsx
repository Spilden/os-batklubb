import { JSX } from 'react'

type BaseCardProps = {
  className?: string
  title?: string
  content?: React.ReactNode
  footer?: string
  children?: JSX.Element
}

export function BaseMemberCard({ title, content, footer, className, children }: BaseCardProps) {
  return (
    <div className={`bg-surface p-4 rounded-xl w-full pl-8 shadow-sm ${className}`}>
      <h2 className="text-text-muted font-display text-xl italic pb-2">{title}</h2>
      <div>{content}</div>
      {children}
      <p>{footer}</p>
    </div>
  )
}
