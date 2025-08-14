import Navbar from "@/components/Navbar";
import Login from "./login/page";

export default function Home() {
  return (
    <div className="bg-gray-50 h-screen">
      <Navbar />
      <Login />
    </div>
  );
}
