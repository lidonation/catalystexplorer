import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import CompletionNftImage from "@/assets/images/project-completion-nfts.jpg";
import LoginForm from "@/Components/LoginForm";
import PeopleIcon from "@/Components/svgs/PeopleIcon";
import FileIcon from "@/Components/svgs/FileIcon";
import UsdIcon from "@/Components/svgs/UsdIcon";
import AdaIcon from "@/Components/svgs/AdaIcon";
import StatisticCard from "./Partials/StatisticCard";


const Index = () => {
    const { t } = useTranslation();

    const statistics = [
        {
            value: "1436",
            description: t("completedProjectNfts.communityFunded"),
            icon: <PeopleIcon stroke="#3FACD1" />
        },
        {
            value: "1064",
            description: t("completedProjectNfts.projectsCompleted"),
            icon: <FileIcon /> },
        {
            value: "$35.37M",
            description: t("completedProjectNfts.usdDistributed"),
            icon:  <UsdIcon />,},
        {
            value: "84.96M ₳",
            description: t("completedProjectNfts.adaDistributed"),
            icon: <AdaIcon />,},
    ];

    return (
        <>
            <Head title="Charts" />

            <header className="py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <h1 className="text-4xl font-bold mb-4">{t("completedProjectNfts.title")}</h1>
                    <p className="text-lg">{t("completedProjectNfts.subtitle")}</p>
                </div>
            </header>

            {/* Hero Section */}
            <div className="container mx-auto px-4 sm:px-6">
                <div className="relative w-full rounded-lg overflow-hidden">
                    <img
                        src={CompletionNftImage}
                        alt="Project Catalyst Hero"
                        className="w-full h-auto object-cover"
                    />
                </div>
            </div>

            {/* Proposals Search Bar */}
            {/* <CompletedNftsProposalSearchBar
                autoFocus={true}
                showRingOnFocus={true}
                handleSearch={(query) => console.log(query)}
                focusState={(isFocused) => console.log(isFocused)}
            /> */}

            {/* Statistics Section */}
            <section className="container mx-auto px-4 py-12 md:w-11/12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {statistics.map((stat, index) => (
                        <StatisticCard
                            key={index}
                            value={stat.value}
                            description={stat.description}
                            icon={stat.icon}
                        />
                    ))}
                </div>

                <div className="max-w-3xl mx-auto mt-8">
                    <p className="text-sm text-center">
                        {t("completedProjectNfts.description")}{" "}
                        <a href="/hello-its-nashon" className="underline ml-1">
                            {t("completedProjectNfts.artistStatement")}
                        </a>
                    </p>
                </div>
            </section>

            <LoginForm title={`${t("completedProjectNfts.nowMinting")}: ${t("funds.funds")} 2-12`} />
        </>
    );
};

export default Index;
