import { useEffect, useState } from 'react';
import { Clock, Compass, Crosshair, GitCompareArrows, History, Info, LogOut } from 'lucide-react';
import type { Page } from '@/types';

const pages = [
  { key: 'mission-control', label: 'Mission control', icon: Crosshair },
  { key: 'search-analysis', label: 'Search analysis', icon: GitCompareArrows },
  { key: 'mission-history', label: 'Mission history', icon: History },
  { key: 'about', label: 'About', icon: Info },
] as const;

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
  userEmail?: string;
  canSignIn: boolean;
}

export default function TopNav({ currentPage, onNavigate, onSignOut, userEmail, canSignIn }: Props) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="command-header">
      <div className="command-header-inner">
        <button className="wordmark" onClick={() => onNavigate('mission-control')} aria-label="AeroSAR mission control">
          <span className="brand-icon"><Compass size={21} strokeWidth={1.8} /></span>
          <span>AERO<span className="brand-accent">SAR</span></span>
        </button>
        <nav className="command-nav" aria-label="Workspace">
          {pages.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => onNavigate(key)} aria-current={currentPage === key ? 'page' : undefined}>
              <Icon size={15} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="command-account">
          <span className="utc-clock"><Clock size={14} />{time.toISOString().slice(11, 19)} UTC</span>
          {(userEmail || canSignIn) &&
            <button className="light-button" onClick={onSignOut} title={userEmail}>
              <LogOut size={14} />{userEmail ? 'Sign out' : 'Sign in'}
            </button>
          }
        </div>
      </div>
    </header>
  );
}
