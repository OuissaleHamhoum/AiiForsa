import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

/**
 * Forgot password page
 */
export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <ForgotPasswordForm />
        </div>
    );
}
