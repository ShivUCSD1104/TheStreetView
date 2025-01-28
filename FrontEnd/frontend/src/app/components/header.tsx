'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();

  const isActiveLink = (path: string) => {
    return pathname === path ? 'shadow-inner shadow-gray-300 font-bold' : 'hover:shadow-inner';
  };

  return (
    <header className="bg-white p-4">
      <nav className="max-w-6xl mx-auto">
        
          <div className="flex justify-between items-center p-2">
            <div className="text-xl px-6 text-gray-300">
            <Link
                  href="/"
                  className={`text-xl px-6 py-3 text-gray-600 rounded-lg transition-all duration-300 
                  ${isActiveLink('/')}`}
                >
                  ////Pandera
                </Link>
              
            </div>
            <ul className="flex items-center space-x-4">
              <li>
                <Link
                  href="/models"
                  className={`px-6 py-3 rounded-lg transition-all duration-300 ${isActiveLink('/models')} 
                  text-gray-600`}
                >
                  Models
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className={`px-6 py-3 rounded-lg transition-all duration-300 ${isActiveLink('/projects')} 
                  text-gray-600`}
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/research"
                  className={`px-6 py-3 rounded-lg transition-all duration-300 ${isActiveLink('/research')} 
                  text-gray-600`}
                >
                  Research
                </Link>
              </li>
              <li>
                <Link
                  href="/code"
                  className={`px-6 py-3 rounded-lg transition-all duration-300 ${isActiveLink('/code')} 
                  text-gray-600`}
                >
                  Code
                </Link>
              </li>
            </ul>
          </div>
        
      </nav>
    </header>
  );
};

export default Header;
