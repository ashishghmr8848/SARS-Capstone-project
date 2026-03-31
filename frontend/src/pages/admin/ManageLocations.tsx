import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {locationsApi} from "@/api";
import type {Location} from "@/types";
import { toast } from "react-toastify";

export default function ManageLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLocation, setNewLocation] = useState({
    locationName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await locationsApi.getAll();
      setLocations(data.data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch locations");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await locationsApi.update(editingId, newLocation);
        toast.success("Location updated successfully");
      } else {
        await locationsApi.create(newLocation);
        toast.success("Location added successfully");
      }
      setNewLocation({
        locationName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      });
      setEditingId(null);
      fetchLocations();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error?.message || "Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  const handleEditInit = (location: Location) => {
    setNewLocation({
      locationName: location.locationName,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
    });
    setEditingId(location.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setNewLocation({
      locationName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      await locationsApi.delete(id);
      toast.success("Location deleted successfully");
      fetchLocations();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete location");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Locations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Location" : "Add New Location"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="loc-name">Name</Label>
                <Input
                  id="loc-name"
                  value={newLocation.locationName}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      locationName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="loc-address">Address</Label>
                <Input
                  id="loc-address"
                  value={newLocation.address}
                  onChange={(e) =>
                    setNewLocation({...newLocation, address: e.target.value})
                  }
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="loc-city">City</Label>
                <Input
                  id="loc-city"
                  value={newLocation.city}
                  onChange={(e) =>
                    setNewLocation({...newLocation, city: e.target.value})
                  }
                  required
                />
              </div>
                <div className="grid gap-1.5 flex-1">
                  <Label htmlFor="loc-state">State</Label>
                  <Input
                    id="loc-state"
                    value={newLocation.state}
                    onChange={(e) =>
                      setNewLocation({...newLocation, state: e.target.value})
                    }
                    required
                  />
                </div>
                <div className="grid gap-1.5 flex-1">
                  <Label htmlFor="loc-zip">Zip Code</Label>
                  <Input
                    id="loc-zip"
                  value={newLocation.zipCode}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, zipCode: e.target.value })
                    }
                    required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {editingId ? "Update Location" : "Add Location"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <div className="font-bold text-xl">All Locations</div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {locations.map((loc) => (
          <Card key={loc.id}>
            <CardHeader>
                <CardTitle>{loc.locationName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{loc.address}</p>
              <p className="text-sm text-muted-foreground mb-4">
                  {loc.city}, {loc.state} {loc.zipCode}
              </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditInit(loc)}
                  >
                    Edit
                  </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(loc.id)}
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
