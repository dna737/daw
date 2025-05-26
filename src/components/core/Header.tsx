import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { useAuth } from "../hooks";
import { LogOut } from "lucide-react";

export default function Header(props: {title: string; children: React.ReactNode, headerClassName?: string}) {
  const { title, children, headerClassName } = props;
  const { logout } = useAuth();

  return (
      <div className={cn("flex justify-between w-full items-center", headerClassName ?? "")}>
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
        
        <Link to="/logout" onClick={logout}>
          <Button variant="outline" className="cursor-pointer flex items-center gap-1">
            <span className="sm:hidden">
              <LogOut className="w-4 h-4" />
            </span>
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </Link>
      </div>
  );
}
