'use client';

import Link from 'next/link';
import { useAuth } from '@/context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut, User, UserCircle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const TopNavBar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const getUserInitials = () => {
    if (!user) return 'AV';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <nav className="p-4 flex flex-row justify-between items-center border-b">
      <Link href="/" className="text-xl font-semibold">
        Share-Note
      </Link>

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/notes')} className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              <span>My Notes</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/me')} className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login">
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" />
            Login
          </Button>
        </Link>
      )}
    </nav>
  );
};
