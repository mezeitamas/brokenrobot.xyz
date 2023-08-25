import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
    test('should be accessible via the header mavigation', async ({ page }) => {
        await page.goto('./');
        await expect(page).toHaveTitle(/Broken Robot/);

        await page.getByRole('navigation').getByRole('link', { name: 'Home' }).click();
        await expect(page).toHaveTitle(/Broken Robot/);
    });

    test('should be accessible via the page title', async ({ page }) => {
        await page.goto('./');
        await expect(page).toHaveTitle(/Broken Robot/);

        await page.getByRole('navigation').getByRole('link', { name: 'Broken Robot' }).click();
        await expect(page).toHaveTitle(/Broken Robot/);
    });
});

test.describe('About page', () => {
    test('should be accessible from the home page via the header navigation', async ({ page }) => {
        await page.goto('./');
        await expect(page).toHaveTitle(/Broken Robot/);

        await page.getByRole('navigation').getByRole('link', { name: 'About' }).click();
        await expect(page).toHaveTitle(/About/);
    });

    test('should be accessible from the home page via the intro paragraph', async ({ page }) => {
        await page.goto('./');
        await expect(page).toHaveTitle(/Broken Robot/);

        await page.getByRole('main').getByRole('link', { name: 'About' }).click();
        await expect(page).toHaveTitle(/About/);
    });
});

test.describe('Blog page', () => {
    test('should be accessible from the home page via the header navigation', async ({ page }) => {
        await page.goto('./');
        await expect(page).toHaveTitle(/Broken Robot/);

        await page.getByRole('navigation').getByRole('link', { name: 'Blog' }).click();
        await expect(page).toHaveTitle(/Blog/);
    });

    test('should be accessible from the about page via the intro paragraph', async ({ page }) => {
        await page.goto('./about');
        await expect(page).toHaveTitle(/About/);

        await page.getByRole('link', { name: 'blog posts' }).click();
        await expect(page).toHaveTitle(/Blog/);
    });
});

test.describe('Post: Hello, World!', () => {
    test('should be accessible from the blog page', async ({ page }) => {
        await page.goto('./blog');
        await expect(page).toHaveTitle(/Blog/);

        await page.getByRole('heading').getByRole('link', { name: 'Hello, World!' }).click();
        await expect(page).toHaveTitle(/Hello, World!/);
    });
});

test.describe('Post: Hosting a static website on Amazon S3', () => {
    test('should be accessible from the home page', async ({ page }) => {
        await page.goto('./');
        await expect(page).toHaveTitle(/Broken Robot/);

        await page.getByRole('heading').getByRole('link', { name: 'Hosting a static website on Amazon S3' }).click();
        await expect(page).toHaveTitle(/Hosting a static website on Amazon S3/);
    });

    test('should be accessible from the blog page', async ({ page }) => {
        await page.goto('./blog');
        await expect(page).toHaveTitle(/Blog/);

        await page.getByRole('heading').getByRole('link', { name: 'Hosting a static website on Amazon S3' }).click();
        await expect(page).toHaveTitle(/Hosting a static website on Amazon S3/);
    });

    test('should be accessible from the about page', async ({ page }) => {
        await page.goto('./about');
        await expect(page).toHaveTitle(/About/);

        await page.getByRole('link', { name: 'Hosting a static website on Amazon S3' }).click();
        await expect(page).toHaveTitle(/Hosting a static website on Amazon S3/);
    });
});

test.describe('Post: Advanced static website hosting with Amazon S3 and CloudFront', () => {
    test('should be accessible from the home page', async ({ page }) => {
        await page.goto('./');
        await expect(page).toHaveTitle(/Broken Robot/);

        await page
            .getByRole('heading')
            .getByRole('link', { name: 'Advanced static website hosting with Amazon S3 and CloudFront' })
            .click();
        await expect(page).toHaveTitle(/Advanced static website hosting with Amazon S3 and CloudFront/);
    });

    test('should be accessible from the blog page', async ({ page }) => {
        await page.goto('./blog');
        await expect(page).toHaveTitle(/Blog/);

        await page
            .getByRole('heading')
            .getByRole('link', { name: 'Advanced static website hosting with Amazon S3 and CloudFront' })
            .click();
        await expect(page).toHaveTitle(/Advanced static website hosting with Amazon S3 and CloudFront/);
    });

    test('should be accessible from the about page', async ({ page }) => {
        await page.goto('./about');
        await expect(page).toHaveTitle(/About/);

        await page.getByRole('link', { name: 'Advanced static website hosting with Amazon S3 and CloudFront' }).click();
        await expect(page).toHaveTitle(/Advanced static website hosting with Amazon S3 and CloudFront/);
    });
});

test.describe('Post: URL redirect with Amazon CloudFront and Amazon Route 53', () => {
    test('should be accessible from the home page', async ({ page }) => {
        await page.goto('./');
        await expect(page).toHaveTitle(/Broken Robot/);

        await page
            .getByRole('heading')
            .getByRole('link', { name: 'URL redirect with Amazon CloudFront and Amazon Route 53' })
            .click();
        await expect(page).toHaveTitle(/URL redirect with Amazon CloudFront and Amazon Route 53/);
    });

    test('should be accessible from the blog page', async ({ page }) => {
        await page.goto('./blog');
        await expect(page).toHaveTitle(/Blog/);

        await page
            .getByRole('heading')
            .getByRole('link', { name: 'URL redirect with Amazon CloudFront and Amazon Route 53' })
            .click();
        await expect(page).toHaveTitle(/URL redirect with Amazon CloudFront and Amazon Route 53/);
    });

    test('should be accessible from the about page', async ({ page }) => {
        await page.goto('./about');
        await expect(page).toHaveTitle(/About/);

        await page.getByRole('link', { name: 'URL redirect with Amazon CloudFront and Amazon Route 53' }).click();
        await expect(page).toHaveTitle(/URL redirect with Amazon CloudFront and Amazon Route 53/);
    });
});
