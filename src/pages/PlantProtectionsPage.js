import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';

const PlantProtectionsPage = () => {
    const [plantProtections, setPlantProtections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pests, setPests] = useState('');
    const [biologicalMeasures, setBiologicalMeasures] = useState('');
    const [applicationDate, setApplicationDate] = useState('');
    const [results, setResults] = useState('');
    const [variety, setVariety] = useState('');
    const [filterVariety, setFilterVariety] = useState('');
    const [filterPests, setFilterPests] = useState('');
    const [editingProtection, setEditingProtection] = useState(null);
    const [varietySuggestions, setVarietySuggestions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPlantProtections = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/plantprotections/', {
                params: {
                    variety__name: filterVariety,
                    pests: filterPests,
                    page: page
                }
            });
            console.log('API response for plant protections:', response.data);
            if (response.data && response.data.results) {
                setPlantProtections(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 10));
            } else {
                setPlantProtections([]);
            }
        } catch (error) {
            console.error('Error fetching plant protections:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPlantProtections();
    }, [page, filterVariety, filterPests]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const protectionData = { pests, biological_measures: biologicalMeasures, application_date: applicationDate, results, variety };

        try {
            if (editingProtection) {
                await axios.put(`/api/plantprotections/${editingProtection.id}/`, protectionData);
            } else {
                await axios.post('/api/plantprotections/', protectionData);
            }
            setPests('');
            setBiologicalMeasures('');
            setApplicationDate('');
            setResults('');
            setVariety('');
            setEditingProtection(null);
            fetchPlantProtections();
        } catch (error) {
            console.error('Error adding plant protection:', error.response ? error.response.data : error);
        }
    };

    const deletePlantProtection = async (id) => {
        try {
            await axios.delete(`/api/plantprotections/${id}/`);
            fetchPlantProtections();
        } catch (error) {
            console.error('Error deleting plant protection:', error);
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
            <h1>Plant Protection</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Pests:
                    <input type="text" value={pests} onChange={(e) => setPests(e.target.value)} required />
                </label>
                <label>
                    Biological Measures:
                    <input type="text" value={biologicalMeasures} onChange={(e) => setBiologicalMeasures(e.target.value)} required />
                </label>
                <label>
                    Application Date:
                    <input type="date" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} required />
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
                <button type="submit">{editingProtection ? 'Update' : 'Add'} Plant Protection</button>
            </form>
            <div>
                <h2>Filters</h2>
                <label>
                    Variety:
                    <input type="text" value={filterVariety} onChange={(e) => setFilterVariety(e.target.value)} />
                </label>
                <label>
                    Pests:
                    <input type="text" value={filterPests} onChange={(e) => setFilterPests(e.target.value)} />
                </label>
                <button onClick={fetchPlantProtections}>Filter</button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                Array.isArray(plantProtections) && plantProtections.length > 0 ? (
                    <div>
                        <ul style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {plantProtections.map((protection) => (
                                <li key={protection.id} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
                                    <h2>{protection.variety.name}</h2>
                                    <p>Pests: {protection.pests}</p>
                                    <p>Biological Measures: {protection.biological_measures}</p>
                                    <p>Application Date: {protection.application_date}</p>
                                    <p>Results: {protection.results}</p>
                                    <button onClick={() => {
                                        setEditingProtection(protection);
                                        setPests(protection.pests);
                                        setBiologicalMeasures(protection.biological_measures);
                                        setApplicationDate(protection.application_date);
                                        setResults(protection.results);
                                        setVariety(protection.variety.name);
                                    }}>Edit</button>
                                    <button onClick={() => deletePlantProtection(protection.id)}>Delete</button>
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
                    <p>No plant protections available.</p>
                )
            )}
        </div>
    );
};

export default PlantProtectionsPage;
