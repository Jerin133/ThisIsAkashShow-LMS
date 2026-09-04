import StudentSidebar from "../components/student/StudentSidebar";

const StudentLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;