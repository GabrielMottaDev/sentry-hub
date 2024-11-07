import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useSession } from '@/contexts/SessionProvider';

const PlayerData: React.FC = () => {
  const { sessionId, hasLogin: isLoggedIn } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/'); // Redirect to login if not logged in
    } else {
      fetchPlayerData();
    }
  }, [isLoggedIn]);

  const fetchPlayerData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/player', {
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      console.log(response.data); // Log player data
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };

  return (
    <View>
      <Text>Fetching player data...</Text>
    </View>
  );
};

export default PlayerData;
