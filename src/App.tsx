import React, { useEffect, useState } from 'react';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../amplify/data/resource';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

// Icons (you can use react-icons library)
const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="error-message">
    <strong>Error: </strong>
    {message}
  </div>
);

const client = generateClient<Schema>();

function App() {
  const { signOut, user } = useAuthenticator();
  const [sensorData, setSensorData] = useState<Array<Schema["sensor_data_new_tbl"]["type"]>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Schema["sensor_data_new_tbl"]["type"]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await client.models.sensor_data_new_tbl.list();
      
      if (response.errors) {
        throw new Error('Failed to fetch data');
      }

      const sortedData = [...(response.data || [])].sort((a, b) => {
        const idA = Number(a.id);
        const idB = Number(b.id);
        return (isNaN(idA) || isNaN(idB)) ? 0 : idA - idB;
      });
      
      setSensorData(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: Schema["sensor_data_new_tbl"]["type"]) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleUpdate = async () => {
    try {
      if (!editingId) return;

      const updateData = {
        id: editingId,
        topicsensor: editForm.topicsensor,
        temperature: Number(editForm.temperature),
        location: editForm.location,
        system: editForm.system
      };

      const response = await client.models.sensor_data_new_tbl.update(updateData);
      
      if (response.errors) {
        throw new Error('Failed to update data');
      }

      setEditingId(null);
      setEditForm({});
      await fetchData();
      
    } catch (err) {
      setError(`Update failed: ${err.message}`);
    }
  };

  const filteredData = sensorData.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <h1 className="dashboard-title">Sensor Dashboard</h1>
          </div>
          <div className="navbar-right">
            <div className="user-info">
              <span className="username">{user?.username}</span>
              <button onClick={signOut} className="signout-button">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="controls-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="data-card">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('id')} className="sortable-header">
                      ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('topicsensor')} className="sortable-header">
                      Sensor {sortConfig?.key === 'topicsensor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('temperature')} className="sortable-header">
                      Temperature {sortConfig?.key === 'temperature' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('location')} className="sortable-header">
                      Location {sortConfig?.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('system')} className="sortable-header">
                      System {sortConfig?.key === 'system' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((item) => (
                    <tr key={item.id} className="data-row">
                      <td className="data-cell">{item.id}</td>
                      <td className="data-cell">{item.topicsensor}</td>
                      <td className="data-cell temperature">
                        {item.temperature}°C
                      </td>
                      <td className="data-cell">{item.location}</td>
                      <td className="data-cell">{item.system}</td>
                      <td className="data-cell actions">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="edit-button"
                          aria-label="Edit"
                        >
                          <EditIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {editingId && (
        <div className="modal-overlay" onClick={() => setEditingId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Edit Sensor Data</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="topicsensor">Sensor Name</label>
                <input
                  id="topicsensor"
                  type="text"
                  value={editForm.topicsensor || ''}
                  onChange={(e) => setEditForm({ ...editForm, topicsensor: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="temperature">Temperature</label>
                <input
                  id="temperature"
                  type="number"
                  value={editForm.temperature || ''}
                  onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="system">System</label>
                <input
                  id="system"
                  type="text"
                  value={editForm.system || ''}
                  onChange={(e) => setEditForm({ ...editForm, system: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="button-group">
              <button onClick={() => setEditingId(null)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleUpdate} className="save-button">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuthenticator(App);
