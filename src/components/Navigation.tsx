'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/home', label: 'ホーム', icon: '🏠' },
    { href: '/profile', label: 'プロフィール', icon: '👤' },
    { href: '/metrics', label: '実績', icon: '📊' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 text-xs ${
                pathname === item.href
                  ? 'text-blue-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}