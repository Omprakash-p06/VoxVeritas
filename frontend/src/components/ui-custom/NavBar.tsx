import { Link, useLocation } from 'react-router-dom';
import { useHealthPoll } from '@/hooks/useHealthPoll';
import { useTheme } from '@/store/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { 
  PixelTerminal, 
  PixelUpload, 
  PixelChat, 
  PixelShield,
  PixelMic
} from './PixelIcons';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/upload', label: 'UPLOAD', icon: <PixelUpload className="w-5 h-5" /> },
  { path: '/chat', label: 'CHAT', icon: <PixelChat className="w-5 h-5" /> },
  { path: '/voice', label: 'VOICE', icon: <PixelMic className="w-5 h-5" /> },
  { path: '/safety', label: 'SAFETY', icon: <PixelShield className="w-5 h-5" /> },
];

export function NavBar() {
  const location = useLocation();
  const { isOnline } = useHealthPoll(30000);
  const { theme } = useTheme();

  return (
    <nav 
      className="sticky top-0 z-50 border-b-4 border-[var(--color-border)] bg-[var(--color-bg)]"
      aria-label="Main navigation"
    >
      <div className="max-w-[1200px] mx-auto h-[64px] px-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <PixelTerminal className="w-7 h-7 text-[var(--color-primary)]" />
          <div className="flex flex-col">
            <span className="pixel-text-lg font-bold tracking-wider">
              VOXVERITAS
            </span>
            <span className="pixel-text-sm text-[var(--color-text-secondary)] -mt-1">
              v1.1.0 // {theme === 'dark' ? 'NIGHT' : 'DAY'}_MODE
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative px-4 py-2 flex items-center gap-2 pixel-text transition-all
                  ${isActive 
                    ? 'text-[var(--color-primary)]' 
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 text-[var(--color-primary)]">{'>'}</span>
                )}
                <span className={isActive ? 'text-[var(--color-primary)]' : ''}>
                  {item.icon}
                </span>
                <span className="tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Section - Theme Toggle & Status */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="flex items-center gap-2 px-3 py-1 border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
            <div 
              className={`w-3 h-3 border-2 border-[var(--color-border)] ${isOnline ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-danger)]'}`}
              aria-hidden="true"
            />
            <span className="pixel-text-sm tracking-wider">
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
