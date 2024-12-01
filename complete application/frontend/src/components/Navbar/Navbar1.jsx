import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from '../../services/api.service';
import { cn } from '@/lib/utils';
import { HoverBorderGradient } from '../customcomponents/hover boarder gradient/HoverBorderGradient';
import DropdownMenu from "./DropdownMenu";
import logosvg from "../../assets/svgs/logo.svg";
import { FaUser } from 'react-icons/fa';
import "./Navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const userData = await apiService.getUserProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className={cn('navbar', isScrolled ? 'navbar-scrolled' : 'navbar-floating')}>
      <div className="navbar-content">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src={logosvg} alt="BlockLearner Logo" />
        </Link>

        {/* Links */}
        <div className="navbar-links-container">
          <div className={cn('navbar-links', menuOpen ? 'open' : '')}>
            <DropdownMenu
              label="Learn"
              links={[
                { href: "/courses", label: "Courses" },
                { href: "/tutorials", label: "Tutorials" },
                
              ]}
              active={active}
              setActive={setActive}
            />
            <DropdownMenu
              label="About"
              links={[
                { href: "/infrastructure", label: "Overview" },
                { href: "/services", label: "Services" },
              ]}
              active={active}
              setActive={setActive}
            />
            <DropdownMenu
              label="Resources"
              links={[
                { href: "/documentation", label: "Documentation" },
                { href: "/blog", label: "Blog" },
                { href: "/support", label: "Support" },
              ]}
              active={active}
              setActive={setActive}
            />
            <DropdownMenu
              label="Community"
              links={[
                { href: "/social", label: "Social" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/forum", label: "Forum" },
                { href: "/events", label: "Events" },
                { href: "/discord", label: "Discord" },
              ]}
              active={active}
              setActive={setActive}
            />
          </div>
        </div>

        {/* Authentication */}
        <div className="navbar-register">
          {user ? (
            <>
              <Link to="/profile" className="profile-link">
                <HoverBorderGradient className="profile-button">
                  <FaUser className="profile-icon" />
                  Profile
                </HoverBorderGradient>
              </Link>
              <HoverBorderGradient onClick={handleLogout} className="logout-button">
                Logout
              </HoverBorderGradient>
            </>
          ) : (
            <Link to="/login">
              <HoverBorderGradient className="login-button">
                Login
              </HoverBorderGradient>
            </Link>
          )}
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className={cn('navbar-toggle', menuOpen ? 'open' : '')} onClick={toggleMenu}>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
