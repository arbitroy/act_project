// services/pdfService.ts
import chromium from '@sparticuz/chromium';
import type { Browser as CoreBrowser, PDFOptions } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';

class PDFGenerationError extends Error {
    constructor(
        message: string,
        public readonly cause?: Error,
        public readonly context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'PDFGenerationError';
    }
}

interface PDFServiceOptions {
    maxRetries?: number;
    timeout?: number;
}

interface PDFGenerationOptions extends PDFOptions {
    timeout?: number;
}

interface PDFGenerationResult {
    buffer: Buffer | Uint8Array;
    pageCount: number;
}

type BrowserType = CoreBrowser;

// Define launch options interface that works for both puppeteer and puppeteer-core
interface CommonLaunchOptions {
    headless?: boolean;
    args?: string[];
    defaultViewport?: {
        width: number;
        height: number;
        deviceScaleFactor?: number;
    } | null;
    executablePath?: string;
}

class PDFService {
    private static instance: PDFService;
    private browserPromise: Promise<BrowserType | null> | null = null;
    private readonly maxRetries: number;
    private readonly timeout: number;

    private constructor(options: PDFServiceOptions = {}) {
        this.maxRetries = options.maxRetries ?? 3;
        this.timeout = options.timeout ?? 30000;
    }

    static getInstance(options?: PDFServiceOptions): PDFService {
        if (!PDFService.instance) {
            PDFService.instance = new PDFService(options);
        }
        return PDFService.instance;
    }

    private async getBrowserOptions(): Promise<CommonLaunchOptions> {
        const isDev = process.env.NODE_ENV === 'development';

        const commonArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ];

        if (isDev) {
            return {
                headless: true,
                args: commonArgs,
            };
        }

        return {
            args: [
                ...chromium.args,
                ...commonArgs,
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: true,
        };
    }

    private async initBrowser(): Promise<BrowserType | null> {
        if (this.browserPromise) {
            return this.browserPromise;
        }

        this.browserPromise = (async () => {
            try {
                const launchOptions = await this.getBrowserOptions();
                
                if (process.env.NODE_ENV === 'development') {
                    // Dynamic import of puppeteer for development
                    const { default: devPuppeteer } = await import('puppeteer');
                    const browser = await devPuppeteer.launch(launchOptions);
                    return browser as unknown as BrowserType;
                }
                
                // Use puppeteer-core for production
                const browser = await puppeteer.launch(launchOptions);
                return browser;
            } catch (error) {
                this.browserPromise = null;
                throw new PDFGenerationError(
                    'Failed to initialize browser',
                    error instanceof Error ? error : undefined,
                    { environment: process.env.NODE_ENV }
                );
            }
        })();

        return this.browserPromise;
    }

    async generatePDF(
        html: string,
        options: PDFGenerationOptions = {}
    ): Promise<PDFGenerationResult> {
        let retries = 0;
        let lastError: Error | undefined;

        while (retries < this.maxRetries) {
            try {
                const browser = await this.initBrowser();
                if (!browser) {
                    throw new PDFGenerationError('Browser initialization failed');
                }

                const page = await browser.newPage();
                
                await page.setContent(html, {
                    waitUntil: ['networkidle0', 'domcontentloaded'],
                    timeout: options.timeout ?? this.timeout,
                });

                const buffer = await page.pdf({
                    format: 'A3',
                    landscape: true,
                    printBackground: true,
                    margin: {
                        top: '10mm',
                        bottom: '10mm',
                        left: '10mm',
                        right: '10mm',
                    },
                    preferCSSPageSize: true,
                    ...options,
                });

                const pageCount = await page.evaluate(() => {
                    const style = window.getComputedStyle(document.documentElement);
                    return Math.ceil(document.documentElement.scrollHeight / 
                           parseInt(style.getPropertyValue('height')));
                });

                await page.close();
                
                return {
                    buffer,
                    pageCount,
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error occurred');
                retries++;
                
                if (this.browserPromise) {
                    try {
                        const browser = await this.browserPromise;
                        await browser?.close();
                    } catch {
                        // Ignore cleanup errors
                    }
                    this.browserPromise = null;
                }

                if (retries >= this.maxRetries) {
                    throw new PDFGenerationError(
                        'PDF generation failed after maximum retries',
                        lastError,
                        {
                            retries,
                            options: JSON.stringify(options),
                        }
                    );
                }

                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }

        throw new PDFGenerationError('PDF generation failed', lastError);
    }

    async cleanup(): Promise<void> {
        if (this.browserPromise) {
            try {
                const browser = await this.browserPromise;
                await browser?.close();
                this.browserPromise = null;
            } catch (error) {
                throw new PDFGenerationError(
                    'Failed to cleanup browser instance',
                    error instanceof Error ? error : undefined
                );
            }
        }
    }
}

export const pdfService = PDFService.getInstance({
    maxRetries: 3,
    timeout: 30000,
});

export { PDFGenerationError };
export type {
    PDFGenerationOptions,
    PDFGenerationResult,
    PDFServiceOptions,
};