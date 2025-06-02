import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import UserAvatar from '../UserAvatar';
import PrimaryButton from './PrimaryButton';
import Textarea from './Textarea';
import UserData = App.DataTransferObjects.UserData;

interface ReplyBoxProps {
    parentId: number;
    commentableType: string;
    commentableHash: string;
    onPosted: () => void;
    user?: UserData;
}

export default function ReplyBox({
    parentId,
    commentableType,
    commentableHash,
    onPosted,
    user,
}: ReplyBoxProps) {
    const form = useForm({
        text: '',
        parent_id: parentId,
        commentable_type: commentableType,
        commentable_id: commentableHash,
    });

    const submit = () => {
        form.post(route('api.comments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('text');
                onPosted();
            },
        });
    };

    return (
        <div className="mt-2 ml-12 flex gap-2">
            <div className="flex-shrink-0">
                <UserAvatar
                    name={user?.name ?? 'Anonymous'}
                    imageUrl={user?.hero_img_url ?? ''}
                    size="size-10"
                />
            </div>
            <div className="flex flex-col w-full">
                <Textarea
                    autoFocus
                    placeholder="Write your reply..."
                    value={form.data.text}
                    onChange={(e) => form.setData('text', e.target.value)}
                />
                <PrimaryButton
                    className="mt-2 ml-auto"
                    disabled={form.processing || !form.data.text.trim()}
                    onClick={submit}
                >
                    <Send className="h-4 w-4" />
                </PrimaryButton>
            </div>
        </div>
    );
}
