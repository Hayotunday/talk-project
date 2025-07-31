"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { signOut } from "@/lib/actions/auth.action";
import AuthDialog from "./auth-dialog";

export default function Navbar({ user }: { user: User | null }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully!");
      // Refresh the page to update the navbar and other server components
      router.refresh();
    } catch (error) {
      toast.error("Sign-out failed.");
      console.error(error);
    }
  };

  return (
    <header className="shadow">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between p-3 font-medium">
        <Link
          href="/"
          className="rounded-full flex items-center gap-2 text-center shadow shadow-gray-300 px-3 py-1.5"
        >
          {pathname !== "/" ? "Home" : "New meeting"}
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden sm:block">
              Welcome, {user.display_name || "User"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={user.photo_url || ""}
                    alt={user.display_name || ""}
                  />
                  <AvatarFallback>
                    {user.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history">History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <AuthDialog />
        )}
      </div>
    </header>
  );
}
