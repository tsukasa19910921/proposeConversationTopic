'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, TrendingUp } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/home', label: 'ホーム', icon: Home },
    { href: '/profile', label: 'プロフィール', icon: User },
    { href: '/metrics', label: '実績', icon: TrendingUp },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* ガラスモーフィズム背景 */}
      <div className="backdrop-blur-xl bg-white/10 border-t border-white/20">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-6 rounded-2xl transition-all duration-300 transform
                    ${isActive
                      ? 'scale-110 bg-white/20'
                      : 'hover:scale-105 hover:bg-white/10'
                    }`}
                >
                  <div className={`p-2 rounded-full transition-all duration-300
                    ${isActive
                      ? 'bg-gradient-to-r from-app-violet to-app-teal shadow-lg shadow-app-teal/50'
                      : 'bg-white/10'
                    }`}>
                    <Icon
                      className={`w-5 h-5 transition-colors duration-300
                        ${isActive ? 'text-white' : 'text-white/70'}`}
                    />
                  </div>
                  <span className={`text-xs mt-1 font-medium transition-colors duration-300
                    ${isActive
                      ? 'text-white font-bold'
                      : 'text-white/70'
                    }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-app-violet to-app-teal rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}