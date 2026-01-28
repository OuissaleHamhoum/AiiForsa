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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

/**
 * Login form component with validation and error handling
 */
export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const loginMutation = useLogin();

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginInput) => {
        loginMutation.mutate(data);
    };

    return (
        <Card className="w-full max-w-md bg-transparent border-none">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">
                    Welcome back
                </CardTitle>
                <CardDescription>
                    Sign in to your account to continue
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
                                            disabled={loginMutation.isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Password</FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                disabled={
                                                    loginMutation.isPending
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
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="remember"
                                                checked={rememberMe}
                                                onCheckedChange={checked =>
                                                    setRememberMe(
                                                        checked as boolean,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="remember"
                                                className="text-sm text-muted-foreground cursor-pointer"
                                            >
                                                Remember me
                                            </label>
                                        </div>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full mt-8"
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending
                                ? 'Signing in...'
                                : 'Sign in'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/register"
                        className="text-primary hover:underline"
                    >
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
