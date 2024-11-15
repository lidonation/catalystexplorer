import ArrowTopRightIcon from "@/Components/svgs/TopRightArrowIcon";
import thumbnail from '../../../assets/images/Thumbnail.png';

export default function PostCard() {
    return (
        <div className="flex flex-col w-full">
            <div className="w-full h-auto">
                <img className="object-cover w-full h-full rounded-lg" src={thumbnail} alt="thumbnail" />
            </div>
            <div className="flex mt-4 items-center">
                <p className="text-4 text-accent font-bold">Olivia Rhye</p>
                <div className="w-1 h-1 bg-accent rounded-full ml-2 mr-2"></div>
                <p className="text-4 text-accent font-bold">20 Jan 2024</p>
            </div>
            <div className="w-full flex items-center justify-between mt-2">
                <h2 className="text-2xl font-extrabold text-content w-full">
                    Project Proposer and Milestone Reviewer Perspectives
                </h2>
                <ArrowTopRightIcon className="text-content cursor-pointer hover:text-light ml-4" />
            </div>
            <div className="w-full mt-2 mb-4 text-content opacity-70">
                <p>Participating in Project Catalyst using the new Milestone Module</p>
            </div>
        </div>
    )
}
