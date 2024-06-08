import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';

const FieldTrialsPage = () => {
    const [fieldTrials, setFieldTrials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [conditions, setConditions] = useState('');
    const [results, setResults] = useState('');
    const [variety, setVariety] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterVariety, setFilterVariety] = useState('');
    const [editingTrial, setEditingTrial] = useState(null);
    const [varietySuggestions, setVarietySuggestions] = useState([]);
    const [allVarieties, setAllVarieties] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchFieldTrials = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/fieldtrials/', {
                params: {
                    location: filterLocation,
                    variety__name: filterVariety,
                    page: page
                }
            });
            console.log('API response for field trials:', response.data);
            if (response.data && response.data.results) {
                setFieldTrials(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 10));
            } else {
                setFieldTrials([]);
            }
        } catch (error) {
            console.error('Error fetching field trials:', error);
        }
        setLoading(false);
    };

    const fetchVarieties = async () => {
        try {
            const response = await axios.get('/api/potato-varieties/');
            setAllVarieties(response.data.results);
        } catch (error) {
            console.error('Error fetching varieties:', error);
        }
    };

    useEffect(() => {
        fetchFieldTrials();
        fetchVarieties();
    }, [page, filterLocation, filterVariety]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trialData = { date, location, conditions, results, variety };

        try {
            if (editingTrial) {
                await axios.put(`/api/fieldtrials/${editingTrial.id}/`, trialData);
            } else {
                await axios.post('/api/fieldtrials/', trialData);
            }
            setDate('');
            setLocation('');
            setConditions('');
            setResults('');
            setVariety('');
            setEditingTrial(null);
            fetchFieldTrials();
        } catch (error) {
            console.error('Error adding field trial:', error.response ? error.response.data : error);
        }
    };

    const deleteFieldTrial = async (id) => {
        try {
            await axios.delete(`/api/fieldtrials/${id}/`);
            fetchFieldTrials();
        } catch (error) {
            console.error('Error deleting field trial:', error);
        }
    };

    const handleSuggestionsFetchRequested = async ({ value }) => {
        try {
            const response = await axios.get('/api/potato-varieties/', {
                params: { search: value }
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

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const inputProps = {
        placeholder: 'Type a variety',
        value: variety,
        onChange: (e, { newValue }) => setVariety(newValue)
    };

    return (
        <div>
            <h1>Field Trials</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Date:
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </label>
                <label>
                    Location:
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </label>
                <label>
                    Conditions:
                    <input type="text" value={conditions} onChange={(e) => setConditions(e.target.value)} required />
                </label>
                <label>
                    Results:
                    <input type="text" value={results} onChange={(e) => setResults(e.target.value)} required />
                </label>
                <label>
                    Variety:
                    <Autosuggest
                        suggestions={varietySuggestions}
                        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
                        onSuggestionsClearRequested={handleSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={inputProps}
                    />
                </label>
                <button type="submit">{editingTrial ? 'Update' : 'Add'} Field Trial</button>
            </form>
            <div>
                <h2>Filters</h2>
                <label>
                    Location:
                    <input type="text" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
                </label>
                <label>
                    Variety:
                    <input type="text" value={filterVariety} onChange={(e) => setFilterVariety(e.target.value)} />
                </label>
                <button onClick={fetchFieldTrials}>Filter</button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                Array.isArray(fieldTrials) && fieldTrials.length > 0 ? (
                    <div>
                        <ul style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {fieldTrials.map((trial) => (
                                <li key={trial.id} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
                                    <h2>{trial.variety}</h2>
                                    <p>Date: {trial.date}</p>
                                    <p>Location: {trial.location}</p>
                                    <p>Conditions: {trial.conditions}</p>
                                    <p>Results: {trial.results}</p>
                                    <button onClick={() => {
                                        setEditingTrial(trial);
                                        setDate(trial.date);
                                        setLocation(trial.location);
                                        setConditions(trial.conditions);
                                        setResults(trial.results);
                                        setVariety(trial.variety);
                                    }}>Edit</button>
                                    <button onClick={() => deleteFieldTrial(trial.id)}>Delete</button>
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
                    <p>No field trials available.</p>
                )
            )}
        </div>
    );
};

export default FieldTrialsPage;
