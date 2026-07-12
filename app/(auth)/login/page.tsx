import LoginForm from "@/components/forms/LoginForm";
import LoginGreeting from "@/components/forms/LoginGreeting";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-start bg-[#F6F1F8] pb-12 pt-11 lg:bg-transparent">
      <div className="flex w-full flex-col items-center pt-20">
        <LoginGreeting />
      </div>

      <div className="w-full px-6 pt-10">
        <LoginForm />
      </div>
    </main>
  );
}
