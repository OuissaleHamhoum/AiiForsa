import { RegisterForm } from '@/components/auth/RegisterForm';

export const dynamic = 'force-dynamic';

/**
 * Register page
 */
export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <RegisterForm />
        </div>
    );
}
