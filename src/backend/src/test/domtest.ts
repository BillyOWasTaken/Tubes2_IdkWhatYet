import { DOMParser } from "../data/DOMParser"
import path, { join } from "path";
import fs, { readFileSync } from "fs";

async function main() 
{
    
    // TODO: add testing for Tree visualization

    let dom: DOMParser;
    dom = new DOMParser();
    const filePath = path.join(__dirname, "test1.txt");
    const htmlContent = fs.readFileSync(filePath, "utf8")

    try 
    {
        console.log("Page 1");
        await dom.loadFromString(htmlContent);

        console.log("Querying Div: ")
        //html, body, br, p
        const divs = dom.query("div", "BFS");
        const htmls = dom.query("html", "BFS");
        const bodies = dom.query("body", "BFS");
        const breaks = dom.query("br", "BFS");
        const ps = dom.query("p", "BFS");
        const uls = dom.query("ul", "BFS");

        console.log("Found", divs.length, "divs")
        console.log("Found", htmls.length, "htmls")
        console.log("Found", bodies.length, "bodies")
        console.log("Found", breaks.length, "breaks")
        console.log("Found", ps.length, "ps")
        console.log("Found", uls.length, "uls")

    }
    catch (error: any)
    {
    console.error("Error: ", error.message);
    }

    try 
    {
        console.log("Page 2");
        await dom.loadFromUrl("https://itb.ac.id/");

        console.log("Querying Div: ")
        const divs = dom.query("div", "DFS");

        console.log("Found", divs.length, "divs")

    }
    catch (error: any)
    {
    console.error("Error: ", error.message);
    }
}

main();