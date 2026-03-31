import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-8 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        Book Your Vehicle Services Online
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Fast, easy, and convenient appointment scheduling for all your motor
        vehicle needs. Skip the lines and book ahead.
      </p>
      <div className="flex justify-center gap-4">
        <Button size="lg">
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
        <div className="p-6 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg mb-2">Driver's License</h3>
          <p className="text-muted-foreground">
            Renew, replace, or apply for a new driver's license without the
            hassle.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg mb-2">Vehicle Registration</h3>
          <p className="text-muted-foreground">
            Register your vehicle or renew your existing registration quickly.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg mb-2">Title Services</h3>
          <p className="text-muted-foreground">
            Transfer titles and manage ownership documents efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}
