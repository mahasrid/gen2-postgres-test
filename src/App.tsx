import { useEffect, useState } from 'react';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../amplify/data/resource';
import '@aws-amplify/ui-react/styles.css';
import { Button, Flex, Heading, View, TextField } from "@aws-amplify/ui-react";
//test
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
    setEditingId(item.id as number);
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
    <View padding="1rem">
      <Flex direction="column" alignItems="center">
        <Heading level={1}>Sensor Data</Heading>
        <Flex justifyContent="space-between" width="100%" maxWidth="800px" alignItems="center">
          <span>Welcome, {user?.username}</span>
          <Button onClick={signOut} variation="primary">Sign Out</Button>
        </Flex>
      </Flex>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {sensorData.map((item) => (
          <li key={item.id} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
            <Flex direction="column" gap="0.5rem">
              <strong>ID:</strong> {item.id}
              <strong>Topic Sensor:</strong>
              {editingId === item.id ? (
                <TextField value={editForm.topicsensor || ''} onChange={(e) => setEditForm({ ...editForm, topicsensor: e.target.value })} />
              ) : (
                item.topicsensor
              )}
              <strong>Temperature:</strong>
              {editingId === item.id ? (
                <TextField type="number" value={editForm.temperature || ''} onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })} />
              ) : (
                item.temperature
              )}
              <strong>Location:</strong>
              {editingId === item.id ? (
                <TextField value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
              ) : (
                item.location
              )}
              <strong>System:</strong>
              {editingId === item.id ? (
                <TextField value={editForm.system || ''} onChange={(e) => setEditForm({ ...editForm, system: e.target.value })} />
              ) : (
                item.system
              )}
              <Flex gap="0.5rem">
                {editingId === item.id ? (
                  <>
                    <Button onClick={handleUpdate} variation="primary">Save</Button>
                    <Button onClick={() => setEditingId(null)} variation="link">Cancel</Button>
                  </>
                ) : (
                  <Button onClick={() => handleEdit(item)} variation="secondary">Edit</Button>
                )}
              </Flex>
            </Flex>
          </li>
        ))}
      </ul>
    </View>
  );
}

export default withAuthenticator(App);
