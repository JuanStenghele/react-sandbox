import Box from '@mui/material/Box';
import { Outlet } from 'react-router';
import HomeAppBar from './appbar/AppBar';
import HomeDrawer from './Drawer';

const HomePage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <HomeAppBar />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <HomeDrawer />
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', padding: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default HomePage
