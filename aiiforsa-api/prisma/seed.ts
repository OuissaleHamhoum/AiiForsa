import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);

  const adminCvParsed = {
    personalInformation: {
      fullName: 'Admin User',
      email: 'admin@aiiforsa.com',
      phone: '+15550100',
      location: 'San Francisco, CA',
      links: [
        'https://linkedin.com/in/adminuser',
        'https://github.com/adminuser',
      ],
      summary:
        'Experienced system administrator with 8+ years in IT infrastructure management and team leadership.',
    },
    education: [
      {
        degree: 'Master of Science in Computer Science',
        major: 'Computer Science',
        institution: 'Stanford University',
        location: 'Stanford, CA',
        startDate: '2010-09-01',
        endDate: '2012-06-15',
        gpa: '3.8',
      },
      {
        degree: 'Bachelor of Science in Information Technology',
        major: 'Information Technology',
        institution: 'UC Berkeley',
        location: 'Berkeley, CA',
        startDate: '2006-09-01',
        endDate: '2010-05-20',
        gpa: '3.6',
      },
    ],
    workExperience: [
      {
        jobTitle: 'Senior System Administrator',
        company: 'Tech Solutions Inc.',
        location: 'San Francisco, CA',
        startDate: '2018-03-01',
        endDate: null,
        description: [
          'Managed enterprise-level IT infrastructure for 500+ employees',
          'Implemented cloud migration strategies reducing costs by 30%',
          'Led a team of 5 IT professionals',
          'Established disaster recovery protocols',
        ],
        tags: ['AWS', 'Docker', 'Kubernetes', 'Linux'],
      },
      {
        jobTitle: 'IT Administrator',
        company: 'Global Systems Corp',
        location: 'San Francisco, CA',
        startDate: '2012-07-01',
        endDate: '2018-02-28',
        description: [
          'Maintained network infrastructure and security systems',
          'Implemented backup and recovery solutions',
          'Provided technical support to end-users',
          'Managed Active Directory and Exchange Server',
        ],
        tags: ['Windows Server', 'Active Directory', 'VMware', 'Networking'],
      },
    ],
    projects: [
      {
        projectName: 'Cloud Infrastructure Migration',
        description:
          'Led the migration of legacy systems to AWS cloud infrastructure, improving scalability and reducing operational costs.',
        role: 'Project Lead',
        tags: ['AWS', 'Terraform', 'Docker', 'CI/CD'],
        startDate: '2022-01-01',
        endDate: '2022-08-31',
        link: 'https://github.com/adminuser/cloud-migration',
      },
      {
        projectName: 'Automated Backup System',
        description:
          'Developed an automated backup system for critical data using Python and AWS services.',
        role: 'Developer',
        tags: ['Python', 'AWS', 'Automation'],
        startDate: '2021-06-01',
        endDate: '2021-12-31',
        link: 'https://github.com/adminuser/backup-system',
      },
    ],
    skills: [
      'System Administration',
      'Cloud Computing',
      'Network Security',
      'Python',
      'Bash',
      'Docker',
      'Kubernetes',
      'AWS',
      'Linux',
      'Windows Server',
    ],
    languages: [
      {
        language: 'English',
        proficiency: 'Native',
      },
      {
        language: 'Spanish',
        proficiency: 'Professional Working',
      },
    ],
    certifications: [
      {
        certificationName: 'AWS Certified Solutions Architect',
        dateObtained: '2021-05-15',
        expirationDate: '2024-05-15',
      },
      {
        certificationName: 'Certified Kubernetes Administrator',
        dateObtained: '2020-11-20',
        expirationDate: '2023-11-20',
      },
    ],
    awards: [
      {
        awardName: 'IT Excellence Award',
        issuingOrganization: 'Tech Solutions Inc.',
        dateReceived: '2022-12-01',
        description:
          'Recognized for outstanding contributions to infrastructure modernization and cost optimization.',
      },
    ],
    volunteerExperience: [
      {
        role: 'Technical Mentor',
        organization: 'Code for Good',
        location: 'San Francisco, CA',
        startDate: '2019-01-01',
        endDate: '',
        description:
          'Mentor aspiring developers in coding bootcamps and provide technical guidance for non-profit projects.',
      },
    ],
  } as any;

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aiiforsa.com' },
    update: {},
    create: {
      email: 'admin@aiiforsa.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      cvParsed: adminCvParsed,
    },
  });

  // Create test user
  const userPassword = await bcrypt.hash('user123456', 12);

  const userCvParsed = {
    personalInformation: {
      fullName: 'John Doe',
      email: 'user@aiiforsa.com',
      phone: '+15550123',
      location: 'New York, NY',
      links: [
        'https://linkedin.com/in/johndoe',
        'https://github.com/johndoe',
        'https://johndoe.dev',
      ],
      summary:
        'Full-stack developer with 5+ years of experience building scalable web applications using modern technologies.',
    },
    education: [
      {
        degree: 'Bachelor of Science',
        major: 'Computer Science',
        institution: 'University of Technology',
        location: 'New York, NY',
        startDate: '2015-09-01',
        endDate: '2019-05-31',
        gpa: '3.7',
      },
    ],
    workExperience: [
      {
        jobTitle: 'Senior Full-Stack Developer',
        company: 'Tech Innovations LLC',
        location: 'New York, NY',
        startDate: '2021-03-01',
        endDate: null,
        description: [
          'Developed and maintained multiple React/Node.js applications serving 10k+ users',
          'Implemented RESTful APIs and GraphQL endpoints for mobile and web clients',
          'Led a team of 3 developers on agile development projects',
          'Optimized database queries resulting in 40% performance improvement',
        ],
        tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
      },
      {
        jobTitle: 'Full-Stack Developer',
        company: 'Digital Solutions Inc',
        location: 'New York, NY',
        startDate: '2019-06-01',
        endDate: '2021-02-28',
        description: [
          'Built responsive web applications using Angular and Express.js',
          'Integrated third-party APIs and payment systems',
          'Collaborated with design team to implement pixel-perfect UI components',
          'Maintained and improved legacy PHP applications',
        ],
        tags: ['Angular', 'Express.js', 'MongoDB', 'PHP', 'Docker'],
      },
    ],
    projects: [
      {
        projectName: 'E-Commerce Platform',
        description:
          'Built a full-featured e-commerce platform with user authentication, payment processing, and admin dashboard.',
        role: 'Lead Developer',
        tags: ['React', 'Node.js', 'Stripe API', 'MongoDB'],
        startDate: '2022-01-01',
        endDate: '2022-06-30',
        link: 'https://github.com/johndoe/ecommerce-platform',
      },
      {
        projectName: 'Task Management App',
        description:
          'Developed a collaborative task management application with real-time updates and team collaboration features.',
        role: 'Full-Stack Developer',
        tags: ['Vue.js', 'Express.js', 'Socket.io', 'PostgreSQL'],
        startDate: '2021-09-01',
        endDate: '2021-12-31',
        link: 'https://github.com/johndoe/task-manager',
      },
    ],
    skills: [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'PostgreSQL',
      'MongoDB',
      'AWS',
      'Docker',
      'Git',
    ],
    languages: [
      {
        language: 'English',
        proficiency: 'Native',
      },
      {
        language: 'Spanish',
        proficiency: 'Intermediate',
      },
    ],
    certifications: [
      {
        certificationName: 'AWS Certified Developer - Associate',
        dateObtained: '2021-08-15',
        expirationDate: '2024-08-15',
      },
      {
        certificationName: 'MongoDB Certified Developer',
        dateObtained: '2020-11-20',
        expirationDate: '2023-11-20',
      },
    ],
    awards: [
      {
        awardName: 'Employee of the Year',
        issuingOrganization: 'Tech Innovations LLC',
        dateReceived: '2022-12-01',
        description:
          'Recognized for exceptional performance and contributions to key projects.',
      },
    ],
    volunteerExperience: [
      {
        role: 'Coding Instructor',
        organization: 'Code for Community',
        location: 'New York, NY',
        startDate: '2020-01-01',
        endDate: '',
        description:
          'Teach programming fundamentals to underprivileged youth and organize coding workshops.',
      },
    ],
  } as any;

  const user = await prisma.user.upsert({
    where: { email: 'user@aiiforsa.com' },
    update: {},
    create: {
      email: 'user@aiiforsa.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
      isActive: true,
      cvParsed: userCvParsed,
    },
  });

  // Ensure cvParsed is set for user
  await prisma.user.update({
    where: { id: user.id },
    data: { cvParsed: userCvParsed },
  });

  // Seed UserSettings
  await prisma.userSettings.upsert({
    where: { userId: admin.id },
    update: {
      profileVisibility: 'PUBLIC',
      showExperience: true,
      showEducation: true,
      showSkills: true,
      allowMessages: true,
      allowJobRecommendations: true,
      emailJobAlerts: true,
      emailInterviewReminders: true,
      emailApplicationUpdates: true,
      emailWeeklySummary: true,
      emailMarketingContent: false,
      inAppJobAlerts: true,
      inAppInterviewReminders: true,
      inAppApplicationUpdates: true,
      inAppMessages: true,
      defaultView: 'kanban',
      autoApplyWithProfile: false,
      trackApplications: true,
      enableAIRecommendations: true,
    },
    create: {
      userId: admin.id,
      profileVisibility: 'PUBLIC',
      showExperience: true,
      showEducation: true,
      showSkills: true,
      allowMessages: true,
      allowJobRecommendations: true,
      emailJobAlerts: true,
      emailInterviewReminders: true,
      emailApplicationUpdates: true,
      emailWeeklySummary: true,
      emailMarketingContent: false,
      inAppJobAlerts: true,
      inAppInterviewReminders: true,
      inAppApplicationUpdates: true,
      inAppMessages: true,
      defaultView: 'kanban',
      autoApplyWithProfile: false,
      trackApplications: true,
      enableAIRecommendations: true,
    },
  });

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {
      profileVisibility: 'PRIVATE',
      showExperience: true,
      showEducation: true,
      showSkills: true,
      allowMessages: true,
      allowJobRecommendations: true,
      emailJobAlerts: true,
      emailInterviewReminders: true,
      emailApplicationUpdates: true,
      emailWeeklySummary: true,
      emailMarketingContent: false,
      inAppJobAlerts: true,
      inAppInterviewReminders: true,
      inAppApplicationUpdates: true,
      inAppMessages: true,
      defaultView: 'list',
      autoApplyWithProfile: false,
      trackApplications: true,
      enableAIRecommendations: true,
    },
    create: {
      userId: user.id,
      profileVisibility: 'PRIVATE',
      showExperience: true,
      showEducation: true,
      showSkills: true,
      allowMessages: true,
      allowJobRecommendations: true,
      emailJobAlerts: true,
      emailInterviewReminders: true,
      emailApplicationUpdates: true,
      emailWeeklySummary: true,
      emailMarketingContent: false,
      inAppJobAlerts: true,
      inAppInterviewReminders: true,
      inAppApplicationUpdates: true,
      inAppMessages: true,
      defaultView: 'list',
      autoApplyWithProfile: false,
      trackApplications: true,
      enableAIRecommendations: true,
    },
  });

  // Helper function to map proficiency string to enum
  const mapProficiency = (prof: string): string => {
    switch (prof.toLowerCase()) {
      case 'native':
        return 'NATIVE';
      case 'fluent':
        return 'FLUENT';
      case 'professional working':
      case 'professional':
        return 'PROFESSIONAL';
      case 'limited':
        return 'LIMITED';
      case 'basic':
        return 'BASIC';
      default:
        return 'PROFESSIONAL';
    }
  };

  // Helper function to map social link type
  const mapSocialType = (url: string): string => {
    if (url.includes('linkedin')) return 'LINKEDIN';
    if (url.includes('github')) return 'GITHUB';
    if (url.includes('portfolio') || url.includes('.dev')) return 'PORTFOLIO';
    if (url.includes('twitter')) return 'TWITTER';
    if (url.includes('youtube')) return 'YOUTUBE';
    if (url.includes('instagram')) return 'INSTAGRAM';
    if (url.includes('facebook')) return 'FACEBOOK';
    return 'WEBSITE';
  };

  // Ensure cvParsed is set for admin
  await prisma.user.update({
    where: { id: admin.id },
    data: { cvParsed: adminCvParsed },
  });

  // Seed CV data for admin
  const adminData = adminCvParsed;

  // Delete existing CV data for admin
  await prisma.userSkill.deleteMany({ where: { userId: admin.id } });
  await prisma.userWorkExperience.deleteMany({ where: { userId: admin.id } });
  await prisma.userEducation.deleteMany({ where: { userId: admin.id } });
  await prisma.userProject.deleteMany({ where: { userId: admin.id } });
  await prisma.userLanguage.deleteMany({ where: { userId: admin.id } });
  await prisma.userCertification.deleteMany({ where: { userId: admin.id } });
  await prisma.userAward.deleteMany({ where: { userId: admin.id } });
  await prisma.userVolunteerWork.deleteMany({ where: { userId: admin.id } });
  await prisma.userSocialLink.deleteMany({ where: { userId: admin.id } });
  await prisma.userDesiredJobType.deleteMany({ where: { userId: admin.id } });
  await prisma.userDesiredLocation.deleteMany({ where: { userId: admin.id } });

  // Skills
  const adminSkills = adminData.skills.map((skill: string, index: number) => ({
    userId: admin.id,
    name: skill,
    level: 'ADVANCED' as const,
    category:
      skill.includes('AWS') ||
      skill.includes('Docker') ||
      skill.includes('Kubernetes')
        ? 'Cloud/DevOps'
        : 'Technical',
    order: index,
  }));
  await prisma.userSkill.createMany({ data: adminSkills });

  // Work Experience
  const adminWorkExperiences = adminData.workExperience.map(
    (exp: any, index: number) => ({
      userId: admin.id,
      jobTitle: exp.jobTitle,
      company: exp.company,
      location: exp.location,
      startDate: new Date(exp.startDate),
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      isCurrent: !exp.endDate,
      description: exp.description.join('\n'),
      order: index,
    }),
  );
  await prisma.userWorkExperience.createMany({ data: adminWorkExperiences });

  // Education
  const adminEducations = adminData.education.map(
    (edu: any, index: number) => ({
      userId: admin.id,
      degree: edu.degree,
      fieldOfStudy: edu.major,
      institution: edu.institution,
      location: edu.location,
      startDate: new Date(edu.startDate),
      endDate: new Date(edu.endDate),
      gpa: edu.gpa,
      order: index,
    }),
  );
  await prisma.userEducation.createMany({ data: adminEducations });

  // Projects
  const adminProjects = adminData.projects.map((proj: any, index: number) => ({
    userId: admin.id,
    name: proj.projectName,
    description: proj.description,
    role: proj.role,
    startDate: new Date(proj.startDate),
    endDate: new Date(proj.endDate),
    url: proj.link,
    technologies: proj.tags.join(', '),
    order: index,
  }));
  await prisma.userProject.createMany({ data: adminProjects });

  // Languages
  const adminLanguages = adminData.languages.map(
    (lang: any, index: number) => ({
      userId: admin.id,
      language: lang.language,
      proficiency: mapProficiency(lang.proficiency) as any,
      order: index,
    }),
  );
  await prisma.userLanguage.createMany({ data: adminLanguages });

  // Certifications
  const adminCertifications = adminData.certifications.map(
    (cert: any, index: number) => ({
      userId: admin.id,
      name: cert.certificationName,
      issuer: cert.issuingOrganization || 'Unknown',
      issueDate: new Date(cert.dateObtained),
      expiryDate: cert.expirationDate ? new Date(cert.expirationDate) : null,
      order: index,
    }),
  );
  await prisma.userCertification.createMany({ data: adminCertifications });

  // Awards
  const adminAwards = adminData.awards.map((award: any, index: number) => ({
    userId: admin.id,
    title: award.awardName,
    issuer: award.issuingOrganization,
    date: new Date(award.dateReceived),
    description: award.description,
    order: index,
  }));
  await prisma.userAward.createMany({ data: adminAwards });

  // Volunteer Work
  const adminVolunteers = adminData.volunteerExperience.map(
    (vol: any, index: number) => ({
      userId: admin.id,
      role: vol.role,
      organization: vol.organization,
      startDate: new Date(vol.startDate),
      endDate: vol.endDate ? new Date(vol.endDate) : null,
      isCurrent: !vol.endDate,
      description: vol.description,
      order: index,
    }),
  );
  await prisma.userVolunteerWork.createMany({ data: adminVolunteers });

  // Social Links
  const adminSocialLinks = adminData.personalInformation.links.map(
    (link: string, index: number) => ({
      userId: admin.id,
      type: mapSocialType(link) as any,
      url: link,
      isPrimary: index === 0,
      order: index,
    }),
  );
  await prisma.userSocialLink.createMany({ data: adminSocialLinks });

  // Desired Job Types
  await prisma.userDesiredJobType.createMany({
    data: [
      { userId: admin.id, jobType: 'FULL_TIME', priority: 1 },
      { userId: admin.id, jobType: 'CONTRACT', priority: 2 },
    ],
  });

  // Desired Locations
  await prisma.userDesiredLocation.createMany({
    data: [
      { userId: admin.id, country: 'United States', remote: true, priority: 1 },
      { userId: admin.id, country: 'Canada', remote: false, priority: 2 },
    ],
  });

  // Seed CV data for user
  const userData = userCvParsed;

  // Delete existing CV data for user
  await prisma.userSkill.deleteMany({ where: { userId: user.id } });
  await prisma.userWorkExperience.deleteMany({ where: { userId: user.id } });
  await prisma.userEducation.deleteMany({ where: { userId: user.id } });
  await prisma.userProject.deleteMany({ where: { userId: user.id } });
  await prisma.userLanguage.deleteMany({ where: { userId: user.id } });
  await prisma.userCertification.deleteMany({ where: { userId: user.id } });
  await prisma.userAward.deleteMany({ where: { userId: user.id } });
  await prisma.userVolunteerWork.deleteMany({ where: { userId: user.id } });
  await prisma.userSocialLink.deleteMany({ where: { userId: user.id } });
  await prisma.userDesiredJobType.deleteMany({ where: { userId: user.id } });
  await prisma.userDesiredLocation.deleteMany({ where: { userId: user.id } });

  // Skills
  const userSkills = userData.skills.map((skill: string, index: number) => ({
    userId: user.id,
    name: skill,
    level: 'ADVANCED' as const,
    category:
      skill.includes('React') || skill.includes('Node')
        ? 'Frontend/Backend'
        : 'Technical',
    order: index,
  }));
  await prisma.userSkill.createMany({ data: userSkills });

  // Work Experience
  const userWorkExperiences = userData.workExperience.map(
    (exp: any, index: number) => ({
      userId: user.id,
      jobTitle: exp.jobTitle,
      company: exp.company,
      location: exp.location,
      startDate: new Date(exp.startDate),
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      isCurrent: !exp.endDate,
      description: exp.description.join('\n'),
      order: index,
    }),
  );
  await prisma.userWorkExperience.createMany({ data: userWorkExperiences });

  // Education
  const userEducations = userData.education.map((edu: any, index: number) => ({
    userId: user.id,
    degree: edu.degree,
    fieldOfStudy: edu.major,
    institution: edu.institution,
    location: edu.location,
    startDate: new Date(edu.startDate),
    endDate: new Date(edu.endDate),
    gpa: edu.gpa,
    order: index,
  }));
  await prisma.userEducation.createMany({ data: userEducations });

  // Projects
  const userProjects = userData.projects.map((proj: any, index: number) => ({
    userId: user.id,
    name: proj.projectName,
    description: proj.description,
    role: proj.role,
    startDate: new Date(proj.startDate),
    endDate: new Date(proj.endDate),
    url: proj.link,
    technologies: proj.tags.join(', '),
    order: index,
  }));
  await prisma.userProject.createMany({ data: userProjects });

  // Languages
  const userLanguages = userData.languages.map((lang: any, index: number) => ({
    userId: user.id,
    language: lang.language,
    proficiency: mapProficiency(lang.proficiency) as any,
    order: index,
  }));
  await prisma.userLanguage.createMany({ data: userLanguages });

  // Certifications
  const userCertifications = userData.certifications.map(
    (cert: any, index: number) => ({
      userId: user.id,
      name: cert.certificationName,
      issuer: cert.issuingOrganization || 'Unknown',
      issueDate: new Date(cert.dateObtained),
      expiryDate: cert.expirationDate ? new Date(cert.expirationDate) : null,
      order: index,
    }),
  );
  await prisma.userCertification.createMany({ data: userCertifications });

  // Awards
  const userAwards = userData.awards.map((award: any, index: number) => ({
    userId: user.id,
    title: award.awardName,
    issuer: award.issuingOrganization,
    date: new Date(award.dateReceived),
    description: award.description,
    order: index,
  }));
  await prisma.userAward.createMany({ data: userAwards });

  // Volunteer Work
  const userVolunteers = userData.volunteerExperience.map(
    (vol: any, index: number) => ({
      userId: user.id,
      role: vol.role,
      organization: vol.organization,
      startDate: new Date(vol.startDate),
      endDate: vol.endDate ? new Date(vol.endDate) : null,
      isCurrent: !vol.endDate,
      description: vol.description,
      order: index,
    }),
  );
  await prisma.userVolunteerWork.createMany({ data: userVolunteers });

  // Social Links
  const userSocialLinks = userData.personalInformation.links.map(
    (link: string, index: number) => ({
      userId: user.id,
      type: mapSocialType(link) as any,
      url: link,
      isPrimary: index === 0,
      order: index,
    }),
  );
  await prisma.userSocialLink.createMany({ data: userSocialLinks });

  // Desired Job Types
  await prisma.userDesiredJobType.createMany({
    data: [
      { userId: user.id, jobType: 'FULL_TIME', priority: 1 },
      { userId: user.id, jobType: 'PART_TIME', priority: 2 },
    ],
  });

  // Desired Locations
  await prisma.userDesiredLocation.createMany({
    data: [
      { userId: user.id, country: 'United States', remote: true, priority: 1 },
      {
        userId: user.id,
        country: 'United Kingdom',
        remote: false,
        priority: 2,
      },
    ],
  });

  // Seed Companies
  await prisma.company.deleteMany();
  const company1 = await prisma.company.create({
    data: {
      name: 'Tech Solutions Inc.',
      description: 'Leading provider of IT infrastructure solutions',
      industry: 'Technology',
      size: '51-200',
      website: 'https://techsolutions.com',
      location: 'San Francisco, CA',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Tech Innovations LLC',
      description: 'Innovative software development company',
      industry: 'Technology',
      size: '11-50',
      website: 'https://techinnovations.com',
      location: 'New York, NY',
    },
  });

  // Seed Jobs
  await prisma.job.deleteMany();
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior System Administrator',
      companyName: 'Tech Solutions Inc.',
      companyId: company1.id,
      location: 'San Francisco, CA',
      type: 'FULL_TIME',
      description:
        'We are looking for an experienced System Administrator to manage our IT infrastructure.',
      requirements:
        '5+ years of experience in system administration, AWS certification preferred.',
      responsibilities:
        'Manage servers, implement security policies, support development teams.',
      salaryMin: 120000,
      salaryMax: 150000,
      currency: 'USD',
      experienceLevel: 'SENIOR',
      remote: false,
      skills: ['AWS', 'Linux', 'Docker', 'Kubernetes'],
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Full-Stack Developer',
      companyName: 'Tech Innovations LLC',
      companyId: company2.id,
      location: 'New York, NY',
      type: 'FULL_TIME',
      description: 'Join our team to build amazing web applications.',
      requirements: '3+ years of experience with React and Node.js.',
      responsibilities:
        'Develop frontend and backend features, collaborate with designers.',
      salaryMin: 90000,
      salaryMax: 120000,
      currency: 'USD',
      experienceLevel: 'MID',
      remote: true,
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    },
  });

  // Seed Tags
  await prisma.tag.deleteMany();
  const tag1 = await prisma.tag.create({
    data: {
      name: 'Remote',
      color: '#10B981',
    },
  });

  const tag2 = await prisma.tag.create({
    data: {
      name: 'Senior Level',
      color: '#F59E0B',
    },
  });

  // Seed Job Applications
  await prisma.jobApplication.deleteMany();
  await prisma.jobApplication.create({
    data: {
      userId: user.id,
      jobId: job1.id,
      jobTitle: job1.title,
      companyName: job1.companyName,
      location: job1.location,
      status: 'APPLIED',
      source: 'LINKEDIN',
      appliedAt: new Date('2023-10-01'),
      notes: 'Excited about this opportunity!',
      tags: {
        connect: [{ id: tag2.id }],
      },
    },
  });

  // Seed Posts
  await prisma.post.deleteMany();
  const post1 = await prisma.post.create({
    data: {
      caption: 'Excited to share my latest project!',
      imageUrl: 'https://example.com/image1.jpg',
      authorId: admin.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      caption: 'Looking for job recommendations in tech.',
      authorId: user.id,
    },
  });

  // Seed Comments
  await prisma.comment.deleteMany();
  await prisma.comment.create({
    data: {
      text: 'Great work!',
      authorId: user.id,
      postId: post1.id,
    },
  });

  // Seed Likes
  await prisma.like.deleteMany();
  await prisma.like.create({
    data: {
      userId: user.id,
      postId: post1.id,
    },
  });

  // Seed Notifications
  await prisma.notification.deleteMany();
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'JOB_RECOMMENDATION',
      priority: 'NORMAL',
      title: 'New Job Recommendation',
      message: 'We found a job that matches your profile!',
      actionUrl: '/jobs/' + job1.id,
    },
  });

  // Seed achievement definitions
  console.log('Seeding achievement definitions...');
  await prisma.achievementDefinition.deleteMany();

  const achievementDefinitions = [
    // Daily Challenges
    {
      key: 'DAILY_SPARK_A',
      title: 'Daily Spark A',
      description: 'Complete your first daily challenge',
      xpReward: 30,
      icon: '⚡',
      category: 'GENERAL' as const,
      repeatable: true,
      maxRepeats: 1,
    },
    {
      key: 'DAILY_SPARK_B',
      title: 'Daily Spark B',
      description: 'Complete your second daily challenge',
      xpReward: 30,
      icon: '⚡',
      category: 'GENERAL' as const,
      repeatable: true,
      maxRepeats: 1,
    },
    {
      key: 'DAILY_SPARK_C',
      title: 'Daily Spark C',
      description: 'Complete your third daily challenge',
      xpReward: 30,
      icon: '⚡',
      category: 'GENERAL' as const,
      repeatable: true,
      maxRepeats: 1,
    },
    // Career achievements
    {
      key: 'APPLICATION_ACE',
      title: 'Application Ace',
      description: 'Submit 5 job applications',
      xpReward: 50,
      icon: '📋',
      category: 'CAREER' as const,
      conditionType: 'APPLICATION_COUNT' as const,
      conditionValue: 5,
    },
    {
      key: 'INTERVIEW_TRAILBLAZER',
      title: 'Interview Trailblazer',
      description: 'Get 5 interviews',
      xpReward: 50,
      icon: '🎯',
      category: 'CAREER' as const,
      conditionType: 'INTERVIEW_COUNT' as const,
      conditionValue: 5,
    },
    {
      key: 'PROFILE_PIONEER',
      title: 'Profile Pioneer',
      description: 'Complete your profile',
      xpReward: 20,
      icon: '👤',
      category: 'PROFILE' as const,
    },
    {
      key: 'WORK_STARTER',
      title: 'Work Starter',
      description: 'Add your first work experience',
      xpReward: 10,
      icon: '💼',
      category: 'PROFILE' as const,
    },
    {
      key: 'CAREER_CLIMBER',
      title: 'Career Climber',
      description: 'Add 3 work experiences',
      xpReward: 30,
      icon: '📈',
      category: 'PROFILE' as const,
      conditionType: 'EXPERIENCE_COUNT' as const,
      conditionValue: 3,
    },
    {
      key: 'LAUNCHPAD',
      title: 'Launchpad',
      description: 'Add your first project',
      xpReward: 10,
      icon: '🚀',
      category: 'PROFILE' as const,
    },
    {
      key: 'PROJECT_BUILDER',
      title: 'Project Builder',
      description: 'Add 5 projects',
      xpReward: 50,
      icon: '🔧',
      category: 'PROFILE' as const,
      conditionType: 'PROJECT_COUNT' as const,
      conditionValue: 5,
    },
    {
      key: 'SKILL_COLLECTOR',
      title: 'Skill Collector',
      description: 'Add 5 skills',
      xpReward: 20,
      icon: '🎓',
      category: 'PROFILE' as const,
      conditionType: 'SKILL_COUNT' as const,
      conditionValue: 5,
    },
    {
      key: 'SKILL_MASTER',
      title: 'Skill Master',
      description: 'Add 10 skills',
      xpReward: 40,
      icon: '🏆',
      category: 'PROFILE' as const,
      conditionType: 'SKILL_COUNT' as const,
      conditionValue: 10,
    },
  ];

  for (const def of achievementDefinitions) {
    await prisma.achievementDefinition.create({
      data: def,
    });
  }

  // Seed daily challenges
  console.log('Seeding daily challenges...');
  await prisma.dailyChallenge.deleteMany();

  const dailyChallenges = [
    {
      key: 'VIEW_PROFILE',
      title: 'Update Your Profile',
      description: 'Spend 5 minutes updating your profile information',
      xpReward: 30,
      icon: '👤',
    },
    {
      key: 'APPLY_JOB',
      title: 'Apply to a Job',
      description: 'Submit an application for a job posting',
      xpReward: 30,
      icon: '📋',
    },
    {
      key: 'NETWORK_LINKEDIN',
      title: 'Network on LinkedIn',
      description: 'Connect with 3 professionals on LinkedIn',
      xpReward: 30,
      icon: '🤝',
    },
  ];

  for (const challenge of dailyChallenges) {
    await prisma.dailyChallenge.create({
      data: challenge,
    });
  }

  // Seed badge definitions
  console.log('Seeding badge definitions...');
  await prisma.badgeDefinition.deleteMany();

  const badgeDefinitions = [
    {
      level: 1,
      name: 'Rookie',
      description: 'Welcome to the platform!',
      icon: '🌟',
    },
    {
      level: 2,
      name: 'Apprentice',
      description: 'Getting started!',
      icon: '⭐',
    },
    {
      level: 3,
      name: 'Explorer',
      description: 'Exploring opportunities!',
      icon: '🗺️',
    },
    { level: 4, name: 'Achiever', description: 'Making progress!', icon: '🎖️' },
    {
      level: 5,
      name: 'Professional',
      description: 'Building your career!',
      icon: '💼',
    },
    {
      level: 10,
      name: 'Expert',
      description: 'Mastering your craft!',
      icon: '🏆',
    },
    { level: 15, name: 'Leader', description: 'Leading the way!', icon: '👑' },
    { level: 20, name: 'Legend', description: 'Legendary status!', icon: '🌟' },
  ];

  for (const badge of badgeDefinitions) {
    await prisma.badgeDefinition.create({
      data: badge,
    });
  }

  console.log('Seed data created successfully');
  console.log('Admin user:', { email: admin.email, password: 'admin123456' });
  console.log('Test user:', { email: user.email, password: 'user123456' });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
