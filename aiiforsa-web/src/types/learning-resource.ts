export type LearningResource = {
    id: string;
    title: string;
    description?: string;
    source: string;
    url: string;
    tags?: string[];
    stars?: number;
    thumbnail?: string;
    duration?: string;
    difficulty?: string;
};

export type ResourceResponse = {
    items: LearningResource[];
};
