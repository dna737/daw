import { Link } from "react-router";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function Header(props: {title: string; links: {name: string, path: string, className: string}[], headerClassName?: string}) {
  
  const { title, links, headerClassName } = props;

  return (
      <div className={cn("flex justify-between w-full items-center", headerClassName ?? "")}>
        <h1 className="text-2xl font-bold">{title}</h1>

        <div className="flex gap-2">
          {links.map((link) => (
            <Link to={link.path} key={link.name}>
              <Button variant="outline" className={cn(link.className, "cursor-pointer")}>
                {link.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
  );
}
