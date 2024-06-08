import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';

const StorageConditionsPage = () => {
    const [storageConditions, setStorageConditions] = useState([]);
    const [newStorageCondition, setNewStorageCondition] = useState({
        variety: '',
        temperature: '',
        humidity: '',
        start_date: '',
        end_date: ''
    });
    const [varieties, setVarieties] = useState([]);
    const [varietySuggestions, setVarietySuggestions] = useState([]);
    const [filterVariety, setFilterVariety] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [editingCondition, setEditingCondition] = useState(null);

    const fetchStorageConditions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/storageconditions/', {
                params: {
                    variety__name: filterVariety,
                    page: page
                }
            });
            setStorageConditions(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 10));
        } catch (error) {
            console.error('Error fetching storage conditions', error);
        }
        setLoading(false);
    };

    const fetchVarieties = async () => {
        try {
            const response = await axios.get('/api/potato-varieties/');
            setVarieties(response.data.results);
        } catch (error) {
            console.error('Error fetching varieties', error);
        }
    };

    useEffect(() => {
        fetchStorageConditions();
        fetchVarieties();
    }, [page, filterVariety]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const storageConditionData = { ...newStorageCondition };

        try {
            if (editingCondition) {
                await axios.put(`/api/storageconditions/${editingCondition.id}/`, storageConditionData);
            } else {
                await axios.post('/api/storageconditions/', storageConditionData);
            }
            setNewStorageCondition({ variety: '', temperature: '', humidity: '', start_date: '', end_date: '' });
            setEditingCondition(null);
            fetchStorageConditions();
        } catch (error) {
            console.error('Error adding/updating storage condition:', error.response ? error.response.data : error);
        }
    };

    const deleteStorageCondition = async (id) => {
        if (window.confirm('Are you sure you want to delete this storage condition? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/storageconditions/${id}/`);
                fetchStorageConditions();  // Refresh the list after deleting a storage condition
            } catch (error) {
                console.error('Error deleting storage condition', error);
            }
        }
    };

    const handleSuggestionsFetchRequested = async ({ value }) => {
        try {
            const response = await axios.get('/api/potato-varieties/', {
                params: {
                    search: value
                }
            });
            setVarietySuggestions(response.data.results);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSuggestionsClearRequested = () => {
        setVarietySuggestions([]);
    };

    const getSuggestionValue = (suggestion) => suggestion.name;

    const renderSuggestion = (suggestion) => (
        <div>
            {suggestion.name}
        </div>
    );

    const inputProps = {
        placeholder: 'Type a variety',
        value: newStorageCondition.variety,
        onChange: (e, { newValue }) => setNewStorageCondition({ ...newStorageCondition, variety: newValue })
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div>
            <h1>Storage Conditions</h1>
            <input
                type="text"
                placeholder="Filter by variety"
                value={filterVariety}
                onChange={(e) => setFilterVariety(e.target.value)}
            />
            <button onClick={fetchStorageConditions}>Filter</button>
            <div>
                <form onSubmit={handleSubmit}>
                    <Autosuggest
                        suggestions={varietySuggestions}
                        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
                        onSuggestionsClearRequested={handleSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={inputProps}
                    />
                    <input
                        type="number"
                        placeholder="Temperature"
                        value={newStorageCondition.temperature}
                        onChange={(e) => setNewStorageCondition({ ...newStorageCondition, temperature: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Humidity"
                        value={newStorageCondition.humidity}
                        onChange={(e) => setNewStorageCondition({ ...newStorageCondition, humidity: e.target.value })}
                    />
                    <input
                        type="date"
                        placeholder="Start Date"
                        value={newStorageCondition.start_date}
                        onChange={(e) => setNewStorageCondition({ ...newStorageCondition, start_date: e.target.value })}
                    />
                    <input
                        type="date"
                        placeholder="End Date"
                        value={newStorageCondition.end_date}
                        onChange={(e) => setNewStorageCondition({ ...newStorageCondition, end_date: e.target.value })}
                    />
                    <button type="submit">{editingCondition ? 'Update' : 'Add'} Storage Condition</button>
                </form>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                Array.isArray(storageConditions) && storageConditions.length > 0 ? (
                    <div>
                        <ul style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {storageConditions.map((condition) => (
                                <li key={condition.id} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
                                    <h2>{condition.variety}</h2>
                                    <p>Temperature: {condition.temperature}</p>
                                    <p>Humidity: {condition.humidity}</p>
                                    <p>Start Date: {condition.start_date}</p>
                                    <p>End Date: {condition.end_date}</p>
                                    <button onClick={() => {
                                        setEditingCondition(condition);
                                        setNewStorageCondition({
                                            variety: condition.variety,
                                            temperature: condition.temperature,
                                            humidity: condition.humidity,
                                            start_date: condition.start_date,
                                            end_date: condition.end_date
                                        });
                                    }}>Edit</button>
                                    <button onClick={() => deleteStorageCondition(condition.id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                        <div>
                            <button onClick={() => handlePageChange(page - 1)}>Previous</button>
                            <span>Page {page} of {totalPages}</span>
                            <button onClick={() => handlePageChange(page + 1)}>Next</button>
                        </div>
                    </div>
                ) : (
                    <p>No storage conditions available.</p>
                )
            )}
        </div>
    );
};

export default StorageConditionsPage;
