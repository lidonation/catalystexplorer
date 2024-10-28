import catalystWhiteLogo from '@/assets/images/catalyst-explorer-all-white-logo.png';

export default function Footer() {
    return (
        <footer className="flex min-h-96 w-full flex-col justify-between gap-16 rounded-t-xl bg-gradient-to-r from-[#1B2230] to-[#475467] pb-12 pt-16">
            <section className="mx-auto max-w-7xl text-white">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    <div className="flex min-w-24 flex-col gap-4">
                        <h2 className="text-lg">Proposals</h2>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <p>All proposals</p>
                            </li>
                            <li>
                                <p>proposal Reviews</p>
                            </li>
                            <li>
                                <p>Monthly Reports</p>
                            </li>
                            <li>
                                <p>Funds</p>
                            </li>
                        </ul>
                    </div>
                    <div className="flex min-w-24 flex-col gap-4">
                        <h2 className="text-lg">People</h2>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <p>All proposals</p>
                            </li>
                            <li>
                                <p>proposal Reviews</p>
                            </li>
                            <li>
                                <p>Monthly Reports</p>
                            </li>
                            <li>
                                <p>Funds</p>
                            </li>
                        </ul>
                    </div>
                    <div className="flex min-w-24 flex-col gap-4">
                        <h2 className="text-lg">Data</h2>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <p>All proposals</p>
                            </li>
                            <li>
                                <p>proposal Reviews</p>
                            </li>
                            <li>
                                <p>Monthly Reports</p>
                            </li>
                            <li>
                                <p>Funds</p>
                            </li>
                        </ul>
                    </div>
                    <div className="flex min-w-24 flex-col gap-4">
                        <h2 className="text-lg">Social</h2>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <p>All proposals</p>
                            </li>
                            <li>
                                <p>proposal Reviews</p>
                            </li>
                            <li>
                                <p>Monthly Reports</p>
                            </li>
                            <li>
                                <p>Funds</p>
                            </li>
                        </ul>
                    </div>
                    <div className="flex min-w-24 flex-col gap-4">
                        <h2 className="text-lg">Legal</h2>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <p>All proposals</p>
                            </li>
                            <li>
                                <p>proposal Reviews</p>
                            </li>
                            <li>
                                <p>Monthly Reports</p>
                            </li>
                            <li>
                                <p>Funds</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
            <section className="px-8">
                <div className="flex justify-between border-t pt-8">
                    <div className="px-6">
                        <img
                            className="h-8"
                            src={catalystWhiteLogo}
                            alt="Catalyst Explorer logo"
                        />
                    </div>
                    <p className="text-base font-normal text-gray-300">
                        © 2024 Catalyst Explorer. All rights reserved.
                    </p>
                </div>
            </section>
        </footer>
    );
}
