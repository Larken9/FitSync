import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function MembershipDashboard() {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const membersList = [];
        querySnapshot.forEach((docSnap) => {
          membersList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setMembers(membersList);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
      setLoading(false);
    };

    fetchMembers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredMembers = members.filter((member) => {
    const q = searchQuery.toLowerCase();
    return (
      (member.firstName && member.firstName.toLowerCase().includes(q)) ||
      (member.lastName && member.lastName.toLowerCase().includes(q)) ||
      (member.email && member.email.toLowerCase().includes(q))
    );
  });

  if (loading) return <p>Loading members...</p>;

  return (
    <div>
      <h1>Membership Search</h1>
      <input
        type="text"
        placeholder="Search by First/Last Name or Email"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ padding: "8px", width: "50%", marginBottom: "10px" }}
      />
      {filteredMembers.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredMembers.map((member) => (
            <li
              key={member.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px",
              }}
            >
              <strong>
                {member.firstName} {member.lastName}
              </strong>
              <p>{member.email}</p>
              <p>Membership Status: {member.membershipStatus || "N/A"}</p>
              {/* Add more membership info if needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MembershipDashboard;
