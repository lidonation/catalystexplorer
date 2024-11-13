import ArrowTopRightIcon from "./svgs/TopRightArrowIcon";
import thumbnail from '../assets/images/Thumbnail.png';

export default function PostCard() {
    return (
        <div className="flex flex-col mt-4 bg-background-lighter w-[380px] h-[390px]">
            <div className="w-full h-[200px] rounded-lg">
                <img className="object-cover w-full h-full" src={thumbnail} alt="thumbnail" />
            </div>
            <div className="flex mt-4 items-center">
                <p className="text-sm text-accent font-bold">Olivia Rhye</p>
                <div className="w-1 h-1 bg-accent rounded-full ml-2 mr-2"></div>
                <p className="text-sm text-accent font-bold">20 Jan 2024</p>
            </div>
            <div className="w-full flex justify-between mt-2">
                <h2 className="text-2xl font-extrabold text-content w-[80%]">
                    Project Proposer and Milestone Reviewer Perspectives
                </h2>
                <ArrowTopRightIcon className="text-content cursor-pointer hover:text-highlight" />
            </div>
            <div className="w-full mt-2 mb-4">
                <p className="text-highlight">Participating in Project Catalyst using the new Milestone Module</p>
            </div>
        </div>
    )
}