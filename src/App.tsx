import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useState } from 'react';

const drawerWidth = 240;

function App() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            React Sandbox
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              position: 'relative',
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Tabs
            orientation="vertical"
            value={tab}
            onChange={(_, value) => setTab(value)}
          >
            <Tab label="Dashboard" />
            <Tab label="Settings" />
            <Tab label="Profile" />
          </Tabs>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Typography>Content goes here</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default App
