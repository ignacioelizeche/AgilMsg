'use client';

import { useState, ReactNode } from 'react';

interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  children: (active: string) => ReactNode;
}

export function Tabs({ tabs, children }: TabsProps) {
  const [active, setActive] = useState(tabs[0].id);

  return (
    <div>
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              active === tab.id
                ? 'border-accent text-primary'
                : 'border-transparent text-muted hover:text-primary'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
