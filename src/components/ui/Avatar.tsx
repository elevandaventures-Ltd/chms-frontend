type AvatarProps = {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function Avatar({ name = '', src, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dims = size === 'sm' ? 28 : size === 'lg' ? 64 : 44;

  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} style={{ width: dims, height: dims, borderRadius: '999px' }} />
  ) : (
    <div className="sidebar__avatar" style={{ width: dims, height: dims, borderRadius: '999px' }}>{initials}</div>
  );
}

export default Avatar;
