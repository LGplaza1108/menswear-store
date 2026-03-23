import Footer from "./Footer";
import Header from "./Header";

const AppLayout = ({ children }) => (
  <div className="min-h-screen">
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);

export default AppLayout;
