import axios from 'axios';
import { Send } from 'lucide-react';
import { useRef, useState } from 'react';
import UserAvatar from '../UserAvatar';
import PrimaryButton from './PrimaryButton';
import Textarea from './Textarea';
import UserData = App.DataTransferObjects.UserData;

interface ReplyBoxProps {
    parentId: string | null;
    commentableType: string;
    commentableHash: string;
    onPosted: (data: any) => void;
    user?: UserData;
}

export default function ReplyBox({
    parentId,
    commentableType,
    commentableHash,
    onPosted,
    user,
}: ReplyBoxProps) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const submit = async () => {
        if (!text.trim()) return;

        setLoading(true);

        try {
            const res = await axios.post(route('api.comments.store'), {
                parent_id: parentId,
                text,
                commentable_type: commentableType,
                commentable_id: commentableHash,
            });

            setText('');
            onPosted(res.data);
            inputRef.current?.focus();
        } catch (error) {
            console.error('Comment post failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 ml-12 flex gap-2">
            <div className="flex-shrink-0">
                <UserAvatar
                    name={user?.name ?? 'Anonymous'}
                    imageUrl={user?.hero_img_url ?? ''}
                    size="size-10"
                />
            </div>
            <div className="flex w-full flex-col">
                <Textarea
                    autoFocus
                    placeholder="Write your reply..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    data-testid="replybox-textarea"
                />
                <PrimaryButton
                    className="mt-2 ml-auto"
                    disabled={loading || !text.trim()}
                    onClick={submit}
                    data-testid="replybox-submit-button"
                >
                    <Send className="h-4 w-4" />
                </PrimaryButton>
            </div>
        </div>
    );
}
