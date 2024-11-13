export default function PostCard(){
    return (
        <div className="flex flex-col mt-4 bg-background w-1/3">
            <div className="w-full h-[200px] bg-yellow-500 border rounded-lg">
               <img src="" alt="thumbnail"/>
            </div>
            <div className="flex mt-4">
                <p className="text-sm">Olivia Rhye</p>
                <p className="text-sm">20 Jan 2024</p>
            </div>
        </div>
    )
}