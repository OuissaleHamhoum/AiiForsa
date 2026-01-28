export interface CareerIntentions {
    desiredPosition: string;
    careerGoals: string;
}

export interface CareerRoadmap {
    currentPosition: string;
    potentialPaths: string[];
}

export interface CareerProfile {
    currentPosition: string;
    experience: string;
    keySkills: string[];
}

export interface Resource {
    type:
        | 'Youtube'
        | 'Coursera'
        | 'Udemy'
        | 'Book'
        | 'Article'
        | 'Documentation'
        | 'Tutorial';
    title: string;
    url: string;
    explanation: string;
}

export interface RoadmapStep {
    id: number;
    title: string;
    description: string;
    duration: string;
    recommendedResources: Resource[];
    improvementAreas: string[];
}

export interface AdvisorData {
    intentions: CareerIntentions;
    roadmap: CareerRoadmap;
    profile: CareerProfile;
    steps: RoadmapStep[];
}
