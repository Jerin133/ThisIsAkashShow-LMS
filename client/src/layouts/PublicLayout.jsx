import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">

      <Navbar />

      <main>
        {children}
      </main>

      <Footer />

    </div>
  );
};

export default PublicLayout;