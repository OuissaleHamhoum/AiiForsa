'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/hooks/useAuth';
import {
    resetPasswordSchema,
    type ResetPasswordInput,
} from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

/**
 * Reset password form component
 */
export function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false);
    const resetPasswordMutation = useResetPassword();

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: '',
            otp: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: ResetPasswordInput) => {
        // Exclude confirmPassword before sending to API
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...resetData } = data;
        resetPasswordMutation.mutate(resetData);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                    Reset password
                </CardTitle>
                <CardDescription>
                    Enter the code sent to your email and your new password
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
                                                resetPasswordMutation.isPending
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reset Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            disabled={
                                                resetPasswordMutation.isPending
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="Enter your new password"
                                                autoComplete="new-password"
                                                disabled={
                                                    resetPasswordMutation.isPending
                                                }
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                            disabled={
                                                resetPasswordMutation.isPending
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
                            disabled={resetPasswordMutation.isPending}
                        >
                            {resetPasswordMutation.isPending
                                ? 'Resetting...'
                                : 'Reset password'}
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
