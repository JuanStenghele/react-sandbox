import { Box, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useAtom } from 'jotai';
import { language as languageAtom } from '../../../state/home';
import { languages, languageStorageKey } from '../../../constants';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import i18n from '../../../translations';
import type { Language } from '../../../types/home';

interface LanguageSubmenu {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
};

const LanguageSubmenu = (props: LanguageSubmenu) => {
  const [language, setLanguage] = useAtom(languageAtom);

  const onLanguageItemClick = (languageItem: Language) => {
    setLanguage(languageItem.key);
    localStorage.setItem(languageStorageKey, languageItem.key);
    i18n.changeLanguage(languageItem.key);
  };

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
              onClick={() => {onLanguageItemClick(languageItem)}}
              sx={{
                width: 174.0
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
