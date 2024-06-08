import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherDataPage = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [newRecord, setNewRecord] = useState({
        location: '',
        date: '',
        temperature: '',
        humidity: '',
        precipitation: ''
    });
    const [editingRecord, setEditingRecord] = useState(null);

    const fetchWeatherData = async () => {
        try {
            const response = await axios.get('/api/weatherdata/');
            if (response.data && Array.isArray(response.data.results)) {
                setWeatherData(response.data.results);
            } else {
                console.error('Data is not an array:', response.data);
                setWeatherData([]);
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    useEffect(() => {
        fetchWeatherData();
    }, []);

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
    };

    const handleSortChange = (field) => {
        const direction = (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewRecord(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            if (editingRecord) {
                await axios.put(`/api/weatherdata/${editingRecord.id}/`, newRecord);
                setWeatherData(prevData => prevData.map(item => item.id === editingRecord.id ? newRecord : item));
            } else {
                const response = await axios.post('/api/weatherdata/', newRecord);
                setWeatherData(prevData => [...prevData, response.data]);
            }
            setNewRecord({
                location: '',
                date: '',
                temperature: '',
                humidity: '',
                precipitation: ''
            });
            setEditingRecord(null);
        } catch (error) {
            console.error('Error adding/updating weather data:', error);
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setNewRecord(record);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/weatherdata/${id}/`);
            setWeatherData(prevData => prevData.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting weather data:', error);
        }
    };

    const filteredWeatherData = weatherData
        .filter(data =>
            data.location && data.location.toLowerCase().includes(filterText.toLowerCase())
        )
        .sort((a, b) => {
            if (!sortField) return 0;
            if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div>
            <h1>Climate Data</h1>
            <div className="filter-sort-container">
                <input
                    type="text"
                    placeholder="Filter by location"
                    value={filterText}
                    onChange={handleFilterChange}
                />
                <div className="sort-buttons">
                    <button onClick={() => handleSortChange('location')}>
                        Sort by Location
                    </button>
                    <button onClick={() => handleSortChange('date')}>
                        Sort by Date
                    </button>
                </div>
            </div>
            <form onSubmit={handleFormSubmit}>
                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={newRecord.location}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="datetime-local"
                    name="date"
                    placeholder="Date"
                    value={newRecord.date}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="number"
                    name="temperature"
                    placeholder="Temperature"
                    value={newRecord.temperature}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="number"
                    name="humidity"
                    placeholder="Humidity"
                    value={newRecord.humidity}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="number"
                    name="precipitation"
                    placeholder="Precipitation"
                    value={newRecord.precipitation}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit">{editingRecord ? 'Update Record' : 'Add Record'}</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSortChange('location')}>
                            Location {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSortChange('date')}>
                            Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Temperature</th>
                        <th>Humidity</th>
                        <th>Precipitation</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWeatherData.map(data => (
                        <tr key={data.id}>
                            <td>{data.location}</td>
                            <td>{new Date(data.date).toLocaleString()}</td>
                            <td>{data.temperature}</td>
                            <td>{data.humidity}</td>
                            <td>{data.precipitation}</td>
                            <td>
                                <button onClick={() => handleEdit(data)}>Edit</button>
                                <button onClick={() => handleDelete(data.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WeatherDataPage;
