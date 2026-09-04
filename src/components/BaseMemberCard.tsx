import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type BaseCardProps = {
  className?: string
  title?: string
  badge?: ReactNode
  content?: React.ReactNode
  footer?: ReactNode
  children?: ReactNode
}

export function BaseMemberCard({ title, badge, content, footer, className, children }: BaseCardProps) {
  return (
    <div className={twMerge(`bg-surface p-4 rounded-xl w-full pl-8 pr-6 shadow-sm flex flex-col justify-between`, className)}>
      <div>
        {(title || badge) && (
          <div className="flex items-center justify-between pb-2 gap-2">
            {title && <h2 className="text-text-muted font-display text-xl italic">{title}</h2>}
            {badge && (
              <span className="text-xs font-sans font-medium px-2.5 py-0.5 rounded-full bg-sand/30 text-text-muted border border-border shrink-0">
                {badge}
              </span>
            )}
          </div>
        )}
        {content && <div>{content}</div>}
        {children}
      </div>
      {footer && <div className="text-sm text-text-muted mt-2">{footer}</div>}
    </div>
  )
}
