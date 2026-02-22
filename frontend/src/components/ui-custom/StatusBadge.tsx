import { PixelCheck, PixelX, PixelWarning } from './PixelIcons';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  showIcon?: boolean;
}

const variantConfig: Record<BadgeVariant, { icon: React.ReactNode; className: string }> = {
  success: {
    icon: <PixelCheck className="w-3 h-3" />,
    className: 'border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-success)]/10',
  },
  danger: {
    icon: <PixelX className="w-3 h-3" />,
    className: 'border-[var(--color-danger)] text-[var(--color-danger)] bg-[var(--color-danger)]/10',
  },
  warning: {
    icon: <PixelWarning className="w-3 h-3" />,
    className: 'border-[var(--color-warning)] text-[var(--color-warning)] bg-[var(--color-warning)]/10',
  },
  neutral: {
    icon: <span className="w-3 h-3">-</span>,
    className: 'border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)]',
  },
};

export function StatusBadge({ variant, label, showIcon = true }: StatusBadgeProps) {
  const config = variantConfig[variant];

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 pixel-text-sm 
        border-2 border-[var(--color-border)]
        ${config.className}
      `}
    >
      {showIcon && config.icon}
      {label}
    </span>
  );
}
