import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import BookIcon from '@mui/icons-material/Book';
import HistoryEduRoundedIcon from '@mui/icons-material/HistoryEduRounded';
import { homeDrawerOpen } from '../../state/home';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../constants';

const HomeDrawer = () => {
  const drawerWidth = 200;
  const navigate = useNavigate();

  const drawerOpen = useAtomValue(homeDrawerOpen);

  const onListItemClick = (path: string) => {
    navigate(path);
  };

  const items = [
    { text: 'Authors', icon: <HistoryEduRoundedIcon />, path: ROUTES.authors },
    { text: 'Books', icon: <BookIcon />, path: ROUTES.books }
  ];

  return (
    <Drawer
      variant='persistent'
      anchor='left'
      open={drawerOpen}
      sx={{
        width: drawerOpen ? drawerWidth : 0,
        minWidth: drawerOpen ? undefined : 0,
        overflow: 'hidden',
        flexShrink: 0,
        transition: 'width 225ms',
        '& .MuiDrawer-paper': {
          position: 'relative',
          width: drawerWidth,
          boxSizing: 'border-box'
        }
      }}
    >
      <List>
        {
          items.map((item) => (
            <ListItem disablePadding key={item.text.toLowerCase()}>
              <ListItemButton onClick={() => onListItemClick(item.path)}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))
        }
      </List>
    </Drawer>
  );
};

export default HomeDrawer;
