import {useState, useEffect, useMemo} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {appointmentsApi, locationsApi, bookingsApi, slotsApi} from "@/api";
import type {AppointmentType, Location, AvailableSlot, Booking} from "@/types";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import {toast} from "react-toastify";
import {Loader2, Search, ChevronDown, ChevronUp} from "lucide-react";
import {Input} from "@/components/ui/input";
import {WaitlistModal} from "@/components/dashboard/WaitlistModal";

export default function BookAppointment() {
  const locationState = useLocation();
  const navigate = useNavigate();
  const flow = locationState.state?.flow || "type"; // "type" | "location"
  const [step, setStep] = useState(1);
  const [appointmentTypes, setAppointmentTypes] = useState<
    AppointmentType[] | null
  >(null);
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "zip">("name");
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[] | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Selection State
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );
  const [specialDateInfo, setSpecialDateInfo] = useState<{
    dateType: string;
    reason?: string;
    isClosed: boolean;
  } | null>(null);
  const [slotConfig, setSlotConfig] = useState<{
    availableDays: number[];
  } | null>(null);

  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  const groupedSlots = useMemo(() => {
    const groups: {label: string; slots: AvailableSlot[]}[] = [];

    availableSlots?.forEach((slot) => {
      const [hourStr] = slot.time.split(":");
      const hour = parseInt(hourStr, 10);

      const d = new Date();
      d.setHours(hour, 0, 0, 0);
      const label = format(d, "h a"); // "10 AM"

      let group = groups.find((g) => g.label === label);
      if (!group) {
        group = {label, slots: []};
        groups.push(group);
      }
      group.slots.push(slot);
    });

    return groups;
  }, [availableSlots]);

  const fetchTypes = async (query = "") => {
    setTypesLoading(true);
    try {
      const params = query ? {search: query} : {};
      const response = await appointmentsApi.getAll(params);
      // Backend already filters by isActive: true
      setAppointmentTypes(response.data);
    } catch (error) {
      console.error("Error fetching types:", error);
      toast.error("Failed to load service types.");
    } finally {
      setTypesLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTypes(searchQuery);
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLocations = async (query = "") => {
    setLocationsLoading(true);
    try {
      const params: {
        locationName?: string;
        zipCode?: string;
      } = {};
      if (query) {
        if (searchType === "name") {
          params.locationName = query;
        } else {
          params.zipCode = query;
        }
      }

      const response = await locationsApi.getAll(params);

      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations.");
    } finally {
      setLocationsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLocations(locationSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [locationSearchQuery, searchType]);

  useEffect(() => {
    if (selectedType && selectedLocation && date) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        setSelectedTime(null);
        setSpecialDateInfo(null);
        try {
          const formattedDate = format(date, "yyyy-MM-dd");
          const response = await slotsApi.getAvailable({
            locationId: selectedLocation.id,
            appointmentTypeId: selectedType.id,
            startDate: formattedDate,
            endDate: formattedDate,
          });
          console.log(response);
          setAvailableSlots(response.data);

          // Fetch slot configuration to check available days
          try {
            const slotConfigResponse = await slotsApi.getSlotConfigurations();
            const configs = slotConfigResponse.data || [];
            const activeConfig =
              configs.find((c: {isActive?: boolean}) => c.isActive === true) ||
              configs[0];
            if (activeConfig) {
              setSlotConfig({
                availableDays: activeConfig.availableDays || [],
              });
            }
          } catch (error) {
            console.error("Error fetching slot configuration:", error);
          }

          // Fetch special dates to check if selected date is special
          try {
            const specialDatesResponse = await slotsApi.getSpecialDates();
            const specialDates = specialDatesResponse.data || [];
            const selectedDateStr = formattedDate;
            const specialDate = specialDates.find(
              (sd: {
                date: string;
                dateType: string;
                reason?: string;
                isClosed: boolean;
              }) => {
                const sdDate = new Date(sd.date).toISOString().split("T")[0];
                return sdDate === selectedDateStr;
              },
            );

            if (specialDate) {
              setSpecialDateInfo({
                dateType: specialDate.dateType,
                reason: specialDate.reason,
                isClosed: specialDate.isClosed,
              });
            }
          } catch (error) {
            console.error("Error fetching special dates:", error);
          }
        } catch (error) {
          console.error("Error fetching slots:", error);
          // Fallback or dry run if backend not ready
          setAvailableSlots([]);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [selectedType, selectedLocation, date]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleBook = async () => {
    if (!selectedType || !selectedLocation || !date || !selectedTime) return;
    // Check if user is logged in OR guest details are filled
    if (
      !guestDetails.firstName ||
      !guestDetails.lastName ||
      !guestDetails.email ||
      !guestDetails.phoneNumber
    ) {
      toast.error("Please fill in your details.");
      return;
    }
    setLoading(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");

      const response = await bookingsApi.create({
        appointmentTypeId: selectedType.id,
        locationId: selectedLocation.id,
        appointmentDate: formattedDate,
        appointmentTime: selectedTime,
        firstName: guestDetails.firstName,
        lastName: guestDetails.lastName,
        email: guestDetails.email,
        phoneNumber: guestDetails.phoneNumber,
        notes: "Booked via website",
      });

      setConfirmedBooking(response.data);
      toast.success("Appointment booked successfully!");
      // navigate("/dashboard"); // Stay on page to show success details
    } catch (error) {
      console.log("Booking failed", error);
      toast.error(
        error.response?.data?.error.message ||
          "Booking failed. Slot might be taken.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">
        {confirmedBooking ? "Booking Confirmed!" : "Book New Appointment"}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar - Vertical Stepper */}
        <div className="w-full md:w-60 flex-none hidden md:block">
          <div className="sticky top-8">
            <div className="relative">
              {[
                {
                  id: 1,
                  label: flow === "location" ? "Location" : "Appointment Type",
                },
                {
                  id: 2,
                  label: flow === "location" ? "Appointment Type" : "Location",
                },
                {id: 3, label: "Date & Time"},
                {id: 4, label: "Your Information"},
                {id: 5, label: "Confirmation"},
              ].map((s, index) => {
                const isCompleted =
                  step > s.id || (s.id === 5 && !!confirmedBooking);
                const isCurrent = step === s.id && !confirmedBooking;

                const isTypeStep =
                  (flow === "type" && s.id === 1) ||
                  (flow === "location" && s.id === 2);
                const isLocationStep =
                  (flow === "location" && s.id === 1) ||
                  (flow === "type" && s.id === 2);

                let details = "";
                if (isTypeStep && selectedType) details = selectedType.typeName;
                if (isLocationStep && selectedLocation)
                  details = selectedLocation.locationName;
                if (s.id === 3 && date && selectedTime)
                  details = `${format(date, "MMM d")} • ${selectedTime}`;
                if (
                  s.id === 4 &&
                  (guestDetails.firstName || guestDetails.lastName)
                )
                  details = `${guestDetails.firstName} ${guestDetails.lastName}`;
                if (s.id === 5 && confirmedBooking)
                  details = confirmedBooking.bookingReference;

                return (
                  <div key={s.id} className="relative pl-8 pb-4 last:pb-0">
                    {/* Vertical Line */}
                    {index < 4 && (
                      <div className="absolute left-3.5 top-8 h-full w-0.5 bg-muted">
                        <div
                          className={`w-full transition-all duration-500 ease-in-out ${
                            isCompleted
                              ? "h-full bg-green-600"
                              : "h-0 bg-primary"
                          }`}
                        />
                      </div>
                    )}

                    {/* Circle Indicator */}
                    <div
                      className={`absolute left-0 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors duration-300 z-10 
                      ${
                        isCompleted
                          ? "border-green-600 bg-green-600 text-white"
                          : isCurrent
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted bg-background text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? "✓" : s.id}
                    </div>

                    {/* Label & Details */}
                    <div className="pt-1 ml-2">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          isCompleted
                            ? "text-green-600"
                            : isCurrent
                              ? "text-primary"
                              : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </p>
                      {details && (
                        <div
                          className="border rounded-md p-2 mt-1 cursor-pointer"
                          onClick={() => !confirmedBooking && setStep(s.id)}
                        >
                          <p className="text-xs text-muted-foreground font-medium max-w-[150px]">
                            {details}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Stepper (Horizontal) fallback */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {confirmedBooking ? "Completed" : `Step ${step} of 5`}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full transition-colors ${confirmedBooking || step >= s ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {confirmedBooking ? (
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-8 animate-in fade-in zoom-in duration-500 px-4 sm:px-0">
              <Card className="">
                <CardHeader className="pt-6 sm:pt-8 px-4 sm:px-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-green-700">
                    Appointment Booked Successfully!
                  </CardTitle>
                  <div className="text-center space-y-2 mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm font-medium break-words px-2">
                      A confirmation email has been sent to{" "}
                      <span className="break-all">
                        {confirmedBooking.email}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground italic px-2">
                      You should receive an email confirmation if your email
                      address is correct.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-8 space-y-4 sm:space-y-6 pb-6">
                  <div className="space-y-6 sm:space-y-8 text-center">
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="font-bold text-muted-foreground text-sm sm:text-base">
                        Appointment Details
                      </h3>
                      <div className="space-y-2">
                        <p className="font-medium text-xs sm:text-sm">
                          <span className="block sm:inline">
                            Appointment Type:{" "}
                          </span>
                          <span className="text-primary block sm:inline mt-1 sm:mt-0">
                            {confirmedBooking.appointmentType?.typeName}
                          </span>
                        </p>
                        <p className="font-medium text-xs sm:text-sm">
                          <span className="block sm:inline">Date: </span>
                          <span className="text-primary block sm:inline mt-1 sm:mt-0 break-words">
                            {format(
                              new Date(confirmedBooking.appointmentDate),
                              "EEEE, MMMM d, yyyy",
                            )}
                            , {confirmedBooking.appointmentTime.substring(0, 5)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="font-bold text-muted-foreground text-sm sm:text-base">
                        Location Info
                      </h3>
                      <div className="space-y-1">
                        <p className="font-bold text-xs sm:text-sm break-words px-2">
                          {confirmedBooking.location?.locationName},{" "}
                          {confirmedBooking.location?.address},{" "}
                          {confirmedBooking.location?.city},{" "}
                          {confirmedBooking.location?.state}{" "}
                          {confirmedBooking.location?.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-6 border-t space-y-3 sm:space-y-4 text-center">
                    <h3 className="font-bold text-muted-foreground text-sm sm:text-base">
                      Your Information
                    </h3>
                    <div className="space-y-2 font-medium">
                      <p className="text-xs sm:text-sm break-words">
                        <span className="font-semibold">Name:</span>{" "}
                        {confirmedBooking.firstName} {confirmedBooking.lastName}
                      </p>
                      <p className="text-xs sm:text-sm break-all">
                        <span className="font-semibold">Email:</span>{" "}
                        {confirmedBooking.email}
                      </p>
                      <p className="text-xs sm:text-sm break-words">
                        <span className="font-semibold">Phone:</span>{" "}
                        {confirmedBooking.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row gap-4">
                    <Button
                      className="flex-1"
                      onClick={() => navigate("/dashboard")}
                    >
                      Finish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {((step === 1 && flow === "type") ||
                (step === 2 && flow === "location")) && (
                <div className="">
                  <div className="">
                    <h1 className="text-2xl font-bold tracking-tight">
                      Appointment Type
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Choose the type of appointment you need.
                    </p>
                  </div>
                  <div className="max-w-md relative mt-2 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search appointment types..."
                      className="pl-9 w-full bg-white text-black"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div
                    className={`flex ${step === 2 ? "justify-between" : "justify-end"} pt-4 mt-4`}
                  >
                    {step === 2 && (
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                    )}
                    <Button disabled={!selectedType} onClick={handleNext}>
                      Next
                    </Button>
                  </div>

                  {typesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                      {appointmentTypes?.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground p-8">
                          No active appointment types available.
                        </div>
                      ) : null}
                      {appointmentTypes?.map((type) => (
                        <Card
                          key={type.id}
                          className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                            selectedType?.id === type.id
                              ? "border-primary ring-1 ring-primary"
                              : ""
                          }`}
                          onClick={() => setSelectedType(type)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base font-semibold leading-tight">
                              {type.typeName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            {type.description && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {type.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {((step === 1 && flow === "location") ||
                (step === 2 && flow === "type")) && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">
                        Select Location
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Choose a convenient location.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center bg-muted/30 rounded-lg">
                    <div className="flex gap-2 shrink-0">
                      <span className="text-sm font-medium self-center text-muted-foreground mr-2">
                        Search By:
                      </span>
                      <Button
                        variant={searchType === "name" ? "default" : "outline"}
                        onClick={() => setSearchType("name")}
                        size="sm"
                      >
                        Name
                      </Button>
                      <Button
                        variant={searchType === "zip" ? "default" : "outline"}
                        onClick={() => setSearchType("zip")}
                        size="sm"
                      >
                        Zip Code
                      </Button>
                    </div>
                    <div className="flex-1 w-full sm:max-w-md relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={
                          searchType === "name"
                            ? "Enter location name..."
                            : "Enter zip code..."
                        }
                        className="pl-9 bg-background"
                        value={locationSearchQuery}
                        onChange={(e) => setLocationSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div
                    className={`flex ${step === 2 ? "justify-between" : "justify-end"} pt-6 mt-4`}
                  >
                    {step === 2 && (
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                    )}
                    <Button disabled={!selectedLocation} onClick={handleNext}>
                      Next
                    </Button>
                  </div>

                  {locationsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                  ) : locations?.length === 0 ? (
                    <div className="text-center text-muted-foreground p-12 border rounded-lg border-dashed">
                      No locations available for this service.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 mt-8">
                      {locations?.map((loc) => (
                        <div
                          key={loc.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:shadow-sm bg-card ${
                            selectedLocation?.id === loc.id
                              ? "border-primary ring-1 ring-primary"
                              : ""
                          }`}
                          onClick={() => setSelectedLocation(loc)}
                        >
                          <h3 className="font-semibold text-lg">
                            {loc.locationName}
                          </h3>
                          <div className="text-sm text-muted-foreground mt-2 space-y-1">
                            <p>
                              {loc.address}, {loc.city}, {loc.state}{" "}
                              {loc.zipCode}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="">
                    <h1 className="text-2xl font-bold tracking-tight">
                      Select Date & Time
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Pick an available slot.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      disabled={!date || !selectedTime}
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md w-full"
                        disabled={(d) =>
                          d < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </div>

                    <div className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium">Available Times</h4>
                        {date && (
                          <span className="text-sm text-muted-foreground border px-2 py-1 rounded-md bg-muted/20">
                            {format(date, "MMMM d, yyyy")}
                          </span>
                        )}
                      </div>

                      {specialDateInfo ? (
                        <div className="flex flex-col items-start p-8 border rounded-lg bg-muted/10">
                          <div className="font-semibold mb-1">
                            {specialDateInfo.dateType === "HOLIDAY" &&
                              "Holiday"}
                            {specialDateInfo.dateType === "CLOSURE" && "Closed"}
                            {specialDateInfo.dateType === "MODIFIED_HOURS" &&
                              "Modified Hours"}
                          </div>
                          {specialDateInfo.reason && (
                            <div className="text-sm">
                              {specialDateInfo.reason}
                            </div>
                          )}
                        </div>
                      ) : slotsLoading ? (
                        <div className="flex justify-center py-12 border rounded-lg bg-muted/10">
                          <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                      ) : !availableSlots?.some(
                          (s) => s.availableCapacity > 0,
                        ) ? (
                        <div className="text-center py-12 px-6 border rounded-lg bg-muted/10">
                          <p className="text-muted-foreground mb-4">
                            {availableSlots && availableSlots.length > 0
                              ? "All slots for this date are fully booked."
                              : "No slots available for this date."}
                          </p>
                          {date &&
                            slotConfig &&
                            slotConfig.availableDays.includes(
                              date.getDay(),
                            ) && (
                              <Button
                                variant="secondary"
                                onClick={() => setIsWaitlistModalOpen(true)}
                              >
                                Join Waitlist for {format(date, "MMM d")}
                              </Button>
                            )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-scroll pr-2">
                          {groupedSlots.map((group) => {
                            const isExpanded = expandedGroup === group.label;
                            const availableCount = group.slots.filter(
                              (s) => s.availableCapacity > 0,
                            ).length;

                            return (
                              <div
                                key={group.label}
                                className="border rounded-lg bg-card"
                              >
                                <button
                                  type="button"
                                  className={`w-full flex justify-between items-center p-4 transition-colors ${
                                    isExpanded ? "" : "hover:bg-muted/30"
                                  }`}
                                  onClick={() =>
                                    setExpandedGroup(
                                      isExpanded ? null : group.label,
                                    )
                                  }
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="font-semibold text-lg">
                                      {group.label}
                                    </span>
                                    <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                      {availableCount} slots
                                    </span>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>

                                {isExpanded && (
                                  <div className="p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
                                    {group.slots.map((slot) => (
                                      <Button
                                        key={`${slot.date}-${slot.time}`}
                                        variant="outline"
                                        onClick={() =>
                                          setSelectedTime(slot.time)
                                        }
                                        className={`h-auto py-3 flex justify-between transition-all ${
                                          selectedTime === slot.time
                                            ? "ring-1 ring-primary"
                                            : "hover:border-primary hover:bg-primary/5 shadow-sm"
                                        }`}
                                        disabled={slot.availableCapacity <= 0}
                                      >
                                        <span className="font-semibold">
                                          {slot.time.substring(0, 5)}
                                        </span>
                                        <span
                                          className={`text-[10px] uppercase tracking-wider font-bold ${
                                            slot.availableCapacity > 0
                                              ? "text-green-600 dark:text-green-500"
                                              : "text-destructive"
                                          }`}
                                        >
                                          {slot.availableCapacity > 0
                                            ? "Available"
                                            : "Full"}
                                        </span>
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Your Information
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Please provide your contact details.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          First Name
                        </label>
                        <Input
                          placeholder="John"
                          value={guestDetails.firstName}
                          onChange={(e) =>
                            setGuestDetails({
                              ...guestDetails,
                              firstName: e.target.value,
                            })
                          }
                          className="bg-white text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          placeholder="Doe"
                          value={guestDetails.lastName}
                          onChange={(e) =>
                            setGuestDetails({
                              ...guestDetails,
                              lastName: e.target.value,
                            })
                          }
                          className="bg-white text-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        placeholder="john@example.com"
                        value={guestDetails.email}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            email: e.target.value,
                          })
                        }
                        className="bg-white text-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Phone Number
                      </label>
                      <Input
                        placeholder="+1 234 567 890"
                        value={guestDetails.phoneNumber}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="bg-white text-black"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={
                        !guestDetails.firstName ||
                        !guestDetails.lastName ||
                        !guestDetails.email ||
                        !guestDetails.phoneNumber
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Confirm Booking
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Please review your appointment details before confirming.
                    </p>
                  </div>

                  <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="flex justify-between items-center border-b pb-4">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-semibold text-lg">
                          {selectedType?.typeName}
                        </span>
                      </div>

                      <div className="flex justify-between items-start border-b pb-4">
                        <span className="text-muted-foreground">Location</span>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {selectedLocation?.locationName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedLocation?.address},{" "}
                            {selectedLocation?.city}, {selectedLocation?.state}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-b pb-4">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-semibold text-lg">
                          {date && format(date, "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-b pb-4">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-semibold text-lg">
                          {selectedTime?.substring(0, 5)}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                          Your Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                          <div className="flex justify-between items-center pb-2">
                            <span className="text-sm text-muted-foreground">
                              Name
                            </span>
                            <span className="font-medium">
                              {guestDetails.firstName} {guestDetails.lastName}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-2">
                            <span className="text-sm text-muted-foreground">
                              Phone
                            </span>
                            <span className="font-medium">
                              {guestDetails.phoneNumber}
                            </span>
                          </div>
                          <div className="flex justify-between items-center sm:col-span-2">
                            <span className="text-sm text-muted-foreground">
                              Email
                            </span>
                            <span className="font-medium">
                              {guestDetails.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex justify-between items-center">
                      <Button variant="ghost" onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        onClick={handleBook}
                        disabled={loading}
                        size="lg"
                        className="px-8"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        locationId={selectedLocation?.id}
        appointmentTypeId={selectedType?.id}
        date={date}
        initialGuestDetails={guestDetails}
      />
    </div>
  );
}
