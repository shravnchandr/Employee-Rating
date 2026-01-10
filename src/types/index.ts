export interface Employee {
    id: number;
    name: string;
    photo: string | null;
    avatar: string;
}

export interface Rating {
    id: number;
    raterId: number | 'admin';
    raterName: string;
    isAdminRating: boolean;
    ratedEmployeeId: number;
    category: string;
    rating: string;
    feedback?: string;
    timestamp: string;
}
