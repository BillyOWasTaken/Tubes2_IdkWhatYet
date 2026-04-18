// NOTE: Bisa dilihat referensi di W3Schools, idk why I implement this

/**
 * Yang sudah diimplementasi:
 * ScraperError
 * ParserError
 * SelectorError
 * TraversalError
 * InvalidTreeError
 */

export class ScraperError extends Error {
    statusCode?: number;

    constructor(message: string, statusCode?: number) {
        super(message);
        this.name = "ScraperError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ScraperError.prototype);
    }
}

export class ParserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ParserError";
        Object.setPrototypeOf(this, ParserError.prototype);
    }
}

export class SelectorError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SelectorError";
        Object.setPrototypeOf(this, SelectorError.prototype);
    }
}

export class TraversalError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TraversalError";
        Object.setPrototypeOf(this, TraversalError.prototype);
    }
}

export class InvalidTreeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidTreeError";
        Object.setPrototypeOf(this, InvalidTreeError.prototype);
    }
}
