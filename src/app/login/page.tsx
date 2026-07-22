import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <SignIn routing="hash" />
    </div>
  );
}
