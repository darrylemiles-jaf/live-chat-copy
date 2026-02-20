import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';
import { SnackbarProvider } from './contexts/SnackbarContext';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <SnackbarProvider>
        <ScrollTop>
          <RouterProvider router={router} />
        </ScrollTop>
      </SnackbarProvider>
    </ThemeCustomization>
  );
}
