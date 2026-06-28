import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Coffee, Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";

const EMPTY = { name: "", description: "", price: "", category: "", image: "", available: true };

export default function Admin() {
  const { user, logout } = useAuth();
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null); // null | "new" | foodObj
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const loadFoods = async () => {
    const { data } = await api.get("/foods");
    setFoods(data);
  };
  const loadOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (e) { toast.error(formatApiError(e)); }
  };

  useEffect(() => { loadFoods(); loadOrders(); }, []);

  const startNew = () => { setForm(EMPTY); setEditing("new"); };
  const startEdit = (f) => {
    setForm({ ...f, price: String(f.price) });
    setEditing(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editing === "new") {
        await api.post("/foods", payload);
        toast.success("Item added");
      } else {
        await api.put(`/foods/${editing.id}`, payload);
        toast.success("Item updated");
      }
      setEditing(null);
      loadFoods();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/foods/${id}`);
      toast.success("Deleted");
      loadFoods();
    } catch (err) { toast.error(formatApiError(err)); }
  };

  return (
    <div className="min-h-screen bg-etani-paper">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-etani-bg/80 border-b border-etani-line">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="h-6 w-6 text-etani-terracotta" />
            <span className="font-display text-2xl font-semibold text-etani-ink">Etani Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-etani-muted">{user?.email}</span>
            <Button asChild variant="ghost" className="text-etani-ink hover:bg-etani-paper" data-testid="back-to-site-button">
              <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />Back to site</Link>
            </Button>
            <Button onClick={logout} variant="outline" className="rounded-full border-etani-line" data-testid="admin-logout-button">
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <Tabs defaultValue="foods" className="w-full">
          <TabsList className="bg-white border border-etani-line rounded-full p-1 mb-8">
            <TabsTrigger value="foods" className="rounded-full px-6 data-[state=active]:bg-etani-ink data-[state=active]:text-white" data-testid="admin-tab-foods">
              Menu Items ({foods.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full px-6 data-[state=active]:bg-etani-ink data-[state=active]:text-white" data-testid="admin-tab-orders">
              Orders ({orders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foods">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl text-etani-ink">Menu Items</h2>
              <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
                <DialogTrigger asChild>
                  <Button onClick={startNew}
                    className="rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white"
                    data-testid="add-food-button">
                    <Plus className="h-4 w-4 mr-1" />Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-lg" data-testid="food-form-dialog">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-etani-ink">
                      {editing === "new" ? "Add menu item" : "Edit menu item"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={submit} className="space-y-3">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-white border-etani-line" data-testid="food-form-name" />
                    </div>
                    <div className="space-y-1">
                      <Label>Description</Label>
                      <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="bg-white border-etani-line min-h-[80px]" data-testid="food-form-description" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Price ($)</Label>
                        <Input required type="number" step="0.01" min="0" value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          className="bg-white border-etani-line" data-testid="food-form-price" />
                      </div>
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="bg-white border-etani-line" data-testid="food-form-category"
                          placeholder="Coffee, Burgers, ..." />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Image URL</Label>
                      <Input required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                        className="bg-white border-etani-line" data-testid="food-form-image" />
                    </div>
                    <Button type="submit" disabled={busy}
                      className="w-full rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white"
                      data-testid="food-form-submit">
                      {busy ? "Saving…" : (editing === "new" ? "Add Item" : "Save changes")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-white border border-etani-line rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-etani-line">
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foods.map((f) => (
                    <TableRow key={f.id} className="border-etani-line" data-testid={`admin-food-row-${f.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={f.image} alt={f.name} className="h-12 w-12 rounded-lg object-cover" />
                          <div>
                            <div className="font-medium text-etani-ink">{f.name}</div>
                            <div className="text-xs text-etani-muted line-clamp-1 max-w-xs">{f.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-etani-muted">{f.category}</TableCell>
                      <TableCell className="text-etani-terracotta font-medium">${f.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(f)} data-testid={`admin-edit-${f.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(f.id)}
                          className="text-etani-terracotta" data-testid={`admin-delete-${f.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <h2 className="font-display text-3xl text-etani-ink mb-6">Recent Orders</h2>
            {orders.length === 0 && <p className="text-etani-muted">No orders yet.</p>}
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-white border border-etani-line rounded-2xl p-5" data-testid={`admin-order-${o.id}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="font-medium text-etani-ink">{o.user_name} <span className="text-etani-muted">· {o.user_email}</span></div>
                      <div className="text-xs text-etani-muted">{new Date(o.created_at).toLocaleString()} · #{o.id.slice(-6).toUpperCase()}</div>
                    </div>
                    <div className="font-display text-2xl text-etani-terracotta">${o.total.toFixed(2)}</div>
                  </div>
                  <div className="mt-3 text-sm text-etani-muted">
                    {o.items.map((i, idx) => (
                      <span key={idx}>{i.quantity}× {i.name}{idx < o.items.length - 1 ? ", " : ""}</span>
                    ))}
                  </div>
                  {o.notes && <div className="mt-2 text-xs italic text-etani-muted">Note: {o.notes}</div>}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
