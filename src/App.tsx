import { useEffect, useState } from "react";
import { withAuthenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/api";
import { type Schema } from "../amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient<Schema>();

function App() {
  const { signOut, user } = useAuthenticator();
  const [sensorData, setSensorData] = useState<
    Schema["sensor_data_new_tbl"]["type"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<
    Partial<Schema["sensor_data_new_tbl"]["type"]>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await client.models.sensor_data_new_tbl.list();
        setSensorData(response.data || []);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (item: Schema["sensor_data_new_tbl"]["type"]) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await client.models.sensor_data_new_tbl.update({
        id: editingId,
        ...editForm,
      });
      setSensorData(
        sensorData.map((item) =>
          item.id === editingId ? { ...item, ...editForm } : item
        )
      );
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      setError("Failed to save data");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const totalPages = Math.ceil(sensorData.length / itemsPerPage);
  const paginatedData = sensorData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <header className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg p-6 flex justify-between items-center rounded-lg mb-6 text-white">
        <h1 className="text-2xl font-bold">📡 Sensor Data Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg">Welcome, {user?.username}</span>
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </header>
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4 text-left text-gray-700">ID</th>
              <th className="p-4 text-left text-gray-700">Topic Sensor</th>
              <th className="p-4 text-left text-gray-700">Temperature</th>
              <th className="p-4 text-left text-gray-700">Location</th>
              <th className="p-4 text-left text-gray-700">System</th>
              <th className="p-4 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-100">
                <td className="p-4">{item.id}</td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editForm.topicsensor || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          topicsensor: e.target.value,
                        })
                      }
                      className="border p-2 rounded"
                    />
                  ) : (
                    item.topicsensor || "-"
                  )}
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editForm.temperature || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      className="border p-2 rounded"
                    />
                  ) : (
                    item.temperature || "-"
                  )}
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editForm.location || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      className="border p-2 rounded"
                    />
                  ) : (
                    item.location || "-"
                  )}
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editForm.system || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, system: e.target.value })
                      }
                      className="border p-2 rounded"
                    />
                  ) : (
                    item.system || "-"
                  )}
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
