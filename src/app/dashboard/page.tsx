import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Uploader } from "@/components/dashboard/Uploader";
import { Gallery } from "@/components/dashboard/Gallery";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Your Workspace</h1>
        <p className="text-muted-foreground">Upload and process your product images here.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Uploader userId={userId} />
        </div>
        <div className="lg:col-span-2">
          <div className="glass-card p-6 h-full min-h-[500px]">
            <h2 className="text-xl font-semibold mb-6">Recent Images</h2>
            <Gallery userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
