"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  image?: string;
}

const API_URL = "http://localhost:5001/api/services";

export default function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    duration: "",
    description: "",
    image: null as File | null,
  });

  // 🔄 Fetch Services
  const fetchServices = async () => {
    const res = await axios.get(API_URL);
    setServices(res.data.data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // 🔍 Search filter
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  // 📝 Handle Input
  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ➕ Add / Update Service
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value as any);
      });

      if (editingService) {
        await axios.put(`${API_URL}/${editingService._id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }

      setShowModal(false);
      setEditingService(null);
      setForm({
        name: "",
        category: "",
        price: "",
        duration: "",
        description: "",
        image: null,
      });

      fetchServices();
    } catch (err) {
      console.error(err);
      alert("Error saving service");
    }
  };

  // 🗑️ Delete Service
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchServices();
    }
  };

  // ✏️ Edit Service
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      category: service.category,
      price: String(service.price),
      duration: String(service.duration),
      description: service.description,
      image: null,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Services</h1>

      {/* Top Controls */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search services..."
          className="border px-4 py-2 rounded-lg w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => {
            setEditingService(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Service
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service) => (
              <tr key={service._id} className="border-t">
                <td className="p-3">
                  {service.image && (
                    <img
                      src={`http://localhost:5001${service.image}`}
                      className="w-14 h-14 object-cover rounded"
                    />
                  )}
                </td>
                <td className="p-3">{service.name}</td>
                <td className="p-3">{service.category}</td>
                <td className="p-3">Rs. {service.price}</td>
                <td className="p-3">{service.duration} min</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="bg-yellow-400 px-3 py-1 rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-3">
            <h2 className="text-xl font-semibold">
              {editingService ? "Update Service" : "Add Service"}
            </h2>

            <input
              name="name"
              placeholder="Service Name"
              className="w-full border p-2 rounded"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="category"
              placeholder="Category"
              className="w-full border p-2 rounded"
              value={form.category}
              onChange={handleChange}
            />

            <input
              name="price"
              placeholder="Price"
              className="w-full border p-2 rounded"
              value={form.price}
              onChange={handleChange}
            />

            <input
              name="duration"
              placeholder="Duration"
              className="w-full border p-2 rounded"
              value={form.duration}
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="Description"
              className="w-full border p-2 rounded"
              value={form.description}
              onChange={handleChange}
            />

            <input type="file" onChange={handleChange} />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
