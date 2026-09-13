import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { ListItemIcon, ListItemText, Box, Divider } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from 'react-oidc-context';
import type { MouseEvent } from 'react';
import LanguageSubmenu from './LanguageSubmenu';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';

const ProfileButton = () => {
  const auth = useAuth();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen: boolean = Boolean(menuAnchor);

  const [languageSubmenuAnchorEl, setLanguageSubmenuAnchorEl] = useState<HTMLElement | null>(null);
  const languageMenuOpen = Boolean(languageSubmenuAnchorEl);

  const onProfileButtonClick = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const onLanguageButtonEnter = (event: MouseEvent<HTMLLIElement>) => {
    setLanguageSubmenuAnchorEl(event.currentTarget)
  };

  const onMenuClose = () => {
    setMenuAnchor(null);
  };

  const onSignOutButtonClick = () => {
    auth.removeUser();
  };

  return (
    <>
      <IconButton
        size='large'
        aria-label='profile'
        onClick={onProfileButtonClick}
        color='inherit'
      >
        <AccountCircle />
      </IconButton>
      <LanguageSubmenu
        anchorEl={languageSubmenuAnchorEl}
        open={languageMenuOpen}
        onClose={() => setLanguageSubmenuAnchorEl(null)}
      />
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={onMenuClose}
      >
        <Box sx={{ width: 232.0, maxWidth: '100%' }}>
          <MenuItem onMouseEnter={onLanguageButtonEnter}>
            <ListItemIcon>
              <ChevronLeftRoundedIcon sx={{ color: 'text.primary' }} />
            </ListItemIcon>
            <ListItemText>
              Language
            </ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={onSignOutButtonClick}>
            <ListItemIcon>
              <LogoutIcon fontSize='small' color='error'/>
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>
              Sign Out
            </ListItemText>
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
};

export default ProfileButton;
