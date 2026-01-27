import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div>
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6 bg-gray-100 min-h-screen">{children}</div>
      </div>
    </div>
  );
}