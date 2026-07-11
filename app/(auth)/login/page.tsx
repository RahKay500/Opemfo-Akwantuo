import { PersonIcon } from "@/components/ui/icons";
import LoginForm from "@/components/forms/LoginForm";
import LoginGreeting from "@/components/forms/LoginGreeting";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-start bg-[#F6F1F8] pb-12 pt-11 lg:bg-transparent">
      <div className="flex w-full flex-col items-center pt-20">
        <div className="flex size-[72px] items-center justify-center rounded-[36px] bg-lilac-light">
          <PersonIcon className="size-9 text-lilac-deeper" />
        </div>
        <LoginGreeting />
      </div>

      <div className="w-full px-6 pt-10">
        <LoginForm />
      </div>
    </main>
  );
}
