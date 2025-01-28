import PrimaryButton from '@/Components/PrimaryButton';
import ArrowLeftIcon from '@/Components/svgs/ArrowLeft';
import CustomSwitch from '@/Components/Switch';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { TransitionListPageProps } from '../../../../../../types/general';
import { useList } from '@/Context/ExtendedListContext';

const BookmarkPage2 = ({ onNavigate }: TransitionListPageProps) => {
    const { addList, isAddingList } = useList();
    const [error, setError] = useState<Error | null>(null);
    const { data, setData, reset } = useForm({
        title: '',
        content: '',
        visibility: 'private' as 'private' | 'public',
    });

    const handleSubmit = async () => {
        try {
            if (!data.title) {
                setError(new Error('Please fill in all fields'));
                return;
            }
            console.log(data.title.trim().length)
            if (data.title.trim().length < 5) {
                setError(new Error('Title must be at least 5 characters'));
                return;
            }
            await addList({
                title: data.title,
                content: data.content || null,
                visibility: data.visibility,
            });
            //clear form
            reset();
            setError(null);
            onNavigate?.(2);
        } catch (error) {
            console.error(error);
            setError(new Error('Failed to create list'));
        }
    };
    return (
        <div className="space-y-2">
            <div className="bg-primary-light">
                <button
                    onClick={() => onNavigate?.(0)}
                    className="flex items-center gap-2 px-3 py-2 font-bold text-content"
                >
                    <ArrowLeftIcon />
                    <p>New List</p>
                </button>
            </div>
            <section className="flex flex-col gap-3 px-3">
                <div className="flex flex-col gap-2">
                    <TextInput
                        type="text"
                        placeholder="Create new list"
                        className="w-full border p-2 text-sm"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                    />
                    <textarea
                        placeholder="Add description"
                        className="w-full rounded-md border border-border-primary border-opacity-40 bg-background p-2 text-sm text-content shadow-sm focus:border-primary"
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                    />
                </div>

                <div>
                    <CustomSwitch
                        checked={data.visibility === 'public'}
                        onCheckedChange={(value) => setData('visibility', value ? 'public' : 'private')}
                        label="Make public?"
                        labelShouldPrecede
                        className="w-full"
                    />
                </div>
                {error && (
                    <p className="text-sm text-red-600">{error.message}</p>
                )}

                <PrimaryButton
                    className="my-2 flex w-full items-center justify-center rounded-lg text-center capitalize"
                    onClick={handleSubmit}
                    loading={isAddingList}
                >
                    Create List
                </PrimaryButton>
            </section>
        </div>
    );
};
export default BookmarkPage2;
