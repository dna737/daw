import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks";

export default function Header(props: {title: string; children: React.ReactNode, headerClassName?: string}) {
  const { title, children, headerClassName } = props;
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
      <div className={cn("flex justify-between w-full items-center", headerClassName ?? "")}>
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
        <Button variant="outline" className="cursor-pointer" onClick={() => {logout(); navigate("/logout")}}>Logout</Button>
      </div>
  );
}
