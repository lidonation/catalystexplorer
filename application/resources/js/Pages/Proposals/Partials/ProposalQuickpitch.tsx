export default function ProposalQuickpitch() {
    return (
        <section aria-labelledby="video-heading" className="h-full">
            <h2 id="video-heading" className="sr-only">
                Project Video
            </h2>
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-blue-200 to-purple-200">
                <button
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
                    aria-label="Play proposal quickpitch video"
                >
                    <div className="flex items-center justify-center rounded-full bg-background backdrop-blur-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="ml-1 size-10 text-content-light"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                            />
                        </svg>
                    </div>
                </button>
            </div>
        </section>
    );
}
