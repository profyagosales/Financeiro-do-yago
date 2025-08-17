import { useNavigate } from 'react-router-dom';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export default function AvatarMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '';
  const avatarUrl = (user as any)?.user_metadata?.avatar_url as string | undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Abrir menu do usuário"
          className="flex h-12 w-12 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--clr)] text-white/80 hover:text-white hover:bg-white/10"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-white">
              {initials}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" forceMount>
        <div className="px-2 py-1 text-sm">
          <strong className="block truncate">
            {user?.user_metadata?.full_name || user?.email}
          </strong>
        </div>
        <DropdownMenuItem onSelect={() => navigate('/perfil')}>
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={signOut}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
