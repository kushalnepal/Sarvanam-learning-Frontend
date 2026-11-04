
import { useNavigate, useLocation } from "react-router-dom";
import "./SlideBar.css";

function SlideBar({ role = "Learner" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = role === "Admin";

  const menuItems = [
    "Dashboard",
    "Administrator",
    "Application Setup",
    "Front Office",
    "Banquet",
    "Point of Sale",
    "Inventory",
    "Costing",
    "Finance",
    "Document Center",
    "House Keeping",
    "Marketing",
    "Budget",
    "Maintainance",
  ];

  const handleNavigation = (item) => {
    if (item === "Dashboard") {
      navigate("/");
    } else if (item === "Administrator") {
      if (isAdmin) navigate("/admin");
    } else if (
      ["Application Setup", "Front Office", "Point of Sale", "Inventory", "Finance"].includes(item)
    ) {
      navigate(`/courses/${encodeURIComponent(item)}`);
    }
  };

  const getActivePage = () => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname === "/admin") return "Administrator";

    if (location.pathname.startsWith("/courses/")) {
      const course = location.pathname.split("/courses/")[1];
      return decodeURIComponent(course);
    }

    return "";
  };

  const activePage = getActivePage();

  return (
    <div className="slide-bar">
      <ul>
        {menuItems.map((item) => {
          if (item === "Administrator" && !isAdmin) {
            return null;
          }

          return (
            <li
              key={item}
              className={activePage === item ? "active" : ""}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SlideBar;
