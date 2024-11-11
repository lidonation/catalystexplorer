import { usePage } from "@inertiajs/react";
import ThemeSwitcher from "./layout/ThemeSwitcher";

export default function Avatar() {
    const {auth} = usePage().props
    return (
        <div className="h-9 w-9 rounded-full bg-gray-400">
            {auth.user ? <img src={auth.avatar} alt='avatar' /> : ''}
        </div>
    )
}