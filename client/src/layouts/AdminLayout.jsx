import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Fixed sidebar — 256px (w-64) wide */}
      <AdminSidebar />

      {/* Main content offset by sidebar width so nothing is hidden behind it */}
      <main className="flex-1 ml-0 md:ml-64 min-h-screen overflow-y-auto">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;