import React from 'react';

type PageShellProps = {
  sidebar: React.ReactNode;
  topNav: React.ReactNode;
  children: React.ReactNode;
};

export function PageShell({ sidebar, topNav, children }: PageShellProps) {
  return (
    <div className="page-shell">
      <div className="shell-grid">
        <aside>{sidebar}</aside>

        <div className="shell-main">
          <div>{topNav}</div>

          <div className="shell-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default PageShell;
