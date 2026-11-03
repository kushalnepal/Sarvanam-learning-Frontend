
import { IoSearchCircle, IoChatbubbles } from "react-icons/io5";
import "./NavBar.css";

function NavBar({ username, onLogout }) {
  return (
    <div className="nav-bar">
      <ul>
        <li className="nav-left">
          <div className="logo">
            <img
              src="https://play-lh.googleusercontent.com/_ZERH7k48xuMlJiF6rLrUfeVkQd_bIb_GM-lzTi8_nM0iXjngqqukX0l-B3Og84_vQ"
              alt="Sarvanam Logo"
            />
            <a href="/">Sarvanam</a>
          </div>

          <div className="search-box">
            <input
              type="search"
              name="search"
              id="search"
              placeholder="Search"
            />
            <IoSearchCircle className="search-icon" />
          </div>
        </li>

        <li className="user-area">
          <span className="navbar-username">
            {username}
          </span>

          <button type="button" aria-label="Open chat">
            <IoChatbubbles />
          </button>

          <button
            type="button"
            className="navbar-logout"
            onClick={onLogout}
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default NavBar;
