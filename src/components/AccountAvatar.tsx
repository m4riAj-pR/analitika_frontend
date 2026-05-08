import React from 'react';
import { Image } from 'react-native';

interface AccountAvatarProps {
  size?: number;
}

/**
 * Ícono de cuenta personalizado — logo símbolo de usuario Analitika.
 * Reemplaza al Ionicons "person-circle-outline" en toda la app.
 */
export default function AccountAvatar({ size = 45 }: AccountAvatarProps) {
  return (
    <Image
      source={require('../../assets/images/account_icon.png')}
      style={{ width: size, height: size, borderRadius: 50, borderColor: '#DDD6FE', borderWidth: 4, }}
      resizeMode="cover"
    />
  );
}
