import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/People';
import FlagIcon from '@mui/icons-material/Flag';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: 'var(--f1-black)',
                borderBottom: '3px solid var(--f1-red)'
            }}
        >
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div" 
                    sx={{
                        flexGrow: 0,
                        mr: 4,
                        color: 'var(--f1-white)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <SpeedIcon />
                    F1 Analytics
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/"
                        startIcon={<SpeedIcon />}
                        sx={{
                            color: 'var(--f1-white)',
                            '&:hover': {
                                color: 'var(--f1-red)',
                            },
                        }}
                    >
                        Dashboard
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/drivers"
                        startIcon={<PeopleIcon />}
                        sx={{
                            color: 'var(--f1-white)',
                            '&:hover': {
                                color: 'var(--f1-red)',
                            },
                        }}
                    >
                        Piloti
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/races"
                        startIcon={<FlagIcon />}
                        sx={{
                            color: 'var(--f1-white)',
                            '&:hover': {
                                color: 'var(--f1-red)',
                            },
                        }}
                    >
                        Gare
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/stats"
                        startIcon={<BarChartIcon />}
                        sx={{
                            color: 'var(--f1-white)',
                            '&:hover': {
                                color: 'var(--f1-red)',
                            },
                        }}
                    >
                        Statistiche
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/teams"
                        startIcon={<GroupsIcon />}
                        sx={{
                            color: 'var(--f1-white)',
                            '&:hover': {
                                color: 'var(--f1-red)',
                            },
                        }}
                    >
                        Team
                    </Button>
                    {user && (
                        <>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/predictions"
                                startIcon={<EmojiEventsIcon />}
                                sx={{
                                    color: 'var(--f1-white)',
                                    '&:hover': {
                                        color: 'var(--f1-red)',
                                    },
                                }}
                            >
                                Predizioni
                            </Button>
                            {!user.isAdmin && (
                                <Button
                                    color="inherit"
                                    component={RouterLink}
                                    to="/profile"
                                    startIcon={<PersonIcon />}
                                    sx={{
                                        color: 'var(--f1-white)',
                                        '&:hover': {
                                            color: 'var(--f1-red)',
                                        },
                                    }}
                                >
                                    Profilo
                                </Button>
                            )}
                            {user.isAdmin && (
                                <Button
                                    color="inherit"
                                    component={RouterLink}
                                    to="/admin"
                                    startIcon={<AdminPanelSettingsIcon />}
                                    sx={{
                                        color: 'var(--f1-white)',
                                        '&:hover': {
                                            color: 'var(--f1-red)',
                                        },
                                    }}
                                >
                                    Admin
                                </Button>
                            )}
                        </>
                    )}
                </Box>
                <Box sx={{ marginLeft: 'auto' }}>
                    {user ? (
                        <>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'var(--f1-white)',
                                    mr: 2,
                                    display: 'inline-block'
                                }}
                            >
                                Ciao, {user.email}
                            </Typography>
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                sx={{
                                    color: 'var(--f1-white)',
                                    '&:hover': {
                                        color: 'var(--f1-red)',
                                    },
                                }}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/login"
                                sx={{
                                    color: 'var(--f1-white)',
                                    '&:hover': {
                                        color: 'var(--f1-red)',
                                    },
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/register"
                                sx={{
                                    color: 'var(--f1-white)',
                                    '&:hover': {
                                        color: 'var(--f1-red)',
                                    },
                                }}
                            >
                                Registrati
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 