import { registerRootComponent } from 'expo';
import App from './App';
import { AppProvider } from './AppContext';

function Main() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}

registerRootComponent(Main);
