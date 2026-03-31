import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import axiosInstance from "@/api/axiosConfig";
import { CheckCircle, XCircle, Loader2, AlertCircle, Calendar, Clock, MapPin, FileText } from "lucide-react";
import { format } from "date-fns";
import type { Booking } from "@/types";

type ActionType = "confirm" | "cancel";

export default function BookingAction() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingBooking, setFetchingBooking] = useState(true);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const bookingId = searchParams.get("bookingId");

    const fetchBookingDetails = useCallback(async () => {
        if (!bookingId) return;

        setFetchingBooking(true);
        try {
            // Fetch booking details from backend
            const response = await axiosInstance.get(`/bookings/${bookingId}`);

            if (response.data.success) {
                setBooking(response.data.data);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            const finalMessage = errorMessage || "Failed to fetch booking details";
            setError(finalMessage);
            toast.error(finalMessage);
        } finally {
            setFetchingBooking(false);
        }
    }, [bookingId]);

    useEffect(() => {
        if (!bookingId) {
            setError("Invalid booking link. No booking ID provided.");
            setFetchingBooking(false);
            return;
        }

        fetchBookingDetails();
    }, [bookingId, fetchBookingDetails]);

    const handleAction = async (action: ActionType) => {
        if (!bookingId) return;

        setLoading(true);
        try {
            const endpoint = action === "confirm"
                ? `/bookings/confirm?bookingId=${bookingId}`
                : `/bookings/cancel?bookingId=${bookingId}`;

            const response = await axiosInstance.get(endpoint);

            if (response.data.success) {
                setShowCancelConfirmation(false);
                toast.success(
                    action === "confirm"
                        ? "Booking confirmed successfully!"
                        : "Booking cancelled successfully!"
                );
                fetchBookingDetails();
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            const finalMessage = errorMessage || `Failed to ${action} booking`;
            setError(finalMessage);
            toast.error(finalMessage);
        } finally {
            setLoading(false);
        }
    };

    // Invalid link
    if (!bookingId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-6 w-6" />
                            Invalid Link
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            This booking link is invalid. Please check your email for the
                            correct link.
                        </p>
                        <Button onClick={() => navigate("/")} className="w-full">
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Loading booking details
    if (fetchingBooking) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full">
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Loading booking details...</span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-6 w-6" />
                            Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <div className="space-y-2">
                            <Button onClick={() => navigate("/")} className="w-full">
                                Go to Home
                            </Button>
                            <Button
                                onClick={() => navigate("/book")}
                                variant="outline"
                                className="w-full"
                            >
                                Book New Appointment
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }



    // Main booking details view
    if (booking) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <Card className="max-w-2xl w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl">Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {booking.status === "CONFIRMED" && (
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <p className="font-semibold text-green-800 flex items-center justify-center gap-2"><CheckCircle className="h-6 w-6 text-green-600" /> Booking Confirmed</p>
                                    <p className="text-sm text-green-700 mt-1">
                                        Please arrive 10 minutes before your scheduled time.
                                    </p>
                                </div>


                            </div>
                        )}

                        {booking.status === "CANCELLED" && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <p className="font-semibold text-red-800 flex items-center justify-center gap-2"><XCircle className="h-6 w-6 text-red-600" />Booking Cancelled</p>
                                <p className="text-sm text-red-700 mt-1">
                                    This appointment has been cancelled.
                                </p>
                            </div>
                        )}


                        {/* Appointment Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg mb-3">Appointment Details</h3>

                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="font-medium">{booking.appointmentType?.typeName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">
                                        {format(new Date(booking.appointmentDate), "MMMM dd, yyyy")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Time</p>
                                    <p className="font-medium">{booking.appointmentTime}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium">{booking.location?.locationName}, {booking.location.address}, {booking.location.city}, {booking.location.state} {booking.location.zipCode}</p>
                                </div>
                            </div>

                            {booking.notes && (
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Notes</p>
                                        <p className="font-medium">{booking.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {booking.status === "PENDING" && (
                            <div className="space-y-3 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => handleAction("confirm")}
                                        disabled={loading}
                                        className="w-full bg-primary"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Confirming...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Confirm Booking
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => setShowCancelConfirmation(true)}
                                        disabled={loading}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancel Booking
                                    </Button>
                                </div>
                            </div>
                        )}


                        {/* Navigation */}
                        <div className="w-full pt-4 border-t flex gap-4">
                            {
                                booking?.status === "CONFIRMED" &&
                                <div className="w-full">
                                    <Button
                                        onClick={() => setShowCancelConfirmation(true)}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancel Booking
                                    </Button>
                                </div>
                            }

                            <div className="w-full">
                                <Button
                                    onClick={() => navigate("/")}
                                    className="w-full"
                                >
                                    Back to Home
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-orange-600">
                                <AlertCircle className="h-5 w-5" />
                                Cancel Your Booking
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to cancel your appointment? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                onClick={() => setShowCancelConfirmation(false)}
                                variant="outline"
                                disabled={loading}
                            >
                                Keep Booking
                            </Button>
                            <Button
                                onClick={() => handleAction("cancel")}
                                disabled={loading}
                                variant="destructive"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    "Cancel Booking"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return null;
}
