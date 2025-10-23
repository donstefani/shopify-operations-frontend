import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Users, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Events', href: '/events', icon: Bell },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-card border-r">
      <div className="flex items-center h-16 px-6 border-b">
        <h1 className="text-xl font-bold">Shopify Ops</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Demo Store</p>
          <p>don-stefani-demo-store</p>
        </div>
      </div>
    </div>
  );
}

