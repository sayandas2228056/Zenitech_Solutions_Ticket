import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, User, LogOut, Settings, Bell } from 'lucide-react';
import logo from '../assets/Logo.jpg';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRefs = useRef({});
  const timeoutRef = useRef({});
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setShowNavbar(currentScrollY < lastScrollY || currentScrollY < 10);
    setLastScrollY(currentScrollY);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setActiveDropdown(null);
    setShowProfileMenu(false);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleMouseEnter = (name) => {
    if (timeoutRef.current[name]) {
      clearTimeout(timeoutRef.current[name]);
    }
    setHoveredDropdown(name);
  };

  const handleMouseLeave = (name) => {
    timeoutRef.current[name] = setTimeout(() => {
      setHoveredDropdown(null);
    }, 150);
  };

  const handleDropdownClick = (name, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDropdown = Object.values(dropdownRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );
      const isClickInsideProfile = profileMenuRef.current && profileMenuRef.current.contains(event.target);
      
      if (!isClickInsideDropdown) {
        setActiveDropdown(null);
      }
      if (!isClickInsideProfile) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      Object.values(timeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  const navItems = [
    { name: 'Home', link: '/' },
    { name: 'Back To Website', link: 'https://www.zenitech.in', target: '_blank', rel: 'noopener noreferrer' },
    { name: 'Raise an Issue', link: '/token' },
    { name: 'Dashboard', link: '/dashboard' },
  ];

  return (
    <nav
      className={`fixed w-full z-[1000] transition-all duration-500 ease-out border-b border-slate-200/60 bg-white ${
        showNavbar ? 'translate-y-0 shadow-lg' : '-translate-y-full shadow-none'
      } apple-navbar`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 h-16 md:h-18">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 min-w-[140px] md:min-w-[180px] group">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-orange-100 group-hover:ring-orange-200 transition-all duration-300 shadow-sm">
            <img src={logo} alt="Zenitech Solutions" className="h-full w-full object-cover" />
          </div>
          <div className="zenitech-brand text-orange-600 font-bold whitespace-nowrap group-hover:text-orange-700 transition-colors duration-300">
            Zenitech <span className='text-blue-700 group-hover:text-blue-800'>Solutions</span>
          </div>
        </a>

        {/* Nav Links (Desktop) */}
        <div className="hidden md:flex gap-1 items-center justify-center flex-1">
          {navItems.map((item) =>
            item.dropdown ? (
              <div 
                key={item.name} 
                className="relative"
                ref={(el) => (dropdownRefs.current[item.name] = el)}
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={() => handleMouseLeave(item.name)}
              >
                <button
                  onClick={(e) => handleDropdownClick(item.name, e)}
                  className={`apple-nav-link flex items-center gap-1 font-medium px-4 py-2.5 relative transition-all duration-300 rounded-xl ${
                    activeDropdown === item.name || hoveredDropdown === item.name
                      ? 'text-blue-600 bg-blue-50/80 shadow-sm scale-105'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50/80'
                  }`}
                >
                  {item.name}
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-300 ${
                      activeDropdown === item.name || hoveredDropdown === item.name ? 'rotate-180' : ''
                    }`}
                  />
                  <span className="apple-underline" />
                </button>
                
                <div 
                  className={`apple-dropdown absolute top-full left-1/2 -translate-x-1/2 bg-white/95 shadow-2xl rounded-2xl py-4 min-w-[280px] mt-2 border border-slate-200/50 transition-all duration-300 ${
                    activeDropdown === item.name || hoveredDropdown === item.name
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-4'
                  }`}
                >
                  {item.dropdown.map((sub, index) => (
                    <a
                      key={sub.name}
                      href={sub.link}
                      className="block px-6 py-3 text-sm text-slate-700 hover:bg-blue-50/80 hover:text-blue-600 transition-all duration-200 mx-2 rounded-xl"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full opacity-70"></span>
                        {sub.name}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                key={item.name}
                href={item.link}
                target={item.target}
                rel={item.rel}
                className="apple-nav-link font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50/80 px-4 py-2.5 relative transition-all duration-300 rounded-xl hover:scale-105"
              >
                {item.name}
                <span className="apple-underline" />
              </a>
            )
          )}
        </div>

        {/* User Actions (Desktop) */}
        <div className="flex items-center gap-3 min-w-[40px] md:min-w-[200px] justify-end">
          {user ? (
            <div className="hidden md:flex items-center gap-3">

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 pr-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-slate-700 hover:text-slate-900 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-medium text-sm hidden lg:block">
                    {user.name || 'User'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                <div className={`absolute top-full right-0 bg-white/95 shadow-2xl rounded-2xl py-3 min-w-[220px] mt-2 border border-slate-200/50 transition-all duration-300 ${
                  showProfileMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
                }`}>
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{user.name || 'User'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50/80 hover:text-blue-600 transition-all duration-200"
                  >
                    <User size={16} />
                    View Profile
                  </button>
                  
                  
                  
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <a
              href="/login"
              className="hidden md:inline-block apple-contact-btn px-6 py-3 text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sign In
            </a>
          )}
          
          <button 
            onClick={toggleMobileMenu} 
            className="md:hidden focus:outline-none p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all duration-300 hover:scale-110"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden apple-mobile-menu bg-white/95 border-t border-slate-200/60 backdrop-blur-xl">
          <div className="px-4 py-4 max-h-[80vh] overflow-y-auto">
            {user && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name || 'User'}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => { handleProfileClick(); toggleMobileMenu(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/80 hover:bg-white text-slate-700 rounded-xl font-medium text-sm transition-all duration-200"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => { handleLogout(); toggleMobileMenu(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-all duration-200"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}

            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.name} className="border-b border-slate-100 last:border-b-0">
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="flex justify-between items-center w-full text-left py-4 font-semibold text-slate-800 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span>{item.name}</span>
                    <ChevronDown
                      className={`transition-transform duration-300 ${
                        activeDropdown === item.name ? 'rotate-180 text-blue-600' : ''
                      }`}
                      size={18}
                    />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${
                      activeDropdown === item.name ? 'max-h-96 pb-4' : 'max-h-0'
                    }`}
                  >
                    <div className="pl-4 space-y-1">
                      {item.dropdown.map((sub) => (
                        <a
                          key={sub.name}
                          href={sub.link}
                          className="flex items-center gap-3 py-3 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 px-4 rounded-xl transition-all duration-200"
                          onClick={toggleMobileMenu}
                        >
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          {sub.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={item.name}
                  href={item.link}
                  target={item.target}
                  rel={item.rel}
                  className="block py-4 font-semibold text-slate-800 hover:text-blue-600 border-b border-slate-100 last:border-b-0 transition-colors duration-200"
                  onClick={toggleMobileMenu}
                >
                  {item.name}
                </a>
              )
            )}
            
            {!user && (
              <div className="pt-4">
                <a
                  href="/login"
                  className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:shadow-xl"
                  onClick={toggleMobileMenu}
                >
                  Sign In
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .apple-navbar {
          box-shadow: 0 4px 32px rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(226,232,240,0.6);
        }
        
        .apple-nav-link {
          position: relative;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: -0.01em;
        }
        
        .apple-underline {
          position: absolute;
          left: 50%;
          right: 50%;
          bottom: 6px;
          height: 2px;
          background: linear-gradient(90deg, #f97316 0%, #3b82f6 100%);
          border-radius: 2px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .apple-nav-link:hover .apple-underline {
          left: 12px;
          right: 12px;
        }
        
        .apple-dropdown {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          z-index: 50;
        }
        
        .apple-contact-btn {
          letter-spacing: -0.01em;
          border: 1px solid rgba(249, 115, 22, 0.2);
        }
        
        .apple-mobile-menu {
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.12);
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .zenitech-brand {
          font-size: 1.4rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
          font-weight: 700;
        }
        
        @media (min-width: 768px) {
          .zenitech-brand {
            font-size: 1.7rem;
          }
        }
        
        @media (max-width: 640px) {
          .zenitech-brand {
            font-size: 1.25rem;
          }
        }
        
        /* Custom scrollbar */
        .apple-mobile-menu::-webkit-scrollbar {
          width: 6px;
        }
        
        .apple-mobile-menu::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.5);
          border-radius: 3px;
        }
        
        .apple-mobile-menu::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.8);
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        
        .apple-mobile-menu::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.9);
        }
        
        
        /* Smooth hover animations */
        .apple-nav-link {
          transform-origin: center;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        /* Enhanced shadows */
        .apple-dropdown,
        [class*="shadow-2xl"] {
          box-shadow: 
            0 32px 64px -12px rgba(0, 0, 0, 0.15),
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;