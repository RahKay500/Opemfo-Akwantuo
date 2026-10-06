import LoginForm from "@/components/forms/LoginForm";
import LoginGreeting from "@/components/forms/LoginGreeting";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-col gap-8 px-6 pt-4 lg:max-w-sm lg:px-0 lg:pt-0">
      <LoginGreeting />
      <LoginForm />
    </main>
  );
}
