import { PersonIcon } from "@/components/ui/icons";
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-start bg-[#F6F1F8] pb-12 pt-11">
      <div className="flex w-full flex-col items-center pt-20">
        <div className="flex size-[72px] items-center justify-center rounded-[36px] bg-lilac-light">
          <PersonIcon className="size-9 text-lilac-deeper" />
        </div>
        <h1 className="mt-5 font-heading text-[28px] font-bold text-text-primary">Welcome</h1>
        <p className="mt-1 font-body text-[15px] text-text-secondary">Sign in to continue</p>
      </div>

      <div className="w-full px-6 pt-10">
        <LoginForm />
      </div>
    </main>
  );
}
