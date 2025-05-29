import { Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const drawerWidth = 240;

const AdminSidebar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const adminMenuItems = [
        { text: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin' },
        { text: 'Gestione Piloti', icon: <PeopleIcon />, path: '/admin/drivers' },
        { text: 'Gestione Team', icon: <GroupsIcon />, path: '/admin/teams' },
        { text: 'Gestione Utenti', icon: <PersonIcon />, path: '/admin/users' },
        { text: 'Gestione Predizioni', icon: <EmojiEventsIcon />, path: '/admin/predictions' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: theme.palette.background.paper,
                    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                    marginTop: '64px', // Altezza della navbar
                },
            }}
        >
            <List>
                {adminMenuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(225, 6, 0, 0.08)',
                                '&:hover': {
                                    backgroundColor: 'rgba(225, 6, 0, 0.12)',
                                },
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                            primary={item.text}
                            sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}
                        />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default AdminSidebar; 