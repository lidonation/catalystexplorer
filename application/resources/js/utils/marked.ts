import { marked } from "marked";

export default function markdown(value: string) {
    return marked.parse(value);
}