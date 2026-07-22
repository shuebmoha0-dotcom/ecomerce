import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <SignUp routing="hash" />
    </div>
  );
}
