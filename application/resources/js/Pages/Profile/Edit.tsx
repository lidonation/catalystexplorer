import React, { useState } from 'react';
import Card from '@/Components/Card';
import TextInput from '@/Components/atoms/TextInput';
import Button from '@/Components/atoms/Button';
import Switch from '@/Components/atoms/Switch';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import {Link2, Copy} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import LinkedInIcon from "@/Components/svgs/LinkedInIcons";
import XIcon from "@/Components/svgs/XIcon";
import WebIcon from "@/Components/svgs/WebIcon";

export default function ProfileSettings() {
    const { user } = usePage().props;
    const [isPublic, setIsPublic] = useState(true);

    // Form handling with Inertia
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        short_bio: user.short_bio || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
    });

    // function updateProfile(e) {
    //     e.preventDefault();
    //     post(route('profile.update'));
    // }

    function updateProfilePhoto(e) {
        if (!e.target.files[0]) return;

        const formData = new FormData();
        formData.append('photo', e.target.files[0]);

        // Use Inertia to upload the photo
        Inertia.post(route('profile.photo.update'), formData, {
            forceFormData: true
        });
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6">
                {/* Left Column - 4/12 width */}
                <div className="col-span-4 space-y-6">
                    {/* About Section */}
                    <Card className="rounded-lg border border-gray-100 shadow-sm">
                        <div className="p-6">
                            <div className="mb-4 space-y-4">
                                <Title
                                    level="3"
                                    className="border-b border-gray-100 pb-2 text-gray-800"
                                >
                                    About
                                </Title>
                                <div className="py-2">
                                    {data.bio ? (
                                        <Paragraph
                                            size="sm"
                                            className="text-gray-600"
                                        >
                                            {data.bio}
                                        </Paragraph>
                                    ) : (
                                        <Paragraph
                                            size="sm"
                                            className="text-gray-600"
                                        >
                                            Darlington has the brains of an
                                            engineer and the heart of a He's
                                            been using his skills and experience
                                            to help small businesses use a wide
                                            range of technologies since 2007.
                                            Darlington has a deep understanding
                                            of emerging technologies, computer
                                            programming languages, and
                                            blockchain technologies. The
                                            blockchain is a powerful, disruptive
                                            technology that is changing the
                                            world. Darlington wants the LIDO
                                            Nation community to be a part of
                                            that change, to create a better
                                            future for you, your neighbor, and
                                            the rest of us.
                                        </Paragraph>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Network Section */}
                    {/* Network Section */}
                    <Card className="rounded-lg border border-gray-100 shadow-sm">
                        <div className="p-6">
                            <div className="mb-4">
                                <Title level="3" className="border-b border-gray-100 pb-2 text-gray-800">Network</Title>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0077b5]">
                                        <LinkedInIcon className="text-white h-4 w-4" />
                                    </div>
                                    <Paragraph size="sm" className="text-gray-700">lidonation</Paragraph>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <XIcon className="text-black bg-white border border-gray-200 rounded-sm w-6 h-6 p-1" />
                                    <Paragraph size="sm" className="text-gray-700">lidonation</Paragraph>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <WebIcon className="text-pink-500 bg-white border border-pink-500 rounded-full w-6 h-6 p-1" />
                                    <Paragraph size="sm" className="text-gray-700">Lido Nation Foundation</Paragraph>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Paragraph size="sm" className="mt-4 text-gray-500">
                        JOINED JUNE 13, 2017
                    </Paragraph>

                </div>

                {/* Right Column - 8/12 width */}
                <div className="col-span-8 space-y-6">
                    {/* Personal Info Section */}
                    <Card className="border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <Title level="3" className="text-gray-800">Personal Info</Title>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <Paragraph size="sm" className="font-medium text-gray-700 mb-2">Photo</Paragraph>
                                    <div className="flex items-center space-x-4">
                                        <div className="h-20 w-20 rounded-full border-2 border-gray-300 overflow-hidden">
                                            <img
                                                src={user.profile_photo_path || "/api/placeholder/150/150"}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={updateProfilePhoto}
                                                accept="image/*"
                                            />
                                            <Button
                                                type="button"
                                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                                            >
                                                Change
                                            </Button>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <Paragraph size="sm" className="font-medium text-gray-700 mb-2">Name</Paragraph>
                                    <div className="flex items-center">
                                        <TextInput
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                        <Button
                                            className="ml-2 p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                                            type="button"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <Paragraph size="sm" className="font-medium text-gray-700 mb-2">Social Profiles</Paragraph>
                                    <div className="space-y-3">
                                        <div>
                                            <Paragraph size="sm" className="mb-1 text-gray-600">Twitter</Paragraph>
                                            <div className="flex items-center">
                                                <TextInput
                                                    value={data.twitter}
                                                    onChange={e => setData('twitter', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                                    placeholder="Twitter username"
                                                />
                                            </div>
                                            {errors.twitter && <div className="text-red-500 text-sm mt-1">{errors.twitter}</div>}
                                        </div>

                                        <div>
                                            <Paragraph size="sm" className="mb-1 text-gray-600">LinkedIn</Paragraph>
                                            <div className="flex items-center">
                                                <TextInput
                                                    value={data.linkedin}
                                                    onChange={e => setData('linkedin', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                                    placeholder="LinkedIn profile URL"
                                                />
                                            </div>
                                            {errors.linkedin && <div className="text-red-500 text-sm mt-1">{errors.linkedin}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Paragraph size="sm" className="font-medium text-gray-700 mb-2">City</Paragraph>
                                    <div className="flex items-center">
                                        <TextInput
                                            placeholder="You have no address yet"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                        <Button
                                            className="ml-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                                            type="button"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Basic Settings Section */}
                    <Card className="border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <Title level="3" className="text-gray-800">Basic Settings</Title>
                                <Switch
                                    checked={isPublic}
                                    onCheckedChange={setIsPublic}
                                    label="Public Profile"
                                    labelShouldPrecede={true}
                                    size="sm"
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Paragraph size="sm" className="font-medium text-gray-700 mb-2">Email</Paragraph>
                                    <div className="flex items-center">
                                        <TextInput
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                        <Button
                                            className="ml-2 p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                                            type="button"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                </div>

                                <div>
                                    <Paragraph size="sm" className="font-medium text-gray-700 mb-2">Password</Paragraph>
                                    <div className="flex items-center">
                                        <TextInput
                                            type="password"
                                            value="********"
                                            disabled={true}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                        />
                                        <Paragraph size="sm" className="ml-4 text-gray-500">
                                            Password last changed 2 months ago
                                        </Paragraph>
                                    </div>
                                    <Button
                                        className="mt-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                                        type="button"
                                        onClick={() => window.location.href = route('password.edit')}
                                    >
                                        Change Password
                                    </Button>
                                </div>

                                <div>
                                    <Paragraph size="sm" className="font-medium text-gray-700 mb-2">Profile Link</Paragraph>
                                    <div className="flex items-center">
                                        <TextInput
                                            value="https://catalyexplorer.com/26853367910"
                                            disabled={true}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                        />
                                        <Button
                                            className="ml-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-50"
                                            type="button"
                                        >
                                            <Link2 className="h-4 w-4 mr-1" />
                                            Re-create
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-6 flex justify-end">
                <Button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={processing}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
