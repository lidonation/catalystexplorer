import Title from '@/Components/atoms/Title';
import ArrowTopRightIcon from '@/Components/svgs/TopRightArrowIcon';
import { useState } from 'react';

type PostCardProps = {
    post: App.DataTransferObjects.PostData;
};

export default function PostCard({ post }: PostCardProps) {
    const heroData = JSON.parse(post?.hero);
    const thumbnail: string = heroData.responsive_images.thumbnail?.base64svg;
    const originalUrl: string = heroData?.original_url;

    const [imgSrc, setImgSrc] = useState(thumbnail);

    const handleImageLoad = () => {
        setImgSrc(originalUrl);
    };

    return (
        <article
            className="flex w-full flex-col"
            role="region"
            aria-labelledby={`post-title-${post?.id}`}
            data-testid={`post-card-${post?.id}`}
        >
            <div className="h-auto w-full">
                <img
                    className="aspect-video h-full w-full rounded-lg object-cover"
                    src={imgSrc}
                    loading="lazy"
                    alt={heroData?.name}
                    onLoad={imgSrc === thumbnail ? handleImageLoad : undefined}
                    data-testid={`post-card-image-${post?.id}`}
                />
            </div>
            <div className="mt-4 flex items-center">
                <p
                    className="text-4 text-accent font-bold"
                    aria-label={`Author: ${post?.author_name}`}
                    data-testid={`post-author-${post?.id}`}
                >
                    {post?.author_name}
                </p>
                <div
                    className="bg-accent mr-2 ml-2 h-1 w-1 rounded-full"
                    aria-hidden="true"
                ></div>
                <p
                    className="text-4 text-accent font-bold"
                    aria-label={`Published on: ${post?.published_at}`}
                    data-testid={`post-published-at-${post?.id}`}
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
                data-testid={`post-link-${post?.id}`}
            >
                <Title
                    level="3"
                    id={`post-title-${post?.id}`}
                    className="text-content group-hover:text-primary w-full text-2xl font-extrabold"
                >
                    {post?.title}
                </Title>
                <ArrowTopRightIcon
                    className="text-content group-hover:text-primary ml-4 cursor-pointer"
                    aria-hidden="true"
                />
            </a>
            <div className="text-content mt-2 mb-4 w-full opacity-70">
                <p
                    aria-label={`Subtitle: ${post?.subtitle}`}
                    data-testid={`post-subtitle-${post?.id}`}
                >
                    {post?.subtitle}
                </p>
            </div>
        </article>
    );
}
