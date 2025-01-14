import PrimaryButton from '@/Components/PrimaryButton';
import ArrowLeftIcon from '@/Components/svgs/ArrowLeft';
import CustomSwitch from '@/Components/Switch';
import TextInput from '@/Components/TextInput';
import { useList } from '@/Context/ListContext';
import { useState } from 'react';
import { TransitionListPageProps } from '../../../../../../types/general';

const BookmarkPage2 = ({ onNavigate }: TransitionListPageProps) => {
    const { addList, isAddingList } = useList();
    const [error, setError] = useState<Error | null>(null);
    const [formState, setFormState] = useState({
        name: '',
        description: '',
        isPublic: false,
    });
    const [checked, setChecked] = useState(false);

    const handleSubmit = async () => {
        try {
            if (!formState.name || !formState.description) {
                setError(new Error('Please fill in all fields'));
                return;
            }
            await addList({
                name: formState.name,
                description: formState.description,
                isPublic: checked,
            });
            //clear form
            setFormState({
                name: '',
                description: '',
                isPublic: false,
            });
            setError(null);
            onNavigate?.(2);
        } catch (error) {
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
                        value={formState.name}
                        onChange={(e) =>
                            setFormState((prevState) => ({
                                ...prevState,
                                name: e.target.value,
                            }))
                        }
                    />
                    <textarea
                        placeholder="Add description"
                        className="w-full rounded-md border border-border-primary border-opacity-40 bg-background p-2 text-sm text-content shadow-sm focus:border-primary"
                        value={formState.description}
                        onChange={(e) =>
                            setFormState((prevState) => ({
                                ...prevState,
                                description: e.target.value,
                            }))
                        }
                    />
                </div>

                <div>
                    <CustomSwitch
                        checked={checked}
                        onCheckedChange={setChecked}
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
