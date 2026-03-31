import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { slotsApi } from "@/api";
import type { SlotConfiguration } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { toast } from "react-toastify";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function SlotConfigurationPage() {
  const [config, setConfig] = useState<SlotConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    availableDays: [] as number[],
    startTime: "",
    endTime: "",
    slotDurationMinutes: 30,
    slotsPerInterval: 1,
    bufferTimeMinutes: 0,
    advanceBookingDays: 90,
    sameDayBookingCutoffHours: 2,
    minAdvanceBookingHours: 24,
  });

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const response = await slotsApi.getSlotConfigurations();
      const configs = response.data;

      // Get the first active configuration (should only be one)
      const activeConfig =
        configs.find((c: SlotConfiguration) => c.isActive) || configs[0];

      if (activeConfig) {
        setConfig(activeConfig);
        setFormData({
          availableDays: activeConfig.availableDays,
          startTime: activeConfig.startTime.substring(0, 5), // HH:MM
          endTime: activeConfig.endTime.substring(0, 5), // HH:MM
          slotDurationMinutes: activeConfig.slotDurationMinutes,
          slotsPerInterval: activeConfig.slotsPerInterval,
          bufferTimeMinutes: activeConfig.bufferTimeMinutes,
          advanceBookingDays: activeConfig.advanceBookingDays,
          sameDayBookingCutoffHours: activeConfig.sameDayBookingCutoffHours,
          minAdvanceBookingHours: activeConfig.minAdvanceBookingHours,
        });
      }
    } catch (error) {
      console.error("Error fetching configuration:", error);
      toast.error(error.response?.data?.message || "Failed to fetch configuration");
    }
  };

  const handleDayToggle = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day].sort(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.availableDays.length === 0) {
      toast.error("Please select at least one available day");
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...formData,
        startTime: `${formData.startTime}:00`, // Add seconds
        endTime: `${formData.endTime}:00`, // Add seconds
      };

      if (config) {
        // Update existing configuration
        await slotsApi.updateSlotConfiguration(config.id, data);
        toast.success("Configuration updated successfully");
      } else {
        // Create new configuration
        await slotsApi.createSlotConfiguration(data);
        toast.success("Configuration created successfully");
      }

      await fetchConfiguration();
      setEditing(false);
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error(error.response?.data?.error?.message || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (config) {
      setFormData({
        availableDays: config.availableDays,
        startTime: config.startTime.substring(0, 5),
        endTime: config.endTime.substring(0, 5),
        slotDurationMinutes: config.slotDurationMinutes,
        slotsPerInterval: config.slotsPerInterval,
        bufferTimeMinutes: config.bufferTimeMinutes,
        advanceBookingDays: config.advanceBookingDays,
        sameDayBookingCutoffHours: config.sameDayBookingCutoffHours,
        minAdvanceBookingHours: config.minAdvanceBookingHours,
      });
    }
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Global Slot Configuration</h1>
        {config && !editing && (
          <Button onClick={() => setEditing(true)}>Edit Configuration</Button>
        )}
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          This is a global configuration that applies to all locations and
          appointment types. Changes here will affect the entire booking system.
        </AlertDescription>
      </Alert>

      {!config && !editing ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No slot configuration found. Create one to enable bookings.
              </p>
              <Button onClick={() => setEditing(true)}>
                Create Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : editing ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {config ? "Edit Configuration" : "Create Configuration"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Available Days */}
              <div className="space-y-3">
                <Label>Available Days</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DAYS.map((day) => (
                    <div
                      key={day.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={formData.availableDays.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <label
                        htmlFor={`day-${day.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Slot Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                  <Input
                    id="slotDuration"
                    type="number"
                    min="5"
                    step="5"
                    value={formData.slotDurationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slotDurationMinutes: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slotsPerInterval">Slots Per Interval</Label>
                  <Input
                    id="slotsPerInterval"
                    type="number"
                    min="1"
                    value={formData.slotsPerInterval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slotsPerInterval: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of concurrent appointments allowed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
                  <Input
                    id="bufferTime"
                    type="number"
                    min="0"
                    step="5"
                    value={formData.bufferTimeMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bufferTimeMinutes: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Time between appointments
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advanceBooking">Advance Booking (days)</Label>
                  <Input
                    id="advanceBooking"
                    type="number"
                    min="1"
                    value={formData.advanceBookingDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        advanceBookingDays: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    How far in advance users can book
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sameDayCutoff">Same-Day Cutoff (hours)</Label>
                  <Input
                    id="sameDayCutoff"
                    type="number"
                    min="0"
                    value={formData.sameDayBookingCutoffHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sameDayBookingCutoffHours: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum hours before appointment for same-day booking
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minAdvance">
                    Minimum Advance Notice (hours)
                  </Label>
                  <Input
                    id="minAdvance"
                    type="number"
                    min="0"
                    value={formData.minAdvanceBookingHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minAdvanceBookingHours: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum notice required for any booking
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Configuration"}
                </Button>
                {config && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Available Days</Label>
                <p className="font-medium">
                  {config?.availableDays
                    .map((d) => DAYS.find((day) => day.value === d)?.label)
                    .join(", ")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Operating Hours</Label>
                <p className="font-medium">
                  {config?.startTime.substring(0, 5)} -{" "}
                  {config?.endTime.substring(0, 5)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Slot Duration</Label>
                <p className="font-medium">
                  {config?.slotDurationMinutes} minutes
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Slots Per Interval
                </Label>
                <p className="font-medium">{config?.slotsPerInterval}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Buffer Time</Label>
                <p className="font-medium">
                  {config?.bufferTimeMinutes} minutes
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Advance Booking</Label>
                <p className="font-medium">{config?.advanceBookingDays} days</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Same-Day Cutoff</Label>
                <p className="font-medium">
                  {config?.sameDayBookingCutoffHours} hours
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Minimum Advance Notice
                </Label>
                <p className="font-medium">
                  {config?.minAdvanceBookingHours} hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
