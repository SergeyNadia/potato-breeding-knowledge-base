import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VarietiesPage = () => {
    const [varieties, setVarieties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [patentNumber, setPatentNumber] = useState('');
    const [description, setDescription] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchVarieties = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/potato-varieties/', {
                params: {
                    search: `${name} ${year} ${patentNumber} ${description}`,
                    page: page,
                    page_size: 10 // Количество элементов на странице
                },
            });
            setVarieties(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 10)); // Устанавливаем общее количество страниц
        } catch (error) {
            console.error('Error fetching varieties:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVarieties();
    }, [name, year, patentNumber, description, page]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div>
            <h1>Potato Varieties</h1>
            <div>
                <label>
                    Name:
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label>
                    Year:
                    <input type="text" value={year} onChange={(e) => setYear(e.target.value)} />
                </label>
                <label>
                    Patent Number:
                    <input type="text" value={patentNumber} onChange={(e) => setPatentNumber(e.target.value)} />
                </label>
                <label>
                    Description:
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
                <button onClick={fetchVarieties}>Search</button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <ul>
                        {varieties.map((variety) => (
                            <li key={variety.id}>
                                <h2>{variety.name}</h2>
                                <p>Year: {variety.year}</p>
                                <p>Patent Number: {variety.patent_number}</p>
                                <p>Description: {variety.description}</p>
                                <p>Characteristics: {variety.characteristics}</p>
                            </li>
                        ))}
                    </ul>
                    <div>
                        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default VarietiesPage;
