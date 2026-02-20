import { Typography } from '@mui/material';
import { PageContainer } from '../../../components/layout';
import { AppButton, AppTextField } from '../../../components/ui';
import { useLogin } from '../hooks';

export function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLogin();

  return (
    <PageContainer maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <AppTextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <AppTextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <AppButton type="submit" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </AppButton>
      </form>
    </PageContainer>
  );
}
