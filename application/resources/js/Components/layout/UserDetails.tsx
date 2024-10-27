import LogOutIcon from "../svgs/LogOut";

function UserDetails() {
    return (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-400"></div>
                <div className="flex flex-col">
                    <p className="text-sm text-content-primary">Catalyst Explorer</p>
                    <p className="text-xs text-content-primary">support@lidonation.com</p>
                </div>
            </div>
            <LogOutIcon width={20} height={20} />
        </div>
    );
}

export default UserDetails;
