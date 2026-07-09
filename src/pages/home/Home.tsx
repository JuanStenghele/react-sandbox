import Box from '@mui/material/Box';
import HomeAppBar from './AppBar';
import HomeDrawer from './Drawer';
import Typography from '@mui/material/Typography';

const Home = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <HomeAppBar />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <HomeDrawer />
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', padding: 4 }}>
          <Typography>Content goes here</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Home
