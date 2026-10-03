import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { PORTAL_NAME } from "@/lib/brand";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="leading-snug">{PORTAL_NAME}</CardTitle>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
      </CardHeader>
      <CardBody>
        <LoginForm />
      </CardBody>
    </Card>
  );
}
