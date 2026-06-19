// Public interface of the auth feature. Everything outside this folder imports
// from '@/features/auth' only — never from internal paths.

export { LoginForm } from './components/login-form';
export { RegisterForm } from './components/register-form';
export { LogoutButton } from './components/logout-button';

export { useCurrentUser, meQueryOptions, CURRENT_USER_KEY } from './hooks/use-current-user';
export { useLogin } from './hooks/use-login';
export { useRegister } from './hooks/use-register';
export { useLogout } from './hooks/use-logout';

export type { User, Sex, LoginInput, RegisterInput, UpdateProfileInput } from './types';
