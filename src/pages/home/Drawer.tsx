import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import BookIcon from '@mui/icons-material/Book';
import { homeDrawerOpen } from '../../state/home';
import { useAtomValue } from 'jotai';

const HomeDrawer = () => {
  const drawerWidth = 200;

  const drawerOpen = useAtomValue(homeDrawerOpen)

  return (
    <Drawer
      variant="persistent"
      anchor="left"
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
          boxSizing: 'border-box',
        },
      }}
    >
      <List>
        <ListItem key={"books"} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <BookIcon />
            </ListItemIcon>
            <ListItemText primary={"Books"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )
}

export default HomeDrawer
