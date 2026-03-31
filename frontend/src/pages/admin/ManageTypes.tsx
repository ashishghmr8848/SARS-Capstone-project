import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {appointmentsApi} from "@/api";
import type { AppointmentType } from "@/types";
import { toast } from "react-toastify";

export default function ManageTypes() {
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [newType, setNewType] = useState({
    name: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const data = await appointmentsApi.getAll();
      setTypes(data.data);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch appointment types");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.name.trim()) {
      toast.error("Please enter a type name");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await appointmentsApi.update(editingId, {
          typeName: newType.name,
          description: newType.description,
        });
        toast.success("Appointment type updated successfully");
      } else {
        await appointmentsApi.create({
          typeName: newType.name,
          description: newType.description,
        });
        toast.success("Appointment type added successfully");
      }
      setNewType({ name: "", description: "" });
      setEditingId(null);
      fetchTypes();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error?.message || "Failed to save appointment type");
    } finally {
      setLoading(false);
    }
  };

  const handleEditInit = (type: AppointmentType) => {
    setNewType({
      name: type.typeName,
      description: type.description || "",
    });
    setEditingId(type.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setNewType({ name: "", description: "" });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment type?")) return;
    try {
      await appointmentsApi.delete(id);
      toast.success("Appointment type deleted successfully");
      fetchTypes();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete appointment type");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Appointment Types</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Type" : "Add New Type"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="type-name">Name</Label>
              <Input
                id="type-name"
                value={newType.name}
                onChange={(e) => setNewType({...newType, name: e.target.value})}
                required
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="type-desc">Description</Label>
              <Input
                id="type-desc"
                value={newType.description}
                onChange={(e) =>
                  setNewType({...newType, description: e.target.value})
                }
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="w-fit">
                {editingId ? "Update" : "Add"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="w-fit"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="">
        <div className="font-bold text-xl mb-4">
          All Appointment Types
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {types.map((type: AppointmentType) => (
          <Card key={type.id}>
            <CardHeader>
                <CardTitle>{type.typeName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {type.description || "No description"}
              </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditInit(type)}
                  >
                    Edit
                  </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(type.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
}
