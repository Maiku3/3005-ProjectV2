// MemberProfile.js
import React, { useState, useEffect } from 'react';

const MemberProfile = () => {
  const [memberDetails, setMemberDetails] = useState([]);

  useEffect(() => {
    // Fetch member details from the backend on component mount
    const fetchMemberDetails = async () => {
      const response = await fetch('/api/memberDetails');
      const data = await response.json();
      setMemberDetails(data);
    };

    fetchMemberDetails();
  }, []);

  return (
    <div>
      <h1>Member Profile</h1>
      <div>
        {memberDetails.map((member, index) => (
          <div key={index}>
            <h2>{`${member.first_name} ${member.last_name}`}</h2>
            <p>Email: {member.email}</p>
            <p>Phone: {member.phone || 'N/A'}</p>
            <p>Address: {member.address || 'N/A'}</p>
            <p>Birthday: {member.birthday ? new Date(member.birthday).toLocaleDateString() : 'N/A'}</p>
            <p>Join Date: {new Date(member.join_date).toLocaleDateString()}</p>
            <p>Membership End Date: {member.membership_end_date ? new Date(member.membership_end_date).toLocaleDateString() : 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberProfile;