export function print(value?: string) {
    if (value) {
        console.log(value.replace("'", "").replace('"', "").replace("%", " "));
    }
}
