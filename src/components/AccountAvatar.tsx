import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

const IconamoonProfileFill = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z"
    />
  </Svg>
);

interface AccountAvatarProps {
  size?: number;
}

/**
 * Ícono de cuenta personalizado — logo símbolo de usuario Analitika.
 */
export default function AccountAvatar({ size = 45 }: AccountAvatarProps) {
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.bgBlob,
      borderColor: '#DDD6FE',
      borderWidth: 4,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <IconamoonProfileFill color={colors.primary} size={size * 0.6} />
    </View>
  );
}
