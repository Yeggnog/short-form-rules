
export const colorOptions = [
    { name: "black", value: "Black", class: "bg-black" },
    { name: "blue", value: "Blue", class: "bg-blue" },
    { name: "green", value: "Green", class: "bg-green" },
    { name: "red", value: "Red", class: "bg-red" },
    { name: "orange", value: "Orange", class: "bg-orange" },
    { name: "yellow", value: "Yellow", class: "bg-yellow" },
    { name: "purple", value: "Purple", class: "bg-purple" },
    { name: "grey", value: "Grey", class: "bg-grey" },
    { name: "teal", value: "Teal", class: "bg-teal" },
    { name: "lime", value: "Lime", class: "bg-lime" },
    { name: "cyan", value: "Cyan", class: "bg-cyan" },
    { name: "pink", value: "Pink", class: "bg-pink" }
];

export function headerColorClass(colorString: string): string {
    const colorString_lower = colorString.toLowerCase();
    for(let option of colorOptions){
        if(option.name == colorString_lower){
            return "rsHeader "+option.class;
        }
    }
    return "rsHeader";
}
