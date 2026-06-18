/**
 * App.test.jsx
 *
 * Smoke tests for individual page components.
 * App.jsx already contains <BrowserRouter>, so we test the page components
 * directly with MemoryRouter to avoid the double-router error.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

// ─────────────────────────────────────────────────────────────────────────────

describe('<LandingPage />', () => {
  function renderLandingPage() {
    return render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
  }

  it('renders without crashing', () => {
    renderLandingPage();
    expect(document.body).toBeTruthy();
  });

  it('displays the PalmCrest ENT brand name', () => {
    renderLandingPage();
    // Multiple instances of the brand name exist in the page
    const brandEls = screen.getAllByText(/PalmCrest ENT/i);
    expect(brandEls.length).toBeGreaterThan(0);
  });

  it('renders the Book Appointment button', () => {
    renderLandingPage();
    // There are multiple "Book Appointment" CTAs on the page
    const buttons = screen.getAllByText(/Book Appointment/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders the hero heading with ENT keywords', () => {
    renderLandingPage();
    expect(
      screen.getAllByText(/Ear, Nose/i).length
    ).toBeGreaterThan(0);
  });

  it('renders the emergency phone link', () => {
    renderLandingPage();
    const phoneLink = document.querySelector('a[href^="tel:"]');
    expect(phoneLink).toBeInTheDocument();
  });
});

