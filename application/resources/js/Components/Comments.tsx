import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import TopLevelCommentInput from './atoms/TopLevelComment';
import Card from './Card';
import CommentItem from './CommentItem';
import LoadingSpinner from './svgs/LoadingSpinner';
import UserData = App.DataTransferObjects.UserData;
import CommentData = App.DataTransferObjects.CommentData;

interface CommentsProps {
    commentableType: string;
    commentableHash: string;
}

export default function Comments({
    commentableType,
    commentableHash,
}: CommentsProps) {
    const [comments, setComments] = useState<CommentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const { t } = useLaravelReactI18n();
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

    return (
        <Card className="bg-white p-6">
            <h2 className="border-gray-light border-b pb-4 text-xl font-bold">
                {t('comments.comments')}
            </h2>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="mt-4 space-y-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            commentable_type={commentableType}
                            commentable_id={commentableHash}
                            user={user}
                            setComments={(comments) => setComments(comments)}
                        />
                    ))}
                </div>
            )}
            {/* Add new top-level comment */}
            <TopLevelCommentInput
                user={user}
                commentableType={commentableType}
                commentableHash={commentableHash}
                onPosted={(comments) => {
                    setComments(comments);
                    setReplyingTo(null);
                }}
            />
        </Card>
    );
}
