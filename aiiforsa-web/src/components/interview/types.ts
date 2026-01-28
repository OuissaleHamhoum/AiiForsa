export interface InterviewStepsProps {
    /** Active step (1-4) */
    active?: number;

    /** Show the time remaining indicator on the right */
    showTime?: boolean;

    /** Time string to display when showTime is true */
    time?: string;
}

export default InterviewStepsProps;
