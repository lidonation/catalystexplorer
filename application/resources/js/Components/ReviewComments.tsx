import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import CommentReplyBox from './atoms/CommentReplyBox';
import Card from './Card';
import CommentItem from './CommentItem';
import LoadingSpinner from './svgs/LoadingSpinner';
import UserData = App.DataTransferObjects.UserData;
import CommentData = App.DataTransferObjects.CommentData;
import Paragraph from '@/Components/atoms/Paragraph.tsx';

interface ReviewCommentsProps {
    reviewId?: string | null;
    team?: any;
}

export default function ReviewComments({
    reviewId,
    team,
}: ReviewCommentsProps) {
    const [comments, setComments] = useState<CommentData[]>([]);
    const [loading, setLoading] = useState(true);

    const { t } = useLaravelReactI18n();
    const user = usePage().props?.auth?.user as UserData | undefined;

    const isTeamMember = team?.some((profile: { model: { claimed_profiles: any[]; }; }) => {
        if (!user?.id || !profile?.model || !profile.model.claimed_profiles) return false;
        return profile.model.claimed_profiles.some((claim: any) => claim?.user_id === user.id);
    }) ?? false;

    const canReply = isTeamMember && !!user;

    const fetchComments = async () => {
        if (!reviewId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(
                route('api.comments.index', {
                    commentable_type: 'Review',
                    commentable_id: reviewId,
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
        fetchComments().then();
    }, [reviewId]);

    const handleCommentPosted = (newComments: CommentData[]) => {
        setComments(newComments);
    };
    
    if (!reviewId) {
        return null;
    }
    
    // Check if comments section should be visible
    const hasComments = comments.length > 0;
    const userHasComments = user && comments.some(comment => 
        comment.commentator?.id === user.id
    );
    const shouldShowComments = hasComments || !!userHasComments;
    
    // Don't render anything if no comments and user doesn't have comments
    if (!shouldShowComments && !loading) {
        return null;
    }

    return (
        <Card className="bg-background py-6 px-2">
            <h2 className="border-gray-light border-b pb-4 text-xl font-bold">
                {t('comments.conversations')}
            </h2>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="mt-4 space-y-4">
                    {comments.length === 0 ? (
                        // <Paragraph className="text-dark text-sm">
                        //     No comments yet.{' '}
                        //     {canReply ? 'Be the first to reply!' : ''}
                        // </Paragraph>
                        <span></span>
                    ) : (
                        comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                commentable_type="Review"
                                commentable_id={reviewId}
                                user={user}
                                setComments={handleCommentPosted}
                            />
                        ))
                    )}
                </div>
            )}
            {/* Team member reply input */}
            {canReply && user && (
                <CommentReplyBox
                    user={user}
                    parentId={null}
                    commentableType="Review"
                    commentableHash={reviewId}
                    onPosted={handleCommentPosted}
                />
            )}
        </Card>
    );
}
