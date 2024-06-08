import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist';
import Papa from 'papaparse';

const ReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  useEffect(() => {
    const csvFilePath = "/temperature.csv";

    const fetchData = async () => {
      const response = await fetch(csvFilePath);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csvData = decoder.decode(result.value);

      const parsedData = Papa.parse(csvData, { header: true, delimiter: ";" }).data;

      // Извлечение меток (дат) и данных (температур)
      const labels = parsedData.map((row) => row["date"]);
      const temperatures = parsedData.map((row) => parseFloat(row["temperature"]));

      // Формирование данных для графика
      const data = labels.map((label, index) => ({
        date: label,
        temperature: temperatures[index],
      }));

      // Переворачивание массива данных
      const reversedData = data.reverse();

      setReportData(reversedData);
      setFilteredData(reversedData); // Изначально показываем все данные
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (startDateTime && endDateTime) {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      const filtered = reportData.filter((item) => {
        const itemDate = new Date(item.date.replaceAll('.', '-'));
        return itemDate >= start && itemDate <= end;
      });

      setFilteredData(filtered);
    } else {
      setFilteredData(reportData);
    }
  }, [startDateTime, endDateTime, reportData]);

  return (
    <div>
      <h1>Weather Report</h1>
      <div>
        <label>
          Start Date and Time:
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
          />
        </label>
        <label>
          End Date and Time:
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
          />
        </label>
      </div>
      <Plot
        data={[
          {
            x: filteredData.map((item) => item.date),
            y: filteredData.map((item) => item.temperature),
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'orange' },
          },
        ]}
        layout={{ title: 'Weather Report', yaxis: { title: 'Temperature' } }}
      />
    </div>
  );
};

export default ReportPage;
