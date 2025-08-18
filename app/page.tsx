import Login from "@/components/Login";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="bg-gray-50 h-screen">
      <Navbar />
      <Login />
    </div>
  );
}
