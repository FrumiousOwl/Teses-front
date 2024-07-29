import { useState } from 'react';
import { Text, Tooltip } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { AiFillDatabase, AiFillCheckCircle, AiFillCloseCircle, AiFillContainer, AiFillPlusCircle, AiFillFile } from 'react-icons/ai';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import classes from './NavbarSegmented.module.css';

const tabs = {
  account: [
    { link: '/dashboard/srrf', label: 'SRRF', icon: AiFillDatabase },
    { link: '/dashboard/input-assets', label: 'Input Assets', icon: AiFillPlusCircle },
    { link: '/dashboard/available-assets', label: 'Available Assets', icon: AiFillCheckCircle },
    { link: '/dashboard/defective-assets', label: 'Defective Assets', icon: AiFillCloseCircle },
    { link: '/dashboard/report', label: 'Report', icon: AiFillContainer },
    { link: '/dashboard/invoice-report', label: 'Invoice Report', icon: AiFillFile }, // Added Invoice Report
  ],
  general: [],
};

export function NavbarSegmented() {
  const [section] = useState<'account' | 'general'>('account');
  const navigate = useNavigate();
  const location = useLocation();
  const [, setActive] = useState(location.pathname);

  const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate('/');
  };

  const links = tabs[section].map((item) => (
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
            eData Services
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
