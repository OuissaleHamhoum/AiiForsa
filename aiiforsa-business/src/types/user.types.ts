/**
 * User types for profile management
 */

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    headline?: string;
    bio?: string;
    profilePicture?: string;
    coverImage?: string;
    currentJobTitle?: string;
    currentCompany?: string;
    yearsOfExperience?: number;
    industry?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    skills?: Skill[];
    experiences?: Experience[];
    education?: Education[];
    certifications?: Certification[];
    languages?: Language[];
    projects?: Project[];
    awards?: Award[];
    publications?: Publication[];
    volunteerWork?: VolunteerWork[];
    references?: Reference[];
    customLinks?: CustomLink[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Skill {
    id: string;
    name: string;
    level?: string;
}

export interface Experience {
    id: string;
    jobTitle: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    grade?: string;
    description?: string;
}

export interface Certification {
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
}

export interface Language {
    id: string;
    name: string;
    proficiency: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    url?: string;
    technologies?: string[];
}

export interface Award {
    id: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
}

export interface Publication {
    id: string;
    title: string;
    publisher: string;
    publicationDate: string;
    url?: string;
    description?: string;
}

export interface VolunteerWork {
    id: string;
    organization: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export interface Reference {
    id: string;
    name: string;
    jobTitle?: string;
    company?: string;
    email?: string;
    phone?: string;
    relationship?: string;
}

export interface CustomLink {
    id: string;
    title: string;
    url: string;
}

/**
 * Payload for updating user profile
 */
export interface UserUpdatePayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    headline?: string;
    bio?: string;
    profilePicture?: string;
    coverImage?: string;
    currentJobTitle?: string;
    currentCompany?: string;
    yearsOfExperience?: number;
    industry?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
}

export default User;
