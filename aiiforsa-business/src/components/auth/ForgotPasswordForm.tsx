'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
    forgotPasswordSchema,
    type ForgotPasswordInput,
} from '@/schemas/auth.schema';
import { useForgotPassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

/**
 * Forgot password form component
 */
export function ForgotPasswordForm() {
    const forgotPasswordMutation = useForgotPassword();

    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = (data: ForgotPasswordInput) => {
        forgotPasswordMutation.mutate(data);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                    Forgot password?
                </CardTitle>
                <CardDescription>
                    Enter your email address and we&apos;ll send you a reset
                    code
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            disabled={
                                                forgotPasswordMutation.isPending
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={forgotPasswordMutation.isPending}
                        >
                            {forgotPasswordMutation.isPending
                                ? 'Sending...'
                                : 'Send reset code'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link
                        href="/login"
                        className="text-primary hover:underline"
                    >
                        Sign in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
