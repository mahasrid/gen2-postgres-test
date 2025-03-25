import { useEffect, useState } from 'react';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../amplify/data/resource';
import '@aws-amplify/ui-react/styles.css';

type SensorDataType = Schema["sensor_data_new_tbl"]["type"];

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
      if (response.errors) {
        setError('Failed to fetch data');
        return;
      }
      setSensorData(response.data || []);
    } catch (err) {
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
    if (!editingId) return;
    try {
      const updateData: SensorDataType = { id: editingId, ...editForm };
      await client.models.sensor_data_new_tbl.update(updateData);
      setEditingId(null);
      setEditForm({});
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <header className="w-full max-w-4xl bg-white shadow-md p-4 flex justify-between items-center rounded-lg">
        <h1 className="text-2xl font-semibold">Sensor Data</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.username}</span>
          <button onClick={signOut} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Sign Out</button>
        </div>
      </header>
      
      <main className="w-full max-w-4xl bg-white mt-6 p-4 rounded-lg shadow-md">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        
        <table className="w-full border-collapse border border-gray-200 mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Topic Sensor</th>
              <th className="border p-2">Temperature</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">System</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sensorData.map((item) => (
              <tr key={item.id} className="text-center border">
                <td className="border p-2">{item.id}</td>
                <td className="border p-2">
                  {editingId === item.id ? (
                    <input type="text" value={editForm.topicsensor || ''} 
                      onChange={(e) => setEditForm({ ...editForm, topicsensor: e.target.value })}
                      className="border p-1 w-full" />
                  ) : (item.topicsensor)}
                </td>
                <td className="border p-2">
                  {editingId === item.id ? (
                    <input type="number" value={editForm.temperature || ''} 
                      onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })}
                      className="border p-1 w-full" />
                  ) : (item.temperature)}
                </td>
                <td className="border p-2">
                  {editingId === item.id ? (
                    <input type="text" value={editForm.location || ''} 
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="border p-1 w-full" />
                  ) : (item.location)}
                </td>
                <td className="border p-2">
                  {editingId === item.id ? (
                    <input type="text" value={editForm.system || ''} 
                      onChange={(e) => setEditForm({ ...editForm, system: e.target.value })}
                      className="border p-1 w-full" />
                  ) : (item.system)}
                </td>
                <td className="border p-2">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <button onClick={handleUpdate} className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(item)} className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default withAuthenticator(App);
