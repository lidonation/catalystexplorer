import ArrowTopRightIcon from '@/Components/svgs/TopRightArrowIcon';
import { Post } from '@/types';
import { useState } from 'react';

type PostCardProps = {
    post: Post;
};

export default function PostCard({ post }: PostCardProps) {
    const heroData = JSON.parse(post?.hero);
    const thumbnail: string = heroData.responsive_images.thumbnail.base64svg;
    const originalUrl: string = heroData.original_url;

    const [imgSrc, setImgSrc] = useState(thumbnail);
    const handleImageLoad = () => {
        setImgSrc(originalUrl);
    };

    return (
        <article
            className="flex w-full flex-col"
            role="region"
            aria-labelledby={`post-title-${post.id}`}
        >
            <div className="h-auto w-full">
                <img
                    className="aspect-video h-full w-full rounded-lg object-cover"
                    src={imgSrc}
                    loading="lazy"
                    alt={`Thumbnail image for the post titled "${post?.title}"`}
                    onLoad={imgSrc === thumbnail ? handleImageLoad : undefined}
                />
            </div>
            <div className="mt-4 flex items-center">
                <p
                    className="text-4 font-bold text-accent"
                    aria-label={`Author: ${post?.author_name}`}
                >
                    {post?.author_name}
                </p>
                <div
                    className="ml-2 mr-2 h-1 w-1 rounded-full bg-accent"
                    aria-hidden="true"
                ></div>
                <p
                    className="text-4 font-bold text-accent"
                    aria-label={`Published on: ${post?.published_at}`}
                >
                    {post?.published_at}
                </p>
            </div>
            <a
                href={post?.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-2 flex w-full items-start justify-between"
                aria-label={`Read the full post titled "${post?.title}"`}
            >
                <h2
                    id={`post-title-${post.id}`}
                    className="w-full text-2xl font-extrabold text-content group-hover:text-primary"
                >
                    {post?.title}
                </h2>
                <ArrowTopRightIcon
                    className="ml-4 cursor-pointer text-content group-hover:text-primary"
                    aria-hidden="true"
                />
            </a>
            <div className="mb-4 mt-2 w-full text-content opacity-70">
                <p aria-label={`Subtitle: ${post?.subtitle}`}>
                    {post?.subtitle}
                </p>
            </div>
        </article>
    );
}
