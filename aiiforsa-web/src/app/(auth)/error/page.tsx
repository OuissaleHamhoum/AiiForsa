import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Auth error page
 */
export default function AuthErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        Authentication Error
                    </CardTitle>
                    <CardDescription>
                        There was a problem signing you in. Please try again.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button asChild className="w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
