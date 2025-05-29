'use client';


import { Send } from 'lucide-react';
import { useState } from 'react';
import Image from './Image';
import PrimaryButton from './atoms/PrimaryButton';
import Textarea from './atoms/Textarea';

interface Comment {
    id: string;
    author: string;
    avatar?: string;
    content: string;
    timestamp: string;
    replies?: Comment[];
}

interface CommentsProps {
    initialComments?: Comment[];
}

export default function Comments({ initialComments = [] }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>(
        initialComments.length > 0
            ? initialComments
            : [
                  {
                      id: '1',
                      author: 'Mr. Prestonson',
                      content:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                      timestamp: '1 Day ago',
                      replies: [],
                  },
                  {
                      id: '2',
                      author: 'Odep',
                      content:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit,',
                      timestamp: '1 Day ago',
                      replies: [],
                  },
                  {
                      id: '3',
                      author: 'Mr. Prestonson',
                      content:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                      timestamp: '1 Day ago',
                      replies: [],
                  },
                  {
                      id: '4',
                      author: 'Mr. Prestonson',
                      content:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                      timestamp: '1 Day ago',
                      replies: [],
                  },
              ],
    );

    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const handleAddComment = () => {
        if (newComment.trim()) {
            const comment: Comment = {
                id: Date.now().toString(),
                author: 'You',
                content: newComment,
                timestamp: 'Just now',
                replies: [],
            };
            setComments([...comments, comment]);
            setNewComment('');
        }
    };

    const handleAddReply = (commentId: string) => {
        if (replyText.trim()) {
            const reply: Comment = {
                id: Date.now().toString(),
                author: 'You',
                content: replyText,
                timestamp: 'Just now',
                replies: [],
            };

            setComments(
                comments.map((comment) => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), reply],
                        };
                    }
                    return comment;
                }),
            );

            setReplyText('');
            setReplyingTo(null);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const CommentItem = ({
        comment,
        isReply = false,
    }: {
        comment: Comment;
        isReply?: boolean;
    }) => (
        <div className={`flex gap-3 ${isReply ? 'mt-3 ml-12' : 'mb-6'}`}>
            <Image className="h-10 w-10 flex-shrink-0">
                {/* <AvatarImage src={comment.avatar || '/placeholder.svg'} />
                <AvatarFallback className="bg-gray-200 text-gray-600">
                    {getInitials(comment.author)}
                </AvatarFallback> */}
            </Image>
            <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                            {comment.author}
                        </span>
                        <span className="text-sm text-gray-500">
                            {comment.timestamp}
                        </span>
                    </div>
                    {!isReply && (
                        <PrimaryButton
                            className="text-bg-primary hover:bg-primary h-auto px-2 py-1"
                            onClick={() =>
                                setReplyingTo(
                                    replyingTo === comment.id
                                        ? null
                                        : comment.id,
                                )
                            }
                        >
                            Reply
                        </PrimaryButton>
                    )}
                </div>
                <p className="text-sm leading-relaxed text-gray-700">
                    {comment.content}
                </p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                isReply={true}
                            />
                        ))}
                    </div>
                )}

                {/* Reply input */}
                {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-gray-200 text-xs text-gray-600">
                                Y
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 gap-2">
                            <Textarea
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <PrimaryButton
                                onClick={() => handleAddReply(comment.id)}
                                disabled={!replyText.trim()}
                                className="self-end"
                            >
                                <Send className="h-4 w-4" />
                            </PrimaryButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="mx-auto max-w-2xl bg-white p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Comments
            </h2>

            {/* Comments list */}
            <div className="space-y-0">
                {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>

            {/* Add new comment */}
            <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
                <Image className="h-10 w-10 flex-shrink-0">
                    {/* <AvatarFallback className="bg-gray-200 text-gray-600">
                        Y
                    </AvatarFallback> */}
                </Image>
                <div className="flex flex-1 gap-2">
                    <Textarea
                        placeholder="your comment.."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <PrimaryButton
                        
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="self-end"
                    >
                        <Send className="h-4 w-4" />
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
