import axios from "axios";
import { ScraperError } from "../core/ErrorHandling";

export class WebScraper {
    async scrap(url: string): Promise<string> {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            return response.data;
        } catch (error:any) {
            const status = error.response?.status;

            if (status == 404) {
                throw new ScraperError("[Scrapper] Page tidak ditemukan", 404);
            }

            throw new ScraperError("[Scrapper] Gagal mengambil HTML", status);
        }
    }
}