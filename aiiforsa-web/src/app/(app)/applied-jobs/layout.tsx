import { ReactNode } from 'react';
import { Header } from './components/header';
import { AppliedJobsProvider } from './context/AppliedJobsContext';

export default function AppliedJobsLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <AppliedJobsProvider>
            <section>
                <Header />
                {children}
            </section>
        </AppliedJobsProvider>
    );
}
