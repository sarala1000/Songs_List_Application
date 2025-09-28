/**
 * End-to-end tests for app navigation and UI interactions
 * Tests navigation, view modes, and user interface elements
 */

import { test, expect } from '@playwright/test';

test.describe('App Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display app title and main elements', async ({ page }) => {
    // Check main app elements
    await expect(page.getByText('Song List App')).toBeVisible();
    await expect(page.getByText('Upload CSV File')).toBeVisible();
    await expect(page.getByText('Import Sample Songs')).toBeVisible();
  });

  test('should show empty state initially', async ({ page }) => {
    // Check that empty state is displayed
    await expect(page.getByText('No songs found')).toBeVisible();
  });

  test('should display backend connection status', async ({ page }) => {
    // Check that backend status is displayed
    await expect(page.getByText('Backend Status:')).toBeVisible();
  });

  test('should toggle between grid and list view', async ({ page }) => {
    // First import some sample songs
    await page.getByText('Import Sample Songs').click();
    await expect(page.getByText('Sample songs imported successfully')).toBeVisible();

    // Check that list view is active by default
    await expect(page.getByRole('table')).toBeVisible();

    // Toggle to grid view
    await page.getByText('Grid View').click();

    // Check that grid view is active
    await expect(page.getByTestId('songs-grid')).toBeVisible();

    // Toggle back to list view
    await page.getByText('List View').click();

    // Check that list view is active again
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should show settings panel', async ({ page }) => {
    // Click settings button
    await page.getByText('Settings').click();

    // Check that settings panel is visible
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('View Mode')).toBeVisible();
    await expect(page.getByText('Theme')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that elements are still visible
    await expect(page.getByText('Song List App')).toBeVisible();
    await expect(page.getByText('Upload CSV File')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Check that elements are still visible
    await expect(page.getByText('Song List App')).toBeVisible();
    await expect(page.getByText('Upload CSV File')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Check that elements are still visible
    await expect(page.getByText('Song List App')).toBeVisible();
    await expect(page.getByText('Upload CSV File')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check that focus is on a button
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should show notifications for success and error states', async ({ page }) => {
    // Test success notification
    await page.getByText('Import Sample Songs').click();
    await expect(page.getByText('Sample songs imported successfully')).toBeVisible();

    // Test error notification with invalid file
    const invalidContent = `{"invalid": "json"}`;
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from(invalidContent),
    });

    await expect(page.getByText('Invalid file type')).toBeVisible();
  });

  test('should handle drag and drop functionality', async ({ page }) => {
    // Create a test CSV file
    const csvContent = `band,song,year
The Beatles,Hey Jude,1968`;

    // Test drag and drop
    const dropzone = page.getByText('Drag & drop your CSV file here');
    await dropzone.dispatchEvent('dragover');

    // Check that drag state is shown
    await expect(dropzone).toHaveClass(/drag-active/);

    // Simulate drop
    await dropzone.dispatchEvent('drop', {
      dataTransfer: {
        files: [{
          name: 'songs.csv',
          type: 'text/csv',
          buffer: Buffer.from(csvContent),
        }],
      },
    });

    // Check that upload was triggered
    await expect(page.getByText('Songs uploaded successfully')).toBeVisible();
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Import some songs
    await page.getByText('Import Sample Songs').click();
    await expect(page.getByText('Sample songs imported successfully')).toBeVisible();

    // Check that songs are displayed
    await expect(page.getByText('The Beatles')).toBeVisible();

    // Refresh the page
    await page.reload();

    // Check that songs are still displayed (if using React Query cache)
    await expect(page.getByText('The Beatles')).toBeVisible();
  });

  test('should handle multiple file uploads', async ({ page }) => {
    // Upload first file
    const csvContent1 = `band,song,year
The Beatles,Hey Jude,1968`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'songs1.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent1),
    });

    await expect(page.getByText('Songs uploaded successfully')).toBeVisible();

    // Upload second file
    const csvContent2 = `band,song,year
Queen,Bohemian Rhapsody,1975`;

    await fileInput.setInputFiles({
      name: 'songs2.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent2),
    });

    await expect(page.getByText('Songs uploaded successfully')).toBeVisible();

    // Check that both songs are displayed
    await expect(page.getByText('The Beatles')).toBeVisible();
    await expect(page.getByText('Queen')).toBeVisible();
  });
});


