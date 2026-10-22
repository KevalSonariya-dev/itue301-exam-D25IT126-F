import React, { useState, useEffect } from 'react';
import api from '../../api/api';

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal / Form state for Create and Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    date: '',
    venue: '',
    totalTickets: 50,
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminEvents();
      if (res && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setError(err.response?.data?.message || 'Failed to fetch admin events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filtered Events
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' ||
      evt.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Unique categories for filter dropdown
  const categories = ['all', ...new Set(events.map((e) => e.category || 'General'))];

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingEventId(null);
    setFormData({
      title: '',
      category: 'Technology',
      date: '',
      venue: '',
      totalTickets: 50,
    });
    setFeedback(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (evt) => {
    setIsEditing(true);
    setEditingEventId(evt.id);
    setFormData({
      title: evt.title,
      category: evt.category || 'General',
      date: evt.date,
      venue: evt.venue,
      totalTickets: evt.totalTickets || (evt.ticketsAvailable + (evt.ticketsBooked || 0)),
    });
    setFeedback(null);
    setIsModalOpen(true);
  };

  // Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!formData.title.trim() || !formData.date.trim() || !formData.venue.trim()) {
      setFeedback({ type: 'error', text: 'Title, date, and venue are required.' });
      return;
    }

    const cap = parseInt(formData.totalTickets, 10);
    if (isNaN(cap) || cap < 1) {
      setFeedback({ type: 'error', text: 'Capacity must be a positive integer.' });
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        const res = await api.updateAdminEvent(editingEventId, {
          title: formData.title,
          category: formData.category,
          date: formData.date,
          venue: formData.venue,
          totalTickets: cap,
        });

        setFeedback({ type: 'success', text: `✓ Event "${formData.title}" updated successfully.` });
        setIsModalOpen(false);
        await fetchEvents();
      } else {
        const res = await api.createAdminEvent({
          title: formData.title,
          category: formData.category,
          date: formData.date,
          venue: formData.venue,
          totalTickets: cap,
        });

        setFeedback({ type: 'success', text: `✓ Event "${formData.title}" created successfully.` });
        setIsModalOpen(false);
        await fetchEvents();
      }
    } catch (err) {
      console.error('Save event failed:', err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save event.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Event Handler (Safe Deletion with Confirmation)
  const handleDelete = async (evt) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete event "${evt.title}"?\n\nNOTE: Deletion is only permitted if there are NO active bookings.`
    );
    if (!confirmDelete) return;

    try {
      setFeedback(null);
      await api.deleteAdminEvent(evt.id);
      setFeedback({ type: 'success', text: `✓ Event "${evt.title}" was deleted safely.` });
      await fetchEvents();
    } catch (err) {
      console.error('Delete event failed:', err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete event.',
      });
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Event Inventory Management</h2>
          <p className="admin-page-subtitle">
            Create, update capacities, and safely manage event listings.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          + Create New Event
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={feedback.type === 'success' ? 'booking-alert-success' : 'alert-error'}
          role="alert"
        >
          {feedback.text}
        </div>
      )}

      {error && (
        <div className="alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="admin-controls-card card">
        <div className="admin-controls-grid">
          <div className="control-item flex-2">
            <label htmlFor="searchEvents" className="form-label">
              Search by Title
            </label>
            <input
              type="text"
              id="searchEvents"
              className="form-input"
              placeholder="e.g. Hackathon, Summit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="control-item flex-1">
            <label htmlFor="filterCategory" className="form-label">
              Filter Category
            </label>
            <select
              id="filterCategory"
              className="form-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Table View */}
      {loading ? (
        <div className="loading-state">Loading event records...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="card empty-state-box">
          <p>No events match your search or filter criteria.</p>
        </div>
      ) : (
        <div className="admin-table-container card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event Title &amp; Category</th>
                <th>Date &amp; Venue</th>
                <th>Capacity</th>
                <th>Booked</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => {
                const total = evt.totalTickets || (evt.ticketsAvailable + (evt.ticketsBooked || 0));
                const booked = evt.ticketsBooked || 0;
                const available = evt.ticketsAvailable;
                const isSoldOut = available === 0;

                return (
                  <tr key={evt.id}>
                    <td>
                      <div className="table-event-title">{evt.title}</div>
                      <span className="event-category-badge">{evt.category}</span>
                    </td>
                    <td>
                      <div>📅 {evt.date}</div>
                      <div className="text-secondary">📍 {evt.venue}</div>
                    </td>
                    <td>
                      <strong>{total}</strong>
                    </td>
                    <td>
                      <span className="text-blue font-bold">{booked}</span>
                    </td>
                    <td>
                      <span className={isSoldOut ? 'text-red font-bold' : 'text-emerald font-bold'}>
                        {available}
                      </span>
                    </td>
                    <td>
                      {isSoldOut ? (
                        <span className="badge-sold-out-pill">Sold Out</span>
                      ) : (
                        <span className="badge-active-pill">Available</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => handleOpenEdit(evt)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDelete(evt)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card card">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Event Details' : 'Create New Event Listing'}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="evtTitle" className="form-label">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="evtTitle"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="evtCategory" className="form-label">
                    Category *
                  </label>
                  <input
                    type="text"
                    id="evtCategory"
                    required
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="evtCapacity" className="form-label">
                    Total Capacity *
                  </label>
                  <input
                    type="number"
                    id="evtCapacity"
                    required
                    min="1"
                    className="form-input"
                    value={formData.totalTickets}
                    onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="evtDate" className="form-label">
                    Date &amp; Time *
                  </label>
                  <input
                    type="text"
                    id="evtDate"
                    required
                    placeholder="e.g. Nov 15, 2026 • 09:00 AM"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="evtVenue" className="form-label">
                    Venue *
                  </label>
                  <input
                    type="text"
                    id="evtVenue"
                    required
                    placeholder="e.g. Convention Center, Hall A"
                    className="form-input"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEvents;
