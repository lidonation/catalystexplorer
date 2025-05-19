export default function fromSnakeCase(input: string) {
    if (!input) return;
    return input
        ?.split('_')
        .map(
            (word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
}

