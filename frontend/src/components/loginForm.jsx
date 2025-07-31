import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "../contexts/authContext.jsx";
import { loginUser as loginApi } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export function LoginForm({ className, ...props }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('LoginForm - Attempting login with:', form.email);
      
      const res = await loginApi(form);
      console.log('LoginForm - Login API response:', res.data);
      
      const accessToken = res.data.data.accessToken;
      console.log('LoginForm - AccessToken received:', accessToken ? 'Yes' : 'No');
      
      // Use AuthContext login method
      login(accessToken);
      console.log('LoginForm - AuthContext login called');
      
      // Small delay to ensure AuthContext state is updated
      setTimeout(() => {
        console.log('LoginForm - Navigating to dashboard');
        navigate("/dashboard");
      }, 100);
      
    } catch (err) {
      console.error('LoginForm - Login error:', err);
      console.error('LoginForm - Error response:', err.response?.data);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 justify-center min-h-screen", className)} {...props}>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}