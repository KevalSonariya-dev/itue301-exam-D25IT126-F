import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../api/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminStats();
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError(
        err.response?.data?.message || 'Failed to load administrator statistics from backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Executive Dashboard</h2>
          <p className="admin-page-subtitle">
            System overview and real-time inventory metrics calculated from backend records.
          </p>
        </div>
        <button
          type="button"
          className="btn-refresh"
          onClick={fetchStats}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Calculating live dashboard metrics...</div>
      ) : stats ? (
        <div className="admin-dashboard-grid">
          {/* Inventory Overview */}
          <div className="admin-metric-card highlight-indigo">
            <div className="metric-header">
              <span className="metric-title">Total Events</span>
              <span className="metric-icon">🎪</span>
            </div>
            <div className="metric-number">{stats.totalEvents}</div>
            <p className="metric-hint">Active event listings across all categories</p>
            <NavLink to="/admin/events" className="metric-link">Manage Events →</NavLink>
          </div>

          <div className="admin-metric-card highlight-blue">
            <div className="metric-header">
              <span className="metric-title">Total Ticket Capacity</span>
              <span className="metric-icon">🏟️</span>
            </div>
            <div className="metric-number">{stats.totalTicketCapacity}</div>
            <p className="metric-hint">Combined venue quota for all events</p>
            <div className="metric-footer-note">Invariant: Booked + Remaining = Capacity</div>
          </div>

          <div className="admin-metric-card highlight-emerald">
            <div className="metric-header">
              <span className="metric-title">Tickets Booked</span>
              <span className="metric-icon">🎟️</span>
            </div>
            <div className="metric-number">{stats.ticketsBooked}</div>
            <p className="metric-hint">Reserved seats across active bookings</p>
            <NavLink to="/admin/bookings" className="metric-link">View Bookings →</NavLink>
          </div>

          <div className="admin-metric-card highlight-amber">
            <div className="metric-header">
              <span className="metric-title">Tickets Remaining</span>
              <span className="metric-icon">⏳</span>
            </div>
            <div className="metric-number">{stats.ticketsRemaining}</div>
            <p className="metric-hint">Unsold tickets currently available to attendees</p>
            <div className="metric-footer-note">Synchronized on every transaction</div>
          </div>

          <div className="admin-metric-card highlight-purple">
            <div className="metric-header">
              <span className="metric-title">Total Booking Records</span>
              <span className="metric-icon">📋</span>
            </div>
            <div className="metric-number">{stats.totalBookings}</div>
            <p className="metric-hint">Total transactions in system history</p>
            <NavLink to="/admin/bookings" className="metric-link">Manage Records →</NavLink>
          </div>

          {/* Detailed Breakdown Card */}
          <div className="admin-metric-card breakdown-card">
            <div className="metric-header">
              <span className="metric-title">Status Breakdown</span>
              <span className="metric-icon">📊</span>
            </div>
            <div className="breakdown-list">
              <div className="breakdown-row">
                <span className="breakdown-tag status-booked">● Confirmed Bookings:</span>
                <strong className="text-emerald">
                  {stats.activeBookingsCount} ({stats.activeTicketsCount} tickets)
                </strong>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-tag status-cancelled">● Cancelled Bookings:</span>
                <strong className="text-red">
                  {stats.cancelledBookingsCount} ({stats.cancelledTicketsCount} tickets)
                </strong>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-tag status-used">● Used / Redeemed:</span>
                <strong className="text-purple">
                  {stats.usedBookingsCount} ({stats.usedTicketsCount} tickets)
                </strong>
              </div>
            </div>
            <div className="breakdown-summary">
              Excludes cancelled bookings from active quota automatically.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AdminDashboard;
