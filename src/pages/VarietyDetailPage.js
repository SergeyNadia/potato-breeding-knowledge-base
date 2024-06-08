import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const VarietyDetailPage = () => {
    const { id } = useParams();
    const [variety, setVariety] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVariety = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/potato-varieties/${id}/`);
                setVariety(response.data);
            } catch (error) {
                console.error('Error fetching variety:', error);
            }
            setLoading(false);
        };

        fetchVariety();
    }, [id]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!variety) {
        return <p>Variety not found</p>;
    }

    return (
        <div>
            <h1>{variety.name}</h1>
            <p>Year: {variety.year}</p>
            <p>Patent Number: {variety.patent_number}</p>
            <p>Description: {variety.description}</p>
            <p>Characteristics: {variety.characteristics}</p>
        </div>
    );
};

export default VarietyDetailPage;
