import { DOMParser } from "../data/DOMParser"
import path, { join } from "path";
import fs, { readFileSync } from "fs";

async function main() 
{
    let dom: DOMParser;
    dom = new DOMParser();
    const filePath = path.join(__dirname, "test1.txt");
    const htmlContent = fs.readFileSync(filePath, "utf8")

    try 
    {
        console.log("Page 1");
        await dom.loadFromString(htmlContent);

        console.log("Querying Div: ")
        const divs = dom.query("div", "BFS");

        console.log("Found", divs.length, "divs")

        if (divs.length > 0){
            console.log("First div ID: ", divs[0]?.id);
        } 
    }
    catch (error: any)
    {
    console.error("Error: ", error.message);
    }

    try 
    {
        console.log("Page 2");
        await dom.loadFromUrl("https://guthib.com/");

        console.log("Querying Div: ")
        const divs = dom.query("div", "DFS");

        console.log("Found", divs.length, "divs")

        if (divs.length > 0){
            console.log("First div ID: ", divs[0]?.id);
        } 
    }
    catch (error: any)
    {
    console.error("Error: ", error.message);
    }
}

main();