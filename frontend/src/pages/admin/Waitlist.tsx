import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { waitlistApi, locationsApi, appointmentsApi } from "@/api";
import type { WaitlistEntry, Location, AppointmentType } from "@/types";
import { Loader2 } from "lucide-react";

export default function Waitlist() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [locationId, setLocationId] = useState<string>("all");
  const [appointmentTypeId, setAppointmentTypeId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const fetchWaitlist = useCallback(async () => {
    setLoading(true);
    try {
      const params: { locationId?: string; appointmentTypeId?: string; status?: string } = {};
      if (locationId && locationId !== "all") params.locationId = locationId;
      if (appointmentTypeId && appointmentTypeId !== "all") params.appointmentTypeId = appointmentTypeId;
      if (status && status !== "all") params.status = status;

      const response = await waitlistApi.getAll(params);
      setEntries(response.data.data);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      toast.error(error.response?.data?.message || "Failed to fetch waitlist");
    } finally {
      setLoading(false);
    }
  }, [locationId, appointmentTypeId, status]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  const fetchInitialData = async () => {
    try {
      const [locsRes, typesRes] = await Promise.all([
        locationsApi.getAll(),
        appointmentsApi.getAll(),
      ]);
      setLocations(locsRes.data);
      setAppointmentTypes(typesRes.data);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
      toast.error("Failed to load filter options");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING":
        return <Badge variant="secondary">Waiting</Badge>;
      case "NOTIFIED":
        return <Badge className="bg-blue-500">Notified</Badge>;
      case "CONVERTED":
        return <Badge className="bg-green-500">Converted</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive">Expired</Badge>;
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="">
        <h1 className="text-3xl font-bold tracking-tight">Waitlist</h1>
        <p className="text-muted-foreground">
          Manage users waiting for appointment slots.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries</CardTitle>
          <CardDescription>
            View and filter current waitlist entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-50">
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.locationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-50">
              <Select value={appointmentTypeId} onValueChange={setAppointmentTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.typeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-50">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="WAITING">Waiting</SelectItem>
                  <SelectItem value="NOTIFIED">Notified</SelectItem>
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type / Location</TableHead>
                  <TableHead>Preferred Dates</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {format(new Date(entry.joinedAt), "MMM d, yyyy")}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(entry.joinedAt), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {entry.firstName} {entry.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{entry.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {entry.appointmentType?.typeName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.location?.locationName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.preferredDateStart ? (
                          <>
                            {format(new Date(entry.preferredDateStart), "MMM d")}
                            {entry.preferredDateEnd &&
                              entry.preferredDateEnd !== entry.preferredDateStart &&
                              ` - ${format(new Date(entry.preferredDateEnd), "MMM d")}`}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Any</span>
                        )}
                        {entry.notes && (
                          <div className="text-xs text-muted-foreground mt-1 truncate max-w-37.5" title={entry.notes}>
                            Note: {entry.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
