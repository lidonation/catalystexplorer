export interface User {
    hash: string;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth?: {
        user: User;
    };
};

export type Post = {
    id: number;
    subtitle: string;
    title: string;
    summary: string;
    hero: any;
    author_gravatar: string;
    author_name: string;
    link: string;
    published_at: string;
    read_time: string;
    type: string;
};
