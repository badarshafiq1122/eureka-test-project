import { useState, useEffect } from "react";

function App() {
  const [holidays, setHolidays] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/holidays")
      .then((response) => response.json())
      .then((data) => setHolidays(data))
      .catch((error) => console.error("Error fetching holidays:", error));
    
    fetch("http://localhost:3000/api/holiday-lookups")
      .then((response) => response.json())
      .then((data) => setHistory(data))
      .catch((error) => console.error("Error fetching history:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedHoliday) return;

    setLoading(true);
    const holiday = holidays.find((h) => h.date === selectedHoliday);
    const holidayDate = new Date(holiday.date);
    const today = new Date();
    const daysUntil = Math.ceil((holidayDate - today) / (1000 * 60 * 60 * 24));

    fetch("http://localhost:3000/api/holiday-lookups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        holiday_name: holiday.name,
        holiday_date: holiday.date,
        days_until: daysUntil,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setHistory([data, ...history]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error saving lookup:", error);
        setLoading(false);
      });
  };

  return (
    <div>
      <h1>Holiday List</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label htmlFor="holiday-select">Select a holiday:</label>
        <select
          id="holiday-select"
          value={selectedHoliday}
          onChange={(e) => setSelectedHoliday(e.target.value)}
        >
          <option value="">Choose a holiday</option>
          {holidays.map((holiday) => (
            <option key={holiday.date} value={holiday.date}>
              {holiday.name} - {holiday.date}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!selectedHoliday || loading}>
          {loading ? "Saving..." : "Calculate"}
        </button>
      </form>

      <h2>Lookup History</h2>
      {history.length === 0 ? (
        <p>No history available.</p>
      ) : (
        <ul>
          {history.map((item) => (
            <li key={item.id}>
              {item.holiday_name} ({item.holiday_date}) - {item.days_until} days until
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
