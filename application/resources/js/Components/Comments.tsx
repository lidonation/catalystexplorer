'use client';

import { Button } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './atoms/PrimaryButton';
import ReplyBox from './atoms/ReplyBox';
import Textarea from './atoms/Textarea';
import Card from './Card';
import { formatTimeAgo } from './layout/TimeFormatter';
import RichContent from './RichContent';
import LoadingSpinner from './svgs/LoadingSpinner';
import UserAvatar from './UserAvatar';

interface Comment {
    id: number;
    commentator_name: string;
    text: string;
    created_at: string;
    parent_id: number | null;
    nested_comments?: Comment[];
}

interface CommentsProps {
    commentableType: string;
    commentableHash: string;
}

export default function Comments({
    commentableType,
    commentableHash,
}: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const form = useForm({
        text: '',
        parent_id: null as number | null,
        commentable_type: commentableType,
        commentable_id: commentableHash,
    });
    const { t } = useTranslation();
    const user = usePage().props?.auth?.user;

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                route('api.comments.index', {
                    commentable_type: commentableType,
                    commentable_id: commentableHash,
                }),
            );
            const data = res.data;
            setComments(data);
        } catch (err) {
            console.error('Failed to load comments', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, [commentableType, commentableHash]);

    const submitComment = () => {
        form.post(route('api.comments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('text');
                form.setData('parent_id', null);
                setReplyingTo(null);
                fetchComments();
            },
        });
    };

    const CommentItem = ({ comment }: { comment: Comment }) => {
        const isTopLevel = comment.parent_id === null;
        const isReplying = replyingTo === comment.id;

        return (
            <div className={`flex gap-3 ${isTopLevel ? 'mb-6' : 'mt-4 ml-12'}`}>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <UserAvatar
                                name={comment.commentator?.name ?? 'Anonymous'}
                                imageUrl={
                                    comment.commentator?.hero_img_url ?? ''
                                }
                                size="size-10"
                            />
                        </div>
                        <div className="flex w-full flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <span className="font-medium">
                                    {comment.commentator?.name ?? 'Anonymous'}
                                </span>
                                <span className="text-dark text-sm">
                                    {formatTimeAgo(comment.created_at)}
                                </span>
                                {isTopLevel && (
                                    <Button
                                        className="text-primary mt-1 ml-auto border-b border-dotted hover:underline"
                                        onClick={() => {
                                            setReplyingTo(comment.id);
                                        }}
                                    >
                                        Reply
                                    </Button>
                                )}
                            </div>
                            <RichContent
                                content={comment.text}
                                format={'html'}
                            />
                        </div>
                    </div>

                    {isReplying && isTopLevel && (
                        <ReplyBox
                            user={user}
                            parentId={comment.id}
                            commentableType={commentableType}
                            commentableHash={commentableHash}
                            onPosted={() => {
                                setReplyingTo(null);
                                fetchComments();
                            }}
                        />
                    )}

                    {/* Only show one level of nesting */}
                    {comment.nested_comments &&
                        comment.nested_comments.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {comment.nested_comments.map((child) => (
                                    <CommentItem
                                        key={child.id}
                                        comment={child}
                                    />
                                ))}
                            </div>
                        )}
                </div>
            </div>
        );
    };

    return (
        <Card className="bg-white p-6">
            <h2 className="border-gray-light border-b pb-4 text-xl font-bold">
                {t('Comments')}
            </h2>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="mt-4 space-y-4">
                    {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            )}

            {/* Add new top-level comment */}
            <div className="my-4 flex gap-2">
                <div className="flex-shrink-0">
                    <UserAvatar
                        name={user?.name ?? 'Anonymous'}
                        imageUrl={user?.hero_img_url ?? ''}
                        size="size-10"
                    />
                </div>
                <div className="flex w-full flex-col">
                    <Textarea
                        placeholder="Add a comment..."
                        value={form.data.text}
                        onChange={(e) => form.setData('text', e.target.value)}
                    />
                    <PrimaryButton
                        className="mt-2 ml-auto"
                        onClick={submitComment}
                        disabled={form.processing || !form.data.text.trim()}
                    >
                        {form.processing ? (
                            'Posting...'
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </PrimaryButton>
                </div>
            </div>
        </Card>
    );
}
