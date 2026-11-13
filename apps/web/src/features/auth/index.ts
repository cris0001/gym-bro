// Public interface of the auth feature. Everything outside this folder imports
// from '@/features/auth' only — never from internal paths.

export { AuthShell } from './components/auth-shell';
export { LoginForm } from './components/login-form';
export { RegisterForm } from './components/register-form';
export { LogoutButton } from './components/logout-button';
export { OnboardingSheet } from './components/onboarding-sheet';
export { ProfileForm } from './components/profile-form';
export { FoodNameLangSetting } from './components/food-name-lang-setting';

export { useAuthTranslation } from './i18n';

export { useCurrentUser, meQueryOptions, CURRENT_USER_KEY } from './hooks/use-current-user';
export { useLogin } from './hooks/use-login';
export { useRegister } from './hooks/use-register';
export { useLogout } from './hooks/use-logout';
export { useUpdateProfile } from './hooks/use-update-profile';

export type {
  User,
  Sex,
  FoodNameLang,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from './types';
