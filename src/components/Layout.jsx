import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const closeSidebar = () => {
    if (!isDesktop) {
      setShowSidebar(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;

      setIsDesktop(desktop);
      setShowSidebar(desktop);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />

      <div style={{ paddingTop: "56px" }}>
        <Sidebar
          showSidebar={showSidebar}
          closeSidebar={closeSidebar}
          isDesktop={isDesktop}
        />

        <div
          className="p-4"
          style={{
            marginLeft: isDesktop ? "250px" : "0",
            transition: "margin-left .3s",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export default Layout;
