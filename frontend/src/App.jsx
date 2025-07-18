import AppRouter from "./routes/appRouter";
import { AuthProvider } from "./contexts/authContext";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
