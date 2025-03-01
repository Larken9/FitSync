import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./MyClients.css"; // Ensure you create this CSS file for styling

function MyClients() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Check that the current user is a Personal Trainer
  useEffect(() => {
    const checkRole = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate("/login");
        return;
      }
      const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role !== "PersonalTrainer") {
          // If the logged in user is not a Personal Trainer, redirect (or show an error)
          navigate("/"); // Adjust as needed
        }
      } else {
        navigate("/login");
      }
    };

    checkRole();
  }, [navigate]);

  // Fetch clients assigned to the personal trainer
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        // Query users where "assignedTrainer" equals currentUser.uid
        const q = query(
          collection(db, "users"),
          where("assignedTrainer", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const clientList = [];
        querySnapshot.forEach((doc) => {
          clientList.push({ id: doc.id, ...doc.data() });
        });
        setClients(clientList);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
      setLoading(false);
    };

    fetchClients();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter clients by first name, last name, or email
  const filteredClients = clients.filter((client) => {
    const q = searchQuery.toLowerCase();
    return (
      (client.firstName && client.firstName.toLowerCase().includes(q)) ||
      (client.lastName && client.lastName.toLowerCase().includes(q)) ||
      (client.email && client.email.toLowerCase().includes(q))
    );
  });

  const handleManageClient = (clientId) => {
    navigate(`/personal-trainer/manage-client/${clientId}`);
  };

  if (loading) return <p>Loading clients...</p>;

  return (
    <div className="my-clients-container">
      <h1>My Clients</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by First Name, Last Name, Email"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      {filteredClients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <ul className="clients-list">
          {filteredClients.map((client) => (
            <li key={client.id} className="client-item">
              <div className="client-info">
                <strong>
                  {client.firstName} {client.lastName}
                </strong>
                <p>{client.email}</p>
              </div>
              <button onClick={() => handleManageClient(client.id)}>
                Manage
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyClients;
