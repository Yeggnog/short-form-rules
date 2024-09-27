
export const colorOptions = [ 
    { name: "black", value: "Black", color: "#000000" },
    { name: "blue", value: "Blue", color: "#0ea5e9" },
    { name: "green", value: "Green", color: "#22c55e" },
    { name: "red", value: "Red", color: "#dc2626" },
    { name: "orange", value: "Orange", color: "#f97316" },
    { name: "yellow", value: "Yellow", color: "#eab308" },
    { name: "purple", value: "Purple", color: "#bf7aff" },
    { name: "grey", value: "Grey", color: "#94a3b8" },
    { name: "teal", value: "Teal", color: "#14b8a6" },
    { name: "lime", value: "Lime", color: "#84cc16" },
    { name: "cyan", value: "Cyan", color: "#22d3ee" },
    { name: "pink", value: "Pink", color: "#eb66ff" }
];

export function headerColor(colorString: string): string {
    const colorString_lower = colorString.toLowerCase();
    for(let option of colorOptions){
        if(option.name == colorString_lower){
            return option.color;
        }
    }
    return "black";
}

export function headerTextColor(colorString: string): string {
    const lightBannerColors = [
        "blue", "green", "orange", "yellow", "purple",
        "grey", "teal", "lime", "cyan", "pink"
    ];
    const colorString_lower = colorString.toLowerCase();
    for(let option of colorOptions){
        if(option.name == colorString_lower){
            return (lightBannerColors.includes(option.name)) ? 'black' : 'white';
            //return option.color;
        }
    }
    return "white";
}
