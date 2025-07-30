export interface ServiceData {
    id: number;
hash: string;
title: string;
description?: string;
type: 'offered' | 'needed';
name?: string;
categories?: ServiceCategory[];
user?: {
name: string;
};
}

export interface CategoryData {
id: number;
hash: string;
name: string;
slug: string;
type: string;
level: number;
is_active: boolean;
description?: string;
parent_id?: number;
children?: {        
id: number;
hash: string;
name: string;
slug: string;
}[];
created_at?: string;
updated_at?: string;
}

