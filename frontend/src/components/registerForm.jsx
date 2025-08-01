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
import { registerUser as registerApi } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export function RegisterForm({ className, ...props }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await registerApi(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className={cn("relative z-10 flex flex-col justify-center items-center min-h-screen p-4 md:p-6", className)} {...props}>
        {/* App Title */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 md:mb-4">
            Tidur.io
          </h1>
          <p className="text-slate-400 text-base md:text-lg">Begin your sleep adventure</p>
        </div>

        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border border-slate-700/50 shadow-2xl rounded-2xl">
          <CardHeader className="text-center pb-4 md:pb-6 p-4 md:p-6">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">🌟</div>
            <CardTitle className="text-xl md:text-2xl font-bold text-slate-100">Join Tidur.io!</CardTitle>
            <CardDescription className="text-slate-400 text-sm md:text-base">
              Create your account and start earning dream points
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg backdrop-blur-sm">
                <p className="text-red-300 text-sm text-center">❌ {error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200 font-medium text-sm">
                  👤 Dream Name (Username)
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose your dream name"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/30 rounded-lg py-2.5 px-3 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-medium text-sm">
                  ✉️ Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/30 rounded-lg py-2.5 px-3 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 font-medium text-sm">
                  🔒 Secret Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/30 rounded-lg py-2.5 px-3 transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "🚀 Start My Journey!"
                )}
              </Button>
            </form>
            <div className="mt-5 md:mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Already a dreamer?{" "}
                <Link 
                  to="/login" 
                  className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-2 transition-colors duration-200"
                >
                  Welcome back! ✨
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}