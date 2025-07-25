import {useLaravelReactI18n} from "laravel-react-i18n";

export default function ProposalResultsLoading() {
    return (
        <div
            className="container mx-auto grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:max-w-full">
            {[1, 2, 3].map((proposal, index) => (
                <div
                    key={index}
                    className="bg-background min-h-96 w-full rounded-xl p-4 shadow-lg"
                >
                    <div className="h-full animate-pulse space-y-4">
                        <div className="h-36 rounded-xl bg-slate-700"></div>
                        <div className="space-y-2">
                            <div className="bg-background-light h-4 w-3/4 rounded-sm"></div>
                            <div className="bg-background-light h-4 rounded-sm"></div>
                            <div className="bg-background-light h-4 w-5/6 rounded-sm"></div>
                        </div>
                        <div className="flex justify-between">
                            <div className="bg-background-light h-4 w-24 rounded-sm"></div>
                            <div className="flex -space-x-2">
                                <div className="bg-background-light h-8 w-8 rounded-full"></div>
                                <div className="bg-background-light h-8 w-8 rounded-full"></div>
                                <div className="bg-background-light h-8 w-8 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
