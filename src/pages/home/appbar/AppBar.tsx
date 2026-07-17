import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { homeDrawerOpen } from '../../../state/home';
import { useAtom } from 'jotai';
import ProfileButton from './ProfileButton';

const HomeAppBar = () => {
  const [drawerOpen, setDrawerOpen] = useAtom(homeDrawerOpen);

  const onMenuButtonClick = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <AppBar position="static" sx={{ boxShadow: 'none' }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ marginRight: 2 }}
          onClick={onMenuButtonClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          React Sandbox
        </Typography>
        <ProfileButton />
      </Toolbar>
    </AppBar>
  );
}

export default HomeAppBar
