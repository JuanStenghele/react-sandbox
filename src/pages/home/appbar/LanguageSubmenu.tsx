import { Box, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useAtom } from 'jotai';
import { language as languageAtom } from '../../../state/home';
import { languages } from '../../../constants';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

interface LanguageSubmenu {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
};

const LanguageSubmenu = (props: LanguageSubmenu) => {
  const [language, setLanguage] = useAtom(languageAtom);

  return (
    <Menu
      anchorEl={props.anchorEl}
      open={props.open}
      onClose={props.onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      {
        languages.map((languageItem) => {
          const selected = languageItem.key === language;
          const Flag = languageItem.flag;
          return (
            <MenuItem
              key={languageItem.key}
              onClick={() => {
                setLanguage(languageItem.key);
              }}
            >
              <Box
                sx={{
                  width: 24.0,
                  height: 16.0,
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: 4.0
                }}
              >
                {selected && <CheckRoundedIcon fontSize='small' />}
              </Box>
              <ListItemIcon>
                <Flag
                  style={{
                    width: 24.0,
                    height: 16.0
                  }}
                />
              </ListItemIcon>
              <ListItemText primary={languageItem.label} />
            </MenuItem>
          );
        }
      )}

    </Menu>
  )
};

export default LanguageSubmenu;
