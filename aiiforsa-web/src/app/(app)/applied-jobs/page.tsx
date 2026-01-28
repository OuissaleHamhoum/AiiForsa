import { redirect } from 'next/navigation';

export default function AppliedJobsPage() {
    // Redirect to grid view by default
    redirect('/applied-jobs/grid');
}
