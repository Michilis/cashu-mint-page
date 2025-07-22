import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, Info, Wallet, X } from 'lucide-react';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  isActive: (path: string) => boolean;
  menuRef: React.RefObject<HTMLDivElement>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose, isActive, menuRef }) => {
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50">
      {/* Transparent overlay to close menu on outside click */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />
      {/* Menu panel */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-full w-64 max-w-full bg-gray-900 border-l-4 border-brand-primary shadow-2xl p-6 flex flex-col space-y-6 animate-slide-in-right"
        style={{ pointerEvents: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
          aria-label="Close menu"
          onClick={onClose}
        >
          <X className="w-7 h-7" />
        </button>
        <nav className="flex flex-col space-y-6 mt-8">
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
              isActive('/') ? 'text-brand-primary bg-gray-800' : 'text-gray-200 hover:text-brand-primary hover:bg-gray-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-base font-semibold">Home</span>
          </Link>
          <Link
            to="/discover"
            onClick={onClose}
            className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
              isActive('/discover') ? 'text-brand-primary bg-gray-800' : 'text-gray-200 hover:text-brand-primary hover:bg-gray-800'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-base font-semibold">Discover</span>
          </Link>
          <a
            href="https://cashu.space"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-200 hover:text-brand-primary hover:bg-gray-800 transition-colors"
          >
            <Info className="w-5 h-5" />
            <span className="text-base font-semibold">More info</span>
          </a>
          <a
            href="https://docs.cashu.space/wallets"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-200 hover:text-brand-primary hover:bg-gray-800 transition-colors"
          >
            <Wallet className="w-5 h-5" />
            <span className="text-base font-semibold">Wallets</span>
          </a>
        </nav>
      </div>
      {/* Custom animation (Tailwind) */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
};

export default MobileMenu; 