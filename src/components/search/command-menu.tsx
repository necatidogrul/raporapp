"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { routes } from "@/lib/routes";
import { Search } from "lucide-react";
import * as Icons from "lucide-react";

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "");
};

const categoryTitles = {
  ana: "Ana Sayfa",
  görevler: "Görevler",
  raporlar: "Raporlar",
  yönetim: "Yönetim",
  hesap: "Hesap",
};

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setInputValue("");
    setOpen(false);
    router.push(path);
  };

  const filteredRoutes = React.useMemo(() => {
    if (!inputValue) return [];

    const normalizedInput = normalizeString(inputValue);

    return routes.filter((route) => {
      const searchString = route.searchTerms
        .map((term) => normalizeString(term))
        .join(" ");

      return searchString.includes(normalizedInput);
    });
  }, [inputValue]);

  const groupedRoutes = React.useMemo(() => {
    const groups: { [key: string]: typeof routes } = {};

    filteredRoutes.forEach((route) => {
      if (!groups[route.category]) {
        groups[route.category] = [];
      }
      groups[route.category].push(route);
    });

    return groups;
  }, [filteredRoutes]);

  const DynamicIcon = ({ name }: { name?: string }) => {
    if (!name) return null;
    const IconComponent = (Icons as any)[
      name.charAt(0).toUpperCase() + name.slice(1)
    ];
    return IconComponent ? <IconComponent className="mr-2 h-4 w-4" /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <Command className="relative rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Görev veya rapor ara..."
            />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Command>
      </div>
      <DialogContent className="p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Arama</DialogTitle>
          <DialogDescription>Görev veya raporlarınızı arayın</DialogDescription>
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Görev veya rapor ara..."
              aria-label="Arama"
            />
          </div>
          <CommandList>
            <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
            {Object.entries(groupedRoutes).map(([category, routes]) => (
              <CommandGroup
                key={category}
                heading={
                  categoryTitles[category as keyof typeof categoryTitles]
                }
              >
                {routes.map((route) => (
                  <CommandItem
                    key={route.path}
                    value={route.searchTerms.join(" ")}
                    onSelect={() => handleSelect(route.path)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center">
                      <DynamicIcon name={route.icon} />
                      <div className="flex flex-col">
                        <span className="font-medium">{route.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {route.description}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
