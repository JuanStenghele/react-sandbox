import { IconButton, Tooltip } from '@mui/material';
import { useAtom } from 'jotai';
import { theme as themeAtom } from '../../../state/home';
import type { ThemeMode } from '../../../types/home';
import { darkTheme, lightTheme, themeStorageKey } from '../../../constants';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';

const ThemeSwitch = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  const otherTheme: ThemeMode = theme === darkTheme ? lightTheme : darkTheme;

  const onThemeSwitchClick = () => {
    setTheme(otherTheme);
    localStorage.setItem(themeStorageKey, otherTheme);
  };

  return (
    <Tooltip describeChild title={`Switch to ${otherTheme} mode`} arrow>
      <IconButton
        size='large'
        aria-label='theme'
        onClick={onThemeSwitchClick}
        color='inherit'
      >
        { otherTheme === darkTheme ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon /> }
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitch;
