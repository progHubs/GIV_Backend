# Implementation Guide - Campaign and Donation System

## Overview

This guide provides detailed implementation instructions for integrating with the Campaign and Donation system. It covers frontend integration, API usage patterns, and best practices.

## Getting Started

### Prerequisites

- Node.js backend server running
- Valid JWT authentication system
- Stripe account configured
- Database properly migrated

### Environment Setup

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/giv_society"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Configuration
RESEND_API_KEY="re_..."
RESEND_SENDER="GIV Society <noreply@givsociety.org>"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

## Frontend Integration

### 1. Campaign Management

#### Fetching Campaigns

```javascript
// Get all campaigns with filtering
async function getCampaigns(filters = {}) {
    const queryParams = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 10,
        search: filters.search || "",
        category: filters.category || "",
        is_active: filters.is_active || "",
        is_featured: filters.is_featured || "",
        language: filters.language || "en",
    });

    const response = await fetch(`/api/campaigns?${queryParams}`);

    if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
    }

    return await response.json();
}

// Usage example
const campaigns = await getCampaigns({
    page: 1,
    limit: 12,
    category: "health",
    is_active: true,
});
```

#### Campaign Details

```javascript
// Get single campaign
async function getCampaign(campaignId) {
    const response = await fetch(`/api/campaigns/${campaignId}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Campaign not found");
        }
        throw new Error("Failed to fetch campaign");
    }

    return await response.json();
}

// Usage with error handling
try {
    const campaign = await getCampaign(123);
    console.log("Campaign:", campaign.data);
} catch (error) {
    console.error("Error:", error.message);
}
```

#### Creating Campaigns (Admin Only)

```javascript
async function createCampaign(campaignData, authToken) {
    const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            title: campaignData.title,
            description: campaignData.description,
            goal_amount: campaignData.goalAmount,
            start_date: campaignData.startDate,
            end_date: campaignData.endDate,
            category: campaignData.category,
            image_url: campaignData.imageUrl,
            is_featured: campaignData.isFeatured || false,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create campaign");
    }

    return await response.json();
}
```

### 2. Donation Processing

#### Making a Donation

```javascript
async function makeDonation(donationData, authToken = null) {
    const headers = {
        "Content-Type": "application/json",
    };

    // Add auth token if user is logged in
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch("/api/donations", {
        method: "POST",
        headers,
        body: JSON.stringify({
            campaign_id: donationData.campaignId,
            amount: donationData.amount,
            currency: donationData.currency || "USD",
            donation_type: donationData.type || "one_time",
            payment_method: "stripe",
            payment_status: "pending",
            notes: donationData.notes || "",
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create donation");
    }

    return await response.json();
}

// Usage for authenticated user
const donation = await makeDonation(
    {
        campaignId: 123,
        amount: 100.0,
        type: "one_time",
        notes: "Happy to support this cause!",
    },
    userToken
);

// Usage for anonymous donation
const anonymousDonation = await makeDonation({
    campaignId: 123,
    amount: 50.0,
}); // No token = anonymous
```

#### Stripe Payment Integration

```javascript
async function initiateStripePayment(
    campaignId,
    amount,
    isRecurring = false,
    authToken = null
) {
    const headers = {
        "Content-Type": "application/json",
    };

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch("/api/v1/payments/stripe/session", {
        method: "POST",
        headers,
        body: JSON.stringify({
            campaign_id: campaignId,
            amount: amount,
            recurring: isRecurring,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment session");
    }

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = url;
}

// Usage
await initiateStripePayment(123, 100.0, false, userToken);
```

#### Donation History

```javascript
async function getDonationHistory(authToken, filters = {}) {
    const queryParams = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 10,
        campaign_id: filters.campaignId || "",
        donation_type: filters.type || "",
        payment_status: filters.status || "",
    });

    const response = await fetch(`/api/donations?${queryParams}`, {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch donation history");
    }

    return await response.json();
}
```

### 3. Donor Profile Management

#### Getting Donor Profile

```javascript
async function getDonorProfile(authToken) {
    const response = await fetch("/api/donors/me", {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });

    if (response.status === 404) {
        // User doesn't have a donor profile yet
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch donor profile");
    }

    return await response.json();
}
```

#### Creating Donor Profile

```javascript
async function createDonorProfile(profileData, authToken) {
    const response = await fetch("/api/donors", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            is_recurring_donor: profileData.isRecurring || false,
            preferred_payment_method: profileData.paymentMethod || "stripe",
            donation_frequency: profileData.frequency || "monthly",
            tax_receipt_email: profileData.taxEmail || "",
            is_anonymous: profileData.isAnonymous || false,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create donor profile");
    }

    return await response.json();
}
```

#### Updating Donor Profile

```javascript
async function updateDonorProfile(updateData, authToken) {
    const response = await fetch("/api/donors/me", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update donor profile");
    }

    return await response.json();
}
```

## React Component Examples

### Campaign Card Component

```jsx
import React from "react";

const CampaignCard = ({ campaign, onDonate }) => {
    const progressPercentage = Math.round(
        (parseFloat(campaign.current_amount) /
            parseFloat(campaign.goal_amount)) *
            100
    );

    return (
        <div className="campaign-card">
            <img
                src={campaign.image_url}
                alt={campaign.title}
                className="campaign-image"
            />
            <div className="campaign-content">
                <h3>{campaign.title}</h3>
                <p>{campaign.description}</p>

                <div className="progress-section">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${progressPercentage}%`,
                                backgroundColor: campaign.progress_bar_color,
                            }}
                        />
                    </div>
                    <div className="progress-stats">
                        <span>${campaign.current_amount} raised</span>
                        <span>of ${campaign.goal_amount} goal</span>
                    </div>
                </div>

                <div className="campaign-meta">
                    <span>{campaign.donor_count} donors</span>
                    <span>{progressPercentage}% funded</span>
                </div>

                <button
                    onClick={() => onDonate(campaign.id)}
                    className="donate-button"
                >
                    Donate Now
                </button>
            </div>
        </div>
    );
};

export default CampaignCard;
```

### Donation Form Component

```jsx
import React, { useState } from "react";

const DonationForm = ({ campaignId, onSuccess, onError }) => {
    const [amount, setAmount] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get auth token from your auth system
            const authToken = localStorage.getItem("authToken");

            // Initiate Stripe payment
            await initiateStripePayment(
                campaignId,
                parseFloat(amount),
                isRecurring,
                authToken
            );

            onSuccess?.();
        } catch (error) {
            onError?.(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="donation-form">
            <div className="form-group">
                <label htmlFor="amount">Donation Amount ($)</label>
                <input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>
                    <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                    />
                    Make this a monthly recurring donation
                </label>
            </div>

            <div className="form-group">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a message of support..."
                />
            </div>

            <button
                type="submit"
                disabled={loading || !amount}
                className="submit-button"
            >
                {loading ? "Processing..." : "Donate Now"}
            </button>
        </form>
    );
};

export default DonationForm;
```

### Donor Dashboard Component

````jsx
import React, { useState, useEffect } from 'react';

const DonorDashboard = ({ authToken }) => {
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonorData();
  }, []);

  const loadDonorData = async () => {
    try {
      // Load donor profile
      const profileData = await getDonorProfile(authToken);
      setProfile(profileData?.data);

      // Load donation history
      const donationsData = await getDonationHistory(authToken);
      setDonations(donationsData.data);
    } catch (error) {
      console.error('Failed to load donor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="donor-dashboard">
      {profile && (
        <div className="profile-summary">
          <h2>Your Donor Profile</h2>
          <div className="stats">
            <div className="stat">
              <span className="label">Total Donated</span>
              <span className="value">${profile.total_donated}</span>
            </div>
            <div className="stat">
              <span className="label">Donation Tier</span>
              <span className="value">{profile.donation_tier || 'Bronze'}</span>
            </div>
            <div className="stat">
              <span className="label">Last Donation</span>
              <span className="value">
                {profile.last_donation_date
                  ? new Date(profile.last_donation_date).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="donation-history">
        <h3>Donation History</h3>
        {donations.length === 0 ? (
          <p>No donations yet.</p>
        ) : (
          <div className="donations-list">
            {donations.map(donation => (
              <div key={donation.id} className="donation-item">
                <div className="donation-info">
                  <h4>{donation.campaigns.title}</h4>
                  <p>${donation.amount} - {donation.donation_type}</p>
                  <span className="date">
                    {new Date(donation.donated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="donation-status">
                  <span className={`status ${donation.payment_status}`}>
                    {donation.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;

## Error Handling Patterns

### Centralized Error Handler
```javascript
class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error || 'Request failed',
        response.status,
        data.code
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error', 0, 'NETWORK_ERROR');
  }
}

// Usage with error handling
try {
  const campaigns = await apiRequest('/api/campaigns');
  console.log(campaigns.data);
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.code === 'VALIDATION_ERROR') {
    // Show validation errors
    showValidationErrors(error.message);
  } else {
    // Show generic error
    showErrorMessage(error.message);
  }
}
````

### React Error Boundary

```jsx
import React from "react";

class DonationErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Donation component error:", error, errorInfo);
        // Log to error reporting service
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback">
                    <h2>Something went wrong with the donation system</h2>
                    <p>Please try refreshing the page or contact support.</p>
                    <button
                        onClick={() =>
                            this.setState({ hasError: false, error: null })
                        }
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Usage
<DonationErrorBoundary>
    <DonationForm campaignId={123} />
</DonationErrorBoundary>;
```

## State Management Patterns

### React Context for Donation State

```jsx
import React, { createContext, useContext, useReducer } from "react";

const DonationContext = createContext();

const donationReducer = (state, action) => {
    switch (action.type) {
        case "SET_CAMPAIGNS":
            return { ...state, campaigns: action.payload, loading: false };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload, loading: false };
        case "ADD_DONATION":
            return {
                ...state,
                donations: [...state.donations, action.payload],
            };
        case "UPDATE_CAMPAIGN_STATS":
            return {
                ...state,
                campaigns: state.campaigns.map((campaign) =>
                    campaign.id === action.payload.id
                        ? { ...campaign, ...action.payload.updates }
                        : campaign
                ),
            };
        default:
            return state;
    }
};

export const DonationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(donationReducer, {
        campaigns: [],
        donations: [],
        loading: false,
        error: null,
    });

    const loadCampaigns = async (filters = {}) => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const response = await getCampaigns(filters);
            dispatch({ type: "SET_CAMPAIGNS", payload: response.data });
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: error.message });
        }
    };

    const makeDonation = async (donationData, authToken) => {
        try {
            const donation = await makeDonation(donationData, authToken);
            dispatch({ type: "ADD_DONATION", payload: donation.data });

            // Update campaign stats optimistically
            dispatch({
                type: "UPDATE_CAMPAIGN_STATS",
                payload: {
                    id: donationData.campaignId,
                    updates: {
                        current_amount: (
                            parseFloat(
                                state.campaigns.find(
                                    (c) => c.id === donationData.campaignId
                                )?.current_amount || 0
                            ) + parseFloat(donationData.amount)
                        ).toString(),
                        donor_count:
                            parseInt(
                                state.campaigns.find(
                                    (c) => c.id === donationData.campaignId
                                )?.donor_count || 0
                            ) + 1,
                    },
                },
            });

            return donation;
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: error.message });
            throw error;
        }
    };

    return (
        <DonationContext.Provider
            value={{
                ...state,
                loadCampaigns,
                makeDonation,
            }}
        >
            {children}
        </DonationContext.Provider>
    );
};

export const useDonation = () => {
    const context = useContext(DonationContext);
    if (!context) {
        throw new Error("useDonation must be used within DonationProvider");
    }
    return context;
};
```

## Testing Strategies

### Unit Tests for API Functions

```javascript
// __tests__/api/campaigns.test.js
import { getCampaigns, createCampaign } from "../api/campaigns";

// Mock fetch
global.fetch = jest.fn();

describe("Campaign API", () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test("getCampaigns returns campaign data", async () => {
        const mockResponse = {
            success: true,
            data: [{ id: 1, title: "Test Campaign", goal_amount: "1000.00" }],
            pagination: { currentPage: 1, totalPages: 1 },
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await getCampaigns({ page: 1 });

        expect(fetch).toHaveBeenCalledWith(
            "/api/campaigns?page=1&limit=10&search=&category=&is_active=&is_featured=&language=en"
        );
        expect(result).toEqual(mockResponse);
    });

    test("getCampaigns handles errors", async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: "Server error" }),
        });

        await expect(getCampaigns()).rejects.toThrow(
            "Failed to fetch campaigns"
        );
    });

    test("createCampaign sends correct data", async () => {
        const campaignData = {
            title: "New Campaign",
            description: "Test description",
            goalAmount: 1000,
            startDate: "2024-01-01",
            category: "health",
        };

        const mockResponse = {
            success: true,
            data: { id: 1, ...campaignData },
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await createCampaign(campaignData, "test-token");

        expect(fetch).toHaveBeenCalledWith("/api/campaigns", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer test-token",
            },
            body: JSON.stringify({
                title: "New Campaign",
                description: "Test description",
                goal_amount: 1000,
                start_date: "2024-01-01",
                category: "health",
                is_featured: false,
            }),
        });

        expect(result).toEqual(mockResponse);
    });
});
```

### Integration Tests

```javascript
// __tests__/integration/donation-flow.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DonationProvider } from "../contexts/DonationContext";
import DonationForm from "../components/DonationForm";

// Mock Stripe
jest.mock("../utils/stripe", () => ({
    initiateStripePayment: jest.fn(),
}));

describe("Donation Flow Integration", () => {
    test("complete donation flow", async () => {
        const mockOnSuccess = jest.fn();
        const mockOnError = jest.fn();

        render(
            <DonationProvider>
                <DonationForm
                    campaignId={123}
                    onSuccess={mockOnSuccess}
                    onError={mockOnError}
                />
            </DonationProvider>
        );

        // Fill out form
        fireEvent.change(screen.getByLabelText(/donation amount/i), {
            target: { value: "100" },
        });

        fireEvent.change(screen.getByLabelText(/notes/i), {
            target: { value: "Test donation" },
        });

        // Submit form
        fireEvent.click(screen.getByText(/donate now/i));

        // Wait for Stripe integration
        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });
});
```

## Performance Optimization

### Caching Strategies

```javascript
// Simple in-memory cache for campaigns
class CampaignCache {
    constructor(ttl = 5 * 60 * 1000) {
        // 5 minutes
        this.cache = new Map();
        this.ttl = ttl;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    set(key, data) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + this.ttl,
        });
    }

    clear() {
        this.cache.clear();
    }
}

const campaignCache = new CampaignCache();

// Enhanced getCampaigns with caching
async function getCampaignsWithCache(filters = {}) {
    const cacheKey = JSON.stringify(filters);
    const cached = campaignCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const data = await getCampaigns(filters);
    campaignCache.set(cacheKey, data);

    return data;
}
```

### Lazy Loading Components

```jsx
import React, { lazy, Suspense } from "react";

// Lazy load heavy components
const DonorDashboard = lazy(() => import("./DonorDashboard"));
const CampaignAnalytics = lazy(() => import("./CampaignAnalytics"));

const App = () => {
    return (
        <div>
            <Suspense fallback={<div>Loading dashboard...</div>}>
                <DonorDashboard />
            </Suspense>

            <Suspense fallback={<div>Loading analytics...</div>}>
                <CampaignAnalytics />
            </Suspense>
        </div>
    );
};
```

## Security Best Practices

### Token Management

```javascript
class TokenManager {
    constructor() {
        this.token = localStorage.getItem("authToken");
        this.refreshToken = localStorage.getItem("refreshToken");
    }

    getToken() {
        return this.token;
    }

    setToken(token, refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
        localStorage.setItem("authToken", token);
        localStorage.setItem("refreshToken", refreshToken);
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
    }

    async refreshTokenIfNeeded() {
        if (!this.token || !this.refreshToken) {
            return false;
        }

        try {
            // Check if token is expired (implement JWT decode)
            const tokenData = this.decodeToken(this.token);
            const now = Date.now() / 1000;

            if (tokenData.exp > now + 300) {
                // 5 minutes buffer
                return true; // Token is still valid
            }

            // Refresh token
            const response = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken,
                }),
            });

            if (response.ok) {
                const { token, refreshToken } = await response.json();
                this.setToken(token, refreshToken);
                return true;
            } else {
                this.clearTokens();
                return false;
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
            this.clearTokens();
            return false;
        }
    }

    decodeToken(token) {
        try {
            return JSON.parse(atob(token.split(".")[1]));
        } catch {
            return null;
        }
    }
}

const tokenManager = new TokenManager();

// Enhanced API request with automatic token refresh
async function authenticatedRequest(url, options = {}) {
    const tokenValid = await tokenManager.refreshTokenIfNeeded();

    if (!tokenValid) {
        throw new APIError("Authentication required", 401, "UNAUTHORIZED");
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${tokenManager.getToken()}`,
    };

    return apiRequest(url, { ...options, headers });
}
```

### Input Sanitization

```javascript
// Client-side input sanitization
function sanitizeInput(input) {
    if (typeof input !== "string") return input;

    return input
        .replace(/[<>]/g, "") // Remove potential HTML tags
        .trim()
        .substring(0, 1000); // Limit length
}

function sanitizeDonationData(data) {
    return {
        campaign_id: parseInt(data.campaign_id),
        amount: parseFloat(data.amount),
        currency: sanitizeInput(data.currency),
        donation_type: sanitizeInput(data.donation_type),
        notes: sanitizeInput(data.notes),
    };
}
```

```

```
