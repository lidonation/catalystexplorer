export default function UserAvatar({ size = 'size-9', ...props }) {
    return (
        <img
            src={props.imageUrl}
            alt="avatar"
            className={'rounded-full ' + size}
            aria-label="User avatar"
        />
    );
}
