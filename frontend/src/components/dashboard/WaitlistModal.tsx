import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label"; // Check if Label component exists, otherwise use label tag
import { waitlistApi } from "../../api";
import { format } from "date-fns";
import { toast } from "react-toastify";
// If toast is not sonner, I might need to check App.tsx or similar. BookAppointment used 'toast.error("...")', likely 'sonner' or 'react-hot-toast'.

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    locationId?: string;
    appointmentTypeId?: string;
    date?: Date;
    initialGuestDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
}

export function WaitlistModal({
    isOpen,
    onClose,
    locationId,
    appointmentTypeId,
    date,
    initialGuestDetails,
}: WaitlistModalProps) {
    const [formData, setFormData] = useState(initialGuestDetails);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        setFormData(initialGuestDetails);
    }, [initialGuestDetails]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!locationId || !appointmentTypeId) {
            toast.error("Missing location or appointment type information.");
            return;
        }
        setLoading(true);
        try {
            const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
            await waitlistApi.join({
                ...formData,
                locationId,
                appointmentTypeId,
                preferredDateStart: formattedDate,
                preferredDateEnd: formattedDate, // Logic: User wants *this* specific date
                notes,
            });
            toast.success("Successfully joined the waitlist!");
            onClose();
        } catch (error) {
            toast.error(
              error.response?.data?.error?.message ||
                "Failed to join waitlist.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Join Waitlist</DialogTitle>
                    <DialogDescription>
                        Join the waitlist for {date ? format(date, "MMMM d, yyyy") : "appointment"}. We'll notify you if a slot opens up.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({ ...formData, firstName: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({ ...formData, lastName: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                                setFormData({ ...formData, phoneNumber: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any specific preferences?"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Joining..." : "Join Waitlist"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
