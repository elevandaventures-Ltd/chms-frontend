type BadgeProps = {
  children: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
};

export function Badge({ children, tone = 'default' }: BadgeProps) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>;
}

export default Badge;
