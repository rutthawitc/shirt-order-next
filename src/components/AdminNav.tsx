'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, ShoppingBag } from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin',
      label: 'คำสั่งซื้อ',
      icon: ShoppingBag,
    },
    {
      href: '/admin/designs',
      label: 'จัดการแบบเสื้อ',
      icon: Package,
    },
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 h-16">
          <div className="text-lg font-semibold text-gray-900">
            Admin Dashboard
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
