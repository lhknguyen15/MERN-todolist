import { FormEvent, useEffect, useState } from "react";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Category, CategoryColor, categoryColors } from "../../types/category";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { toast } from "react-toastify";

interface CategoryManagerProps {
  categories: Category[];
  todoCounts: Record<string, number>;
  onCreate: (name: string, color: CategoryColor) => Promise<void>;
  onUpdate: (id: string, name: string, color: CategoryColor) => Promise<void>;
  onDelete: (category: Category) => Promise<void>;
}

const CategoryManager = ({ categories, todoCounts, onCreate, onUpdate, onDelete }: CategoryManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<CategoryColor>("emerald");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(editing?.name ?? "");
      setColor(editing?.color ?? "emerald");
    }
  }, [editing, isOpen]);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setIsOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, name.trim(), color);
      else await onCreate(name.trim(), color);
      setIsOpen(false);
    } catch (error) {
      console.error("Không thể lưu danh mục:", error);
      toast.error("Không thể lưu danh mục. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Danh mục công việc</h2>
          <p className="mt-1 text-sm text-muted-foreground">Nhóm công việc theo dự án, chủ đề hoặc mục tiêu của bạn.</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-500 text-white hover:bg-emerald-600"><Plus size={17} /> Tạo danh mục</Button>
      </div>

      {categories.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><FolderOpen size={23} /></span>
            <h3 className="font-semibold">Chưa có danh mục</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">Tạo danh mục đầu tiên để phân loại công việc và lọc danh sách nhanh hơn.</p>
            <Button variant="outline" className="mt-5" onClick={openCreate}><Plus size={16} /> Tạo danh mục</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Danh mục</th>
                    <th scope="col" className="px-5 py-3 font-medium">Số công việc</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {categories.map((category) => {
                    const colorOption = categoryColors.find((item) => item.id === category.color) ?? categoryColors[0];
                    return (
                      <tr key={category.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-5 py-3.5">
                          <span className={"inline-flex max-w-full items-center gap-2 rounded-md border px-2.5 py-1 font-medium " + colorOption.badge}>
                            <span className={"size-2 shrink-0 rounded-full " + colorOption.dot} />
                            <span className="truncate">{category.name}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {todoCounts[category.id] ?? 0}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" aria-label={"Sửa danh mục " + category.name} onClick={() => openEdit(category)}>
                              <Pencil size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label={"Xóa danh mục " + category.name} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => setDeleting(category)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-2xl p-6 sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Sửa danh mục" : "Tạo danh mục"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="category-name" className="text-sm font-medium">Tên danh mục</label>
              <Input id="category-name" value={name} maxLength={40} autoFocus onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Công việc, Cá nhân" disabled={saving} />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Màu sắc</legend>
              <div className="grid grid-cols-3 gap-2">
                {categoryColors.map((option) => (
                  <button key={option.id} type="button" aria-pressed={color === option.id} onClick={() => setColor(option.id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${color === option.id ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-input"}`}>
                    <span className={`size-3 rounded-full ${option.dot}`} />{option.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>Hủy</Button>
              <Button type="submit" className="bg-emerald-500 text-white hover:bg-emerald-600" disabled={!name.trim() || saving}>{editing ? "Lưu thay đổi" : "Tạo danh mục"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="rounded-2xl p-6 sm:max-w-md">
          <DialogHeader><DialogTitle>Xóa danh mục?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{deleting ? `Các công việc trong “${deleting.name}” vẫn được giữ lại và chuyển thành chưa phân loại.` : ""}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Hủy</Button>
            <Button variant="destructive" onClick={async () => {
              if (!deleting) return;
              try {
                await onDelete(deleting);
                setDeleting(null);
              } catch (error) {
                console.error("Không thể xóa danh mục:", error);
                toast.error("Không thể xóa danh mục. Vui lòng thử lại.");
              }
            }}>Xóa danh mục</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
