import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const dynamic = 'force-dynamic';

/**
 * Reset password page
 */
export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <ResetPasswordForm />
        </div>
    );
}
