/**
 * Root page — shows the login page directly.
 *
 * Previously used redirect('/dashboard') which caused the browser tab
 * to spin indefinitely because the middleware would redirect unauthenticated
 * users back to /login, creating a navigation chain that never settled.
 *
 * Now the root just exports the LoginPage component directly so / and /login
 * both render the same sign-in screen with no redirects involved.
 */
export { default } from '@/app/login/page';
