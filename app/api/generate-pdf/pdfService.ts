
import chromium from '@sparticuz/chromium';
import type { Browser, PDFOptions, PuppeteerLaunchOptions } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';


interface PDFServiceOptions {
    maxRetries?: number;
    timeout?: number;
}

interface PDFGenerationOptions extends PDFOptions {
    timeout?: number;
}

type BrowserInstance = Browser | null;

interface PDFGenerationResult {
    buffer: Buffer;
    pageCount: number;
}

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

class PDFService {
    private static instance: PDFService;
    private browserPromise: Promise<BrowserInstance> | null = null;
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

    private async getBrowserLaunchOptions(): Promise<PuppeteerLaunchOptions> {
        const isDev = process.env.NODE_ENV === 'development';

        if (isDev) {
            return {
                headless: true,
                args: ['--no-sandbox'],
            };
        }

        return {
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        };
    }

    private async initBrowser(): Promise<BrowserInstance> {
        if (this.browserPromise) {
            return this.browserPromise;
        }

        this.browserPromise = (async () => {
            try {
                const launchOptions = await this.getBrowserLaunchOptions();
                
                if (process.env.NODE_ENV === 'development') {
                    const puppeteer = (await import('puppeteer')).default;
                    return await puppeteer.launch(launchOptions);
                }
                
                return await puppeteer.launch(launchOptions);
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
                
                // Set content with timeout
                await page.setContent(html, {
                    waitUntil: ['networkidle0', 'domcontentloaded'],
                    timeout: options.timeout ?? this.timeout,
                });

                // Generate PDF
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

                // Get page count (optional)
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
                
                // Reset browser instance on error
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

                // Wait before retrying
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

// Export a type-safe singleton instance
export const pdfService = PDFService.getInstance({
    maxRetries: 3,
    timeout: 30000,
});

// Export types for consumers
export type {
    PDFGenerationOptions,
    PDFGenerationResult,
    PDFServiceOptions,
    PDFGenerationError,
};