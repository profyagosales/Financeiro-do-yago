import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InsightCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  link?: string;
}

export default function InsightCard({ icon, title, desc, link }: InsightCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10"
        >
          <span className="text-emerald-500">{icon}</span>
          <div className="flex flex-col text-left">
            <span className="font-medium leading-none">{title}</span>
            <span className="text-sm text-neutral-300">{desc}</span>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        {link && (
          <div className="mt-4 text-right">
            <Link
              to={link}
              className="font-medium text-emerald-600 underline"
            >
              Abrir página
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
