import { Button } from '@headlessui/react';
import { useState } from 'react';
import RichContent from './RichContent';
import UserAvatar from './UserAvatar';
import ReplyBox from './atoms/CommentReplyBox';
import { formatTimeAgo } from './layout/TimeFormatter';
import UserData = App.DataTransferObjects.UserData;
import CommentData = App.DataTransferObjects.CommentData;

import { useTranslation } from 'react-i18next';

const CommentItem = ({
    comment,
    commentable_type,
    commentable_id,
    user,
    setComments,
}: {
    commentable_type: string;
    commentable_id: string;
    comment: CommentData;
    user?: UserData;
    setComments: (comments: CommentData[]) => void;
}) => {
    const [isReplying, setIsReplying] = useState(false);

    const isTopLevel = comment.parent_id === null;

    const { t } = useTranslation();

    return (
        <div className={`flex gap-3 ${isTopLevel ? 'mb-6' : 'mt-4 ml-12'}`}>
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <UserAvatar
                            name={comment.commentator?.name ?? 'Anonymous'}
                            imageUrl={comment.commentator?.hero_img_url ?? ''}
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
                                        setIsReplying(true);
                                    }}
                                >
                                    {t('comments.reply')}
                                </Button>
                            )}
                        </div>
                        <RichContent content={comment.text} format={'html'} />
                    </div>
                </div>

                {/* Only show one level of nesting */}
                {comment.nested_comments &&
                    comment.nested_comments.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {comment.nested_comments.map(
                                (child: CommentData) => (
                                    <CommentItem
                                        user={user}
                                        key={child.hash}
                                        comment={child}
                                        commentable_type={commentable_type}
                                        commentable_id={commentable_id}
                                        setComments={() => setComments}
                                    />
                                ),
                            )}
                        </div>
                    )}

                {isReplying && (
                    <ReplyBox
                        user={user}
                        parentId={comment?.hash ?? null}
                        commentableType={commentable_type}
                        commentableHash={commentable_id}
                        onPosted={(comments) => {
                            console.log({ comments });

                            setComments(comments);
                            setIsReplying(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default CommentItem;
