import React from 'react';

interface TriGoChatProps {
  supabase: any; // Replace with actual Supabase type
  currentUser: any; // Replace with actual user type
  rideId: string;
  otherUser: any; // Replace with actual user type
  isAdmin: boolean;
}

const TriGoChat: React.FC<TriGoChatProps> = ({ supabase, currentUser, rideId, otherUser, isAdmin }) => {
  return (
    <div>
      {/* Chat implementation here */}
      <h2>TriGo Chat</h2>
      <p>Ride ID: {rideId}</p>
      {isAdmin && <p>Admin View</p>}
    </div>
  );
};

export default TriGoChat;
