import React, { useEffect, useState } from 'react';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../amplify/data/resource';
import '@aws-amplify/ui-react/styles.css';

type SensorDataType = Schema["sensor_data_new_tbl"]["type"];
type Nullable<T> = T | null;

const client = generateClient<Schema>();

function App() {
  const { signOut, user } = useAuthenticator();
  const [sensorData, setSensorData] = useState<SensorDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<SensorDataType>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await client.models.sensor_data_new_tbl.list();
      console.log('Fetch response:', response);
      
      if (response.errors) {
        console.error('Fetch errors:', response.errors);
        setError('Failed to fetch data');
        return;
      }

      const sortedData = [...(response.data || [])].sort((a, b) => {
        const idA = typeof a.id === 'string' ? parseInt(a.id, 10) : a.id;
        const idB = typeof b.id === 'string' ? parseInt(b.id, 10) : b.id;
        if (isNaN(idA)) return 1;
        if (isNaN(idB)) return -1;
        return idA - idB;
      });
      
      console.log('Sorted data:', sortedData);
      setSensorData(sortedData);
      
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: SensorDataType) => {
    setEditingId(typeof item.id === 'string' ? parseInt(item.id, 10) : item.id);
    setEditForm(item);
  };

  const handleUpdate = async () => {
    try {
      if (!editingId) return;

      console.log('Updating with data:', editForm);

      const updateData: SensorDataType = {
        id: editingId,
        topicsensor: editForm.topicsensor || null,
        temperature: Number(editForm.temperature) || 0,
        location: editForm.location || null,
        system: editForm.system || null,
        // Add all other required fields with default values
        payloadlength: null,
        timestamp_mess_rcvd: null,
        // ... add other required fields based on your Schema
      };

      const response = await client.models.sensor_data_new_tbl.update(updateData);
      console.log('Update response:', response);

      if (response.errors) {
        console.error('Update errors:', response.errors);
        setError('Failed to update data');
        return;
      }

      setEditingId(null);
      setEditForm({});

      setSensorData(prevData => 
        prevData.map(item => 
          (typeof item.id === 'string' ? parseInt(item.id, 10) : item.id) === editingId 
            ? { ...item, ...updateData } 
            : item
        )
      );

      await fetchData();

    } catch (err: unknown) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header section */}
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Sensor Data</h1>
          <div className="user-info">
            <span className="username">Welcome, {user?.username}</span>
            <button onClick={signOut} className="signout-button">Sign Out</button>
          </div>
        </div>
      </header>

      {/* Main content */}
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
                    {(typeof item.id === 'string' ? parseInt(item.id, 10) : item.id) === editingId ? (
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
                    {(typeof item.id === 'string' ? parseInt(item.id, 10) : item.id) === editingId ? (
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
                    {(typeof item.id === 'string' ? parseInt(item.id, 10) : item.id) === editingId ? (
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
                    {(typeof item.id === 'string' ? parseInt(item.id, 10) : item.id) === editingId ? (
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
                    {(typeof item.id === 'string' ? parseInt(item.id, 10) : item.id) === editingId ? (
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
