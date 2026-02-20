import { AppErrorBoundary } from '../components/feedback';
import { ErrorFallback } from '../components/feedback/ErrorFallback';
import { AppProviders } from './AppProviders';
import { AppRouter } from './router';

/**
 * Root app: error boundary > providers > router.
 * No business logic; composition only.
 */
export default function App() {
  return (
    <AppErrorBoundary fallback={ErrorFallback}>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </AppErrorBoundary>
  );
}
