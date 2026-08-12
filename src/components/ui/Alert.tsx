"use client";

/**
 * Alert — inline feedback component for form responses and status messages.
 *
 * Used on every form from Day 6 onward.
 *
 * Variants: info (default), success, warning, destructive
 * Supports an optional title, body text, and close action.
 */
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'destructive';

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
};

const ICONS: Record<AlertVariant, ReactNode> = {
  info:        <Info         size={16} aria-hidden="true" />,
  success:     <CheckCircle2 size={16} aria-hidden="true" />,
  warning:     <AlertTriangle size={16} aria-hidden="true" />,
  destructive: <XCircle      size={16} aria-hidden="true" />,
};

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  info:        'alert--info',
  success:     'alert--success',
  warning:     'alert--warning',
  destructive: 'alert--destructive',
};

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  return (
    <div
      role={variant === 'destructive' ? 'alert' : 'status'}
      aria-live={variant === 'destructive' ? 'assertive' : 'polite'}
      className={cn('alert', VARIANT_CLASSES[variant], className)}
    >
      <span className="alert__icon">{ICONS[variant]}</span>

      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        {children && <div className="alert__message">{children}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          className="alert__close"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default Alert;
