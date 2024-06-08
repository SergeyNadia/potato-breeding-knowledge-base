import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';

const CultivationTechniquesPage = () => {
    const [cultivationTechniques, setCultivationTechniques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [variety, setVariety] = useState('');
    const [technique, setTechnique] = useState('');
    const [applicationDate, setApplicationDate] = useState('');
    const [results, setResults] = useState('');
    const [filterVariety, setFilterVariety] = useState('');
    const [editingTechnique, setEditingTechnique] = useState(null);
    const [varietySuggestions, setVarietySuggestions] = useState([]);
    const [allVarieties, setAllVarieties] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCultivationTechniques = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/cultivationtechniques/', {
                params: {
                    variety__name: filterVariety,
                    page: page
                }
            });
            if (response.data && response.data.results) {
                setCultivationTechniques(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 10));
            } else {
                setCultivationTechniques([]);
            }
        } catch (error) {
            console.error('Error fetching cultivation techniques:', error);
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
        fetchCultivationTechniques();
        fetchVarieties();
    }, [page, filterVariety]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const techniqueData = { variety, technique, application_date: applicationDate, results };

        try {
            if (editingTechnique) {
                await axios.put(`/api/cultivationtechniques/${editingTechnique.id}/`, techniqueData);
            } else {
                await axios.post('/api/cultivationtechniques/', techniqueData);
            }
            setVariety('');
            setTechnique('');
            setApplicationDate('');
            setResults('');
            setEditingTechnique(null);
            fetchCultivationTechniques();
        } catch (error) {
            console.error('Error adding cultivation technique:', error.response ? error.response.data : error);
        }
    };

    const deleteCultivationTechnique = async (id) => {
        try {
            await axios.delete(`/api/cultivationtechniques/${id}/`);
            fetchCultivationTechniques();
        } catch (error) {
            console.error('Error deleting cultivation technique:', error);
        }
    };

    const handleSuggestionsFetchRequested = async ({ value }) => {
        await getSuggestions({ value });
    };

    const handleSuggestionsClearRequested = () => {
        setVarietySuggestions([]);
    };

    const getSuggestions = async ({ value }) => {
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
            <h1>Plant Care</h1>
            <form onSubmit={handleSubmit}>
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
                <label>
                    Technique:
                    <input type="text" value={technique} onChange={(e) => setTechnique(e.target.value)} required />
                </label>
                <label>
                    Application Date:
                    <input type="date" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} required />
                </label>
                <label>
                    Results:
                    <input type="text" value={results} onChange={(e) => setResults(e.target.value)} required />
                </label>
                <button type="submit">{editingTechnique ? 'Update' : 'Add'} Cultivation Technique</button>
            </form>
            <div>
                <h2>Filters</h2>
                <label>
                    Variety:
                    <input type="text" value={filterVariety} onChange={(e) => setFilterVariety(e.target.value)} />
                </label>
                <button onClick={fetchCultivationTechniques}>Filter</button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                Array.isArray(cultivationTechniques) && cultivationTechniques.length > 0 ? (
                    <div>
                        <ul style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {cultivationTechniques.map((technique) => (
                                <li key={technique.id} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
                                    <h2>{technique.variety}</h2>
                                    <p>Technique: {technique.technique}</p>
                                    <p>Application Date: {technique.application_date}</p>
                                    <p>Results: {technique.results}</p>
                                    <button onClick={() => {
                                        setEditingTechnique(technique);
                                        setVariety(technique.variety);
                                        setTechnique(technique.technique);
                                        setApplicationDate(technique.application_date);
                                        setResults(technique.results);
                                    }}>Edit</button>
                                    <button onClick={() => deleteCultivationTechnique(technique.id)}>Delete</button>
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
                    <p>No cultivation techniques available.</p>
                )
            )}
        </div>
    );
};

export default CultivationTechniquesPage;
