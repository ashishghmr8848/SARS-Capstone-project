import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { adminApi, slotsApi } from "@/api";
import { toast } from "react-toastify";
import { Calendar, Trash2, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SpecialDate {
    id: string;
    date: string;
    dateType: "HOLIDAY" | "CLOSURE" | "MODIFIED_HOURS";
    reason?: string;
    isClosed: boolean;
    modifiedStartTime?: string;
    modifiedEndTime?: string;
    appliesToAllLocations: boolean;
    appliesToAllAppointmentTypes: boolean;
    createdAt: string;
    updatedAt: string;
}

interface SlotConfiguration {
    id: string;
    advanceBookingDays: number;
    isActive?: boolean;
}

export default function SpecialDates() {
    const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [advanceBookingDays, setAdvanceBookingDays] = useState(90);
    const [formData, setFormData] = useState({
        date: "",
        dateType: "HOLIDAY" as "HOLIDAY" | "CLOSURE" | "MODIFIED_HOURS",
        reason: "",
        isClosed: true,
        modifiedStartTime: "",
        modifiedEndTime: "",
        appliesToAllLocations: true,
        appliesToAllAppointmentTypes: true,
    });

    useEffect(() => {
        fetchSpecialDates();
        fetchSlotConfiguration();
    }, []);

    const fetchSlotConfiguration = async () => {
        try {
            const response = await slotsApi.getSlotConfigurations();
            const configs = response.data;
            const activeConfig = configs.find((c: SlotConfiguration) => c.isActive === true) || configs[0];
            if (activeConfig) {
                setAdvanceBookingDays(activeConfig.advanceBookingDays);
            }
        } catch (error) {
            console.error("Error fetching slot configuration:", error);
        }
    };

    const fetchSpecialDates = async () => {
        try {
            const response = await adminApi.getSpecialDates();
            setSpecialDates(response.data || []);
        } catch (error) {
            console.error("Error fetching special dates:", error);
            toast.error("Failed to fetch special dates");
        }
    };

    const getMaxDate = () => {
        const today = new Date();
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + advanceBookingDays);
        return maxDate.toISOString().split("T")[0];
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                date: formData.date,
                dateType: formData.dateType,
                reason: formData.reason || undefined,
                isClosed: formData.dateType === "MODIFIED_HOURS" ? false : formData.isClosed,
                modifiedStartTime:
                    formData.dateType === "MODIFIED_HOURS" && formData.modifiedStartTime
                        ? `${formData.modifiedStartTime}:00`
                        : undefined,
                modifiedEndTime:
                    formData.dateType === "MODIFIED_HOURS" && formData.modifiedEndTime
                        ? `${formData.modifiedEndTime}:00`
                        : undefined,
                appliesToAllLocations: formData.appliesToAllLocations,
                appliesToAllAppointmentTypes: formData.appliesToAllAppointmentTypes,
            };

            await adminApi.createSpecialDate(data);
            toast.success("Special date added successfully");
            setShowForm(false);
            resetForm();
            await fetchSpecialDates();
        } catch (error) {
            console.error("Error creating special date:", error);
            const err = error as { response?: { data?: { error?: { message?: string } } } };
            toast.error(err.response?.data?.error?.message || "Failed to add special date");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this special date?")) {
            return;
        }

        try {
            await adminApi.deleteSpecialDate(id);
            toast.success("Special date deleted successfully");
            await fetchSpecialDates();
        } catch (error) {
            console.error("Error deleting special date:", error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to delete special date");
        }
    };

    const resetForm = () => {
        setFormData({
            date: "",
            dateType: "HOLIDAY",
            reason: "",
            isClosed: true,
            modifiedStartTime: "",
            modifiedEndTime: "",
            appliesToAllLocations: true,
            appliesToAllAppointmentTypes: true,
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getDateTypeLabel = (type: string) => {
        switch (type) {
            case "HOLIDAY":
                return "Holiday";
            case "CLOSURE":
                return "Closure";
            case "MODIFIED_HOURS":
                return "Modified Hours";
            default:
                return type;
        }
    };

    const getDateTypeBadgeColor = (type: string) => {
        switch (type) {
            case "HOLIDAY":
                return "bg-blue-100 text-blue-800";
            case "CLOSURE":
                return "bg-red-100 text-red-800";
            case "MODIFIED_HOURS":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Special Dates</h1>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Special Date
                    </Button>
                )}
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Special dates can only be added up to {advanceBookingDays} days in advance (based on your advance booking configuration).
                    Users will not be able to book appointments on dates marked as closed.
                </AlertDescription>
            </Alert>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Special Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        min={getMinDate()}
                                        max={getMaxDate()}
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date: e.target.value })
                                        }
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Can only add dates up to {advanceBookingDays} days in advance
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateType">Type *</Label>
                                    <Select
                                        value={formData.dateType}
                                        onValueChange={(value: "HOLIDAY" | "CLOSURE" | "MODIFIED_HOURS") =>
                                            setFormData({ ...formData, dateType: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HOLIDAY">Holiday</SelectItem>
                                            <SelectItem value="CLOSURE">Closure</SelectItem>
                                            <SelectItem value="MODIFIED_HOURS">Modified Hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Input
                                    id="reason"
                                    type="text"
                                    placeholder="e.g., Christmas Day, Staff Training"
                                    value={formData.reason}
                                    onChange={(e) =>
                                        setFormData({ ...formData, reason: e.target.value })
                                    }
                                />
                            </div>

                            {formData.dateType === "MODIFIED_HOURS" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="modifiedStartTime">Modified Start Time</Label>
                                        <Input
                                            id="modifiedStartTime"
                                            type="time"
                                            value={formData.modifiedStartTime}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    modifiedStartTime: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="modifiedEndTime">Modified End Time</Label>
                                        <Input
                                            id="modifiedEndTime"
                                            type="time"
                                            value={formData.modifiedEndTime}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    modifiedEndTime: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.dateType !== "MODIFIED_HOURS" && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isClosed"
                                        checked={formData.isClosed}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isClosed: checked as boolean })
                                        }
                                    />
                                    <label
                                        htmlFor="isClosed"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Mark as closed (no bookings allowed)
                                    </label>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="appliesToAllLocations"
                                        checked={formData.appliesToAllLocations}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                appliesToAllLocations: checked as boolean,
                                            })
                                        }
                                    />
                                    <label
                                        htmlFor="appliesToAllLocations"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Applies to all locations
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="appliesToAllAppointmentTypes"
                                        checked={formData.appliesToAllAppointmentTypes}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                appliesToAllAppointmentTypes: checked as boolean,
                                            })
                                        }
                                    />
                                    <label
                                        htmlFor="appliesToAllAppointmentTypes"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Applies to all appointment types
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Adding..." : "Add Special Date"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Special Dates List</CardTitle>
                </CardHeader>
                <CardContent>
                    {specialDates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No special dates configured</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {specialDates
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map((specialDate) => (
                                    <div
                                        key={specialDate.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <h3 className="font-semibold">
                                                    {formatDate(specialDate.date)}
                                                </h3>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDateTypeBadgeColor(
                                                        specialDate.dateType
                                                    )}`}
                                                >
                                                    {getDateTypeLabel(specialDate.dateType)}
                                                </span>
                                                {specialDate.isClosed && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Closed
                                                    </span>
                                                )}
                                            </div>
                                            {specialDate.reason && (
                                                <p className="text-sm text-muted-foreground ml-8">
                                                    {specialDate.reason}
                                                </p>
                                            )}
                                            {specialDate.dateType === "MODIFIED_HOURS" &&
                                                specialDate.modifiedStartTime &&
                                                specialDate.modifiedEndTime && (
                                                    <p className="text-sm text-muted-foreground ml-8">
                                                        Modified hours: {specialDate.modifiedStartTime.substring(0, 5)} -{" "}
                                                        {specialDate.modifiedEndTime.substring(0, 5)}
                                                    </p>
                                                )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(specialDate.id)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
