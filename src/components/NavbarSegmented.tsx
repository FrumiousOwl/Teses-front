import { useState, useEffect } from 'react';
import { Text, Tooltip, Loader } from '@mantine/core';
import { IconLogout, IconAlertTriangle, IconAlertOctagon, IconUserPlus, IconUser, IconKey, IconMail } from '@tabler/icons-react'; // Added IconUserPlus for the Register tab
import { AiFillDatabase, AiFillCheckCircle, AiFillCloseCircle, AiFillPlusCircle, AiFillContainer } from 'react-icons/ai';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import classes from './NavbarSegmented.module.css';

const tabs = {
  User: [
    { link: '/dashboard/hardwareRequest', label: 'SRRF', icon: AiFillDatabase },
  ],
  InventoryManager: [
    { link: '/dashboard/srrf', label: 'SRRF', icon: AiFillDatabase },
    { link: '/dashboard/input-assets', label: 'Input Assets', icon: AiFillPlusCircle },
    { link: '/dashboard/available-assets', label: 'Available Assets', icon: AiFillCheckCircle },
    { link: '/dashboard/defective-assets', label: 'Defective Assets', icon: AiFillCloseCircle },
    { link: '/dashboard/warning-stock', label: 'Stock Warning', icon: IconAlertTriangle },
  ],
  RequestManager: [
    { link: '/dashboard/srrf', label: 'SRRF', icon: AiFillDatabase },
    { link: '/dashboard/report', label: 'Report', icon: AiFillContainer },
    { link: '/dashboard/input-assets', label: 'Input Assets', icon: AiFillPlusCircle },
  ],
  SystemManager: [
    { link: '/dashboard/anomaly', label: 'Anomaly', icon: IconAlertOctagon },
    { link: '/dashboard/srrf', label: 'SRRF', icon: AiFillDatabase },
    { link: '/dashboard/register', label: 'Register', icon: IconUserPlus },
    { link: '/dashboard/reset-password', label: 'Reset Password', icon: IconKey },
    { link: '/dashboard/user-account', label: 'User Roles', icon: IconUser },
    { link: '/dashboard/input-assets', label: 'Input Assets', icon: AiFillPlusCircle },
    { link: '/dashboard/user-email', label: 'User Accounts', icon: IconMail },
  ],
};

export function NavbarSegmented() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); 
        console.log("Decoded Token:", decodedToken);

        if (decodedToken.given_name) {
          setUsername(decodedToken.given_name);
        } else {
          console.error("given_name not found in token");
        }

        if (decodedToken.role) {
          setUserRole(decodedToken.role);
        } else {
          console.error("Role not found in token");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    localStorage.removeItem('token');
    navigate('/'); 
  };

  const getTabsForRole = () => {
    switch (userRole) {
      case 'User':
        return tabs.User;
      case 'InventoryManager':
        return tabs.InventoryManager;
      case 'RequestManager':
        return tabs.RequestManager;
      case 'SystemManager':
        return tabs.SystemManager;
      default:
        return [];
    }
  };

  const links = getTabsForRole().map((item) => (
    <Tooltip label={item.label} position="right" withArrow key={item.label}>
      <Link
        className={`${classes.link} ${active === item.link ? classes.active : ''}`}
        to={item.link}
        onClick={() => setActive(item.link)}
      >
        <item.icon className={classes.linkIcon} />
        <span className={classes.linkText}>{item.label}</span>
      </Link>
    </Tooltip>
  ));

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <nav className={classes.navbar}>
        <div className={classes.header}>
          <Text fw={500} size="sm" className={classes.title} c="dimmed" mb="xs">
            Welcome!
          </Text>
        </div>

        <div className={classes.navbarMain}>
          {links}
        </div>

        <div className={classes.footer}>
          {/* Profile Section */}
          <div className={classes.profileSection}>
            <Text
              size="sm"
              className={classes.username}
              style={{ cursor: "pointer", textDecoration: "underline", color: "blue" }}
              onClick={() => navigate('/dashboard/change-password')}
            >
              {username || "Guest"}
            </Text>
          </div>

          {/* Logout Button */}
          <a href="#" className={classes.link} onClick={handleLogout}>
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span className={classes.linkText}>Logout</span>
          </a>
        </div>
      </nav>

      <div className={classes.content}>
        <Outlet />
      </div>
    </div>
  );
}