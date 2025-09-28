/**
 * End-to-end tests for file upload flow
 * Tests the complete user journey from file selection to data display
 */

import { test, expect } from '@playwright/test';

test.describe('File Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should upload CSV file and display songs', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByText('Song List App')).toBeVisible();

    // Check that the upload area is visible
    await expect(page.getByText('Upload CSV File')).toBeVisible();
    await expect(page.getByText('Drag & drop your CSV file here')).toBeVisible();

    // Create a test CSV file
    const csvContent = `band,song,year
The Beatles,Hey Jude,1968
Queen,Bohemian Rhapsody,1975
Led Zeppelin,Stairway to Heaven,1971`;

    // Upload the file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'songs.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Wait for upload to complete
    await expect(page.getByText('Songs uploaded successfully')).toBeVisible();

    // Check that songs are displayed in the table
    await expect(page.getByText('The Beatles')).toBeVisible();
    await expect(page.getByText('Hey Jude')).toBeVisible();
    await expect(page.getByText('1968')).toBeVisible();

    await expect(page.getByText('Queen')).toBeVisible();
    await expect(page.getByText('Bohemian Rhapsody')).toBeVisible();
    await expect(page.getByText('1975')).toBeVisible();

    await expect(page.getByText('Led Zeppelin')).toBeVisible();
    await expect(page.getByText('Stairway to Heaven')).toBeVisible();
    await expect(page.getByText('1971')).toBeVisible();
  });

  test('should import sample songs', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByText('Song List App')).toBeVisible();

    // Click the import sample songs button
    await page.getByText('Import Sample Songs').click();

    // Wait for import to complete
    await expect(page.getByText('Sample songs imported successfully')).toBeVisible();

    // Check that sample songs are displayed
    await expect(page.getByText('The Beatles')).toBeVisible();
    await expect(page.getByText('Queen')).toBeVisible();
    await expect(page.getByText('Led Zeppelin')).toBeVisible();
  });

  test('should handle invalid file upload', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByText('Song List App')).toBeVisible();

    // Create an invalid file (not CSV)
    const invalidContent = `{"band": "The Beatles", "song": "Hey Jude", "year": 1968}`;

    // Upload the invalid file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'songs.json',
      mimeType: 'application/json',
      buffer: Buffer.from(invalidContent),
    });

    // Check that an error message is displayed
    await expect(page.getByText('Invalid file type')).toBeVisible();
  });

  test('should handle empty CSV file', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByText('Song List App')).toBeVisible();

    // Create an empty CSV file
    const emptyCsv = 'band,song,year\n';

    // Upload the empty file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'empty.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(emptyCsv),
    });

    // Check that a message about empty file is displayed
    await expect(page.getByText('No songs found in file')).toBeVisible();
  });

  test('should show loading states during upload', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByText('Song List App')).toBeVisible();

    // Create a CSV file
    const csvContent = `band,song,year
The Beatles,Hey Jude,1968`;

    // Upload the file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'songs.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Check that loading state is shown
    await expect(page.getByText('Uploading...')).toBeVisible();

    // Wait for upload to complete
    await expect(page.getByText('Songs uploaded successfully')).toBeVisible();
  });

  test('should show loading states during sample import', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByText('Song List App')).toBeVisible();

    // Click the import sample songs button
    await page.getByText('Import Sample Songs').click();

    // Check that loading state is shown
    await expect(page.getByText('Importing...')).toBeVisible();

    // Wait for import to complete
    await expect(page.getByText('Sample songs imported successfully')).toBeVisible();
  });
});


