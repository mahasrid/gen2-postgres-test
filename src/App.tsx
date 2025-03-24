import React, { useEffect, useState } from 'react';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../amplify/data/resource';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

function App() {
  const { signOut, user } = useAuthenticator();
  const [sensorData, setSensorData] = useState<Array<Schema["sensor_data_new_tbl"]["type"]>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Schema["sensor_data_new_tbl"]["type"]>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await client.models.sensor_data_new_tbl.list();
      console.log('Fetch response:', response); // Debug log
      
      if (response.errors) {
        console.error('Fetch errors:', response.errors);
        setError('Failed to fetch data');
        return;
      }

      const sortedData = [...(response.data || [])].sort((a, b) => {
        // Ensure we're comparing numbers, including 0
        const idA = Number(a.id);
        const idB = Number(b.id);
        // Check if either value is NaN
        if (isNaN(idA)) return 1;  // Move invalid values to the end
        if (isNaN(idB)) return -1; // Move invalid values to the end
        return idA - idB;  // Normal comparison including 0
      });
      
      console.log('Sorted data:', sortedData); // Debug log to see all IDs

      
      setSensorData(sortedData);
      
    } catch (err) {
      console.error('Fetch error:', err);
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

      console.log('Updating with data:', editForm);

      const updateData = {
        id: editingId,
        topicsensor: editForm.topicsensor,
        temperature: Number(editForm.temperature),
        location: editForm.location,
        system: editForm.system
      };

      const response = await client.models.sensor_data_new_tbl.update(updatdateData);
      console.log('Update response:', response);

      if (response.errors) {
        console.error('Update errors:', response.errors);
        setError('Failed to update data');
        return;
      }

      // Reset edit state
      setEditingId(null);
      setEditForm({});

      // Immediate update in the UI
      setSensorData(prevData => 
        prevData.map(item => 
          item.id === editingId ? { ...item, ...updateData } : item
        )
      );

      // Fetch fresh data from server
      await fetchData();

    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update: ' + err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Rest of your JSX remains the same
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Sensor Data</h1>
          <div className="user-info">
            <span className="username">Welcome, {user?.username}</span>
            <button onClick={signOut} className="signout-button">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="table-container">
          <table className="sensor-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Topic Sensor</th>
                <th>Temperature</th>
                <th>Location</th>
                <th>System</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sensorData) && sensorData.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editForm.topicsensor || ''}
                        onChange={(e) => setEditForm({ ...editForm, topicsensor: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      item.topicsensor
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editForm.temperature || ''}
                        onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })}
                        className="edit-input"
                      />
                    ) : (
                      item.temperature
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      item.location
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editForm.system || ''}
                        onChange={(e) => setEditForm({ ...editForm, system: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      item.system
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <div className="button-group">
                        <button onClick={handleUpdate} className="save-button">Save</button>
                        <button onClick={handleCancel} className="cancel-button">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(item)} className="edit-button">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default withAuthenticator(App);
