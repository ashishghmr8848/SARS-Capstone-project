import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {MapPin, ClipboardMinus} from "lucide-react";
import {useNavigate} from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl tracking-tight">
        Welcome to Motor Vehicles Appointment Booking System
      </h1>
      <p className="text-xl text-muted-foreground">
        Book your vehicle services online
      </p>

      <div className="flex flex-col md:flex-row gap-8 mt-10">
        <Card className="flex-1 p-8 flex flex-col gap-10">
          <div className="flex flex-col items-center gap-8 text-xl">
            <span className="bg-primary/10 rounded-md p-2">
              <MapPin className="w-8 h-8 text-primary" />
            </span>
            Search By Location
          </div>
          <Button
            className="w-full"
            onClick={() =>
              navigate("/dashboard/book", {state: {flow: "location"}})
            }
          >
            Select
          </Button>
        </Card>

        <Card className="flex-1 p-8 flex flex-col gap-10">
          <div className="flex flex-col items-center gap-8 text-xl">
            <span className="bg-primary/10 rounded-md p-2">
              <ClipboardMinus className="w-8 h-8 text-primary" />
            </span>
            Search By Appointment Type
          </div>
          <Button
            className="w-full"
            onClick={() => navigate("/dashboard/book", {state: {flow: "type"}})}
          >
            Select
          </Button>
        </Card>
      </div>
    </div>
  );
}
