import { Check, ChevronDown, ListFilter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

export interface TodoFilterOption {
  id: "all" | "active" | "completed";
  label: string;
  count: number;
}

interface TodoFilterMenuProps {
  options: TodoFilterOption[];
  selectedId: TodoFilterOption["id"];
  onSelect: (id: TodoFilterOption["id"]) => void;
}

const TodoFilterMenu: React.FC<TodoFilterMenuProps> = ({ options, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.id === selectedId) ?? options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="min-w-44 justify-between bg-card text-card-foreground"
      >
        <span className="flex items-center gap-2">
          <ListFilter size={16} /> {selectedOption.label} <span className="text-muted-foreground">{selectedOption.count}</span>
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Lọc task"
          className="absolute right-0 z-30 mt-2 min-w-52 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={selectedId === option.id}
              onClick={() => {
                onSelect(option.id);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition hover:bg-accent hover:text-accent-foreground"
            >
              <span>{option.label}</span>
              <span className="ml-4 flex items-center gap-2 text-muted-foreground">
                {option.count}
                {selectedId === option.id && <Check size={15} className="text-emerald-600 dark:text-emerald-400" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoFilterMenu;
