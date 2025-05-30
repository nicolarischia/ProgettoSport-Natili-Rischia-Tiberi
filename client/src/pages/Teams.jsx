import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teams');
        setTeams(response.data);
        setLoading(false);
      } catch (err) {
        setError('Errore nel caricamento dei team');
        setLoading(false);
        console.error("Errore API:", err);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <div className="loading">Caricamento...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="teams-container">
      <h1 className="teams-title">Team F1</h1>
      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team._id} className="team-card">
            {team.logo && (
              <img src={team.logo} alt={`${team.name} logo`} className="team-logo" />
            )}
            <h2 className="team-name">{team.name}</h2>
            <p className="team-detail">Base: <span className="team-detail-value">{team.base}</span></p>
            <p className="team-detail">Team Principal: <span className="team-detail-value">{team.teamPrincipal}</span></p>
            <p className="team-detail">Anno di fondazione: <span className="team-detail-value">{team.foundedYear}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams; 