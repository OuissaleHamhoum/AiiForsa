/**
 * Server Actions Barrel Export
 * Re-export all server actions for easy imports
 */

// Auth actions
export {
    forgotPasswordAction,
    loginUser,
    logoutAction,
    registerUser,
    resetPasswordAction,
} from './auth-actions';

// Health check actions
export { checkServerHealth, getAuthStatus } from './server-health';

// Job actions
export {
    createJob,
    deleteJob,
    getAllJobs,
    getJobById,
    updateJob,
} from './job-actions';

// Job Application actions
export {
    createJobApplication,
    deleteJobApplication,
    getAllJobApplications,
    getJobApplicationById,
    getJobApplicationsByJobId,
    getJobApplicationStats,
    getUserJobApplications,
    updateJobApplication,
} from './job-application-actions';

// Company actions
export {
    createCompany,
    getMyCompany,
    getPublicCompany,
    updateCompanyBranding,
    updateCompanyAboutSeo,
    updateCompanySocials,
} from './company-actions';
