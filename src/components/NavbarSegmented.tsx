/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Text, Tooltip } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { AiFillDatabase, AiFillCheckCircle, AiFillCloseCircle, AiFillContainer, AiFillPlusCircle, AiFillFile } from 'react-icons/ai';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import classes from './NavbarSegmented.module.css';

// Define the tabs for each role
const tabs = {
  User: [
    { link: '/dashboard/srrf', label: 'SRRF', icon: AiFillDatabase },
  ],
  InventoryManager: [
    { link: '/dashboard/srrf', label: 'SRRF', icon: AiFillDatabase },
    { link: '/dashboard/input-assets', label: 'Input Assets', icon: AiFillPlusCircle },
    { link: '/dashboard/available-assets', label: 'Available Assets', icon: AiFillCheckCircle },
    { link: '/dashboard/defective-assets', label: 'Defective Assets', icon: AiFillCloseCircle },
    { link: '/dashboard/report', label: 'Report', icon: AiFillContainer },
  ],
  RequestManager: [
    { link: '/dashboard/srrf', label: 'SRRF', icon: AiFillDatabase },
    { link: '/dashboard/input-assets', label: 'Input Assets', icon: AiFillPlusCircle },
    { link: '/dashboard/available-assets', label: 'Available Assets', icon: AiFillCheckCircle },
    { link: '/dashboard/defective-assets', label: 'Defective Assets', icon: AiFillCloseCircle },
    { link: '/dashboard/report', label: 'Report', icon: AiFillContainer },
  ],
  SystemManager: [
    { link: '/dashboard/srrf', label: 'SRRF', icon: AiFillDatabase },
    { link: '/dashboard/input-assets', label: 'Input Assets', icon: AiFillPlusCircle },
    { link: '/dashboard/available-assets', label: 'Available Assets', icon: AiFillCheckCircle },
    { link: '/dashboard/defective-assets', label: 'Defective Assets', icon: AiFillCloseCircle },
    { link: '/dashboard/report', label: 'Report', icon: AiFillContainer },
    
  ],
};

export function NavbarSegmented() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch the user's role from local storage or API
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the token to get the user's role (example implementation)
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
      setUserRole(decodedToken.role); // Assuming the role is stored in the token
    } else {
      navigate('/login'); // Redirect to login if no token is found
    }
  }, [navigate]);

  const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    localStorage.removeItem('token'); // Clear the token
    navigate('/'); // Redirect to the home page
  };

  // Get the tabs based on the user's role
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
        className={`${classes.link} ${location.pathname === item.link ? classes.active : ''}`}
        to={item.link}
        onClick={() => setActive(item.link)}
      >
        <item.icon className={classes.linkIcon} />
        <span className={classes.linkText}>{item.label}</span>
      </Link>
    </Tooltip>
  ));

  return (
    <div className={classes.container}>
      <nav className={classes.navbar}>
        <div className={classes.header}>
          <Text fw={500} size="sm" className={classes.title} c="dimmed" mb="xs">
            Arellano University
          </Text>
        </div>

        <div className={classes.navbarMain}>{links}</div>

        <div className={classes.footer}>
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