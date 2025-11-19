import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface FABAction {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

interface FloatingActionButtonProps {
  onNotePress?: () => void;
  onPhotoPress?: () => void;
  onExpensePress?: () => void;
}

export default function FloatingActionButton({
  onNotePress,
  onPhotoPress,
  onExpensePress,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const actions: FABAction[] = [
    {
      id: 'note',
      icon: '📝',
      label: 'Notatka',
      onPress: onNotePress || (() => {
        (navigation as any).navigate('NoteEditor', {
          sectionId: 'electrical',
          projectId: 'default',
        });
      }),
    },
    {
      id: 'photo',
      icon: '📷',
      label: 'Zdjęcie',
      onPress: onPhotoPress || (() => {
        // Open camera or gallery
        console.log('Photo pressed');
      }),
    },
    {
      id: 'expense',
      icon: '💰',
      label: 'Wydatek',
      onPress: onExpensePress || (() => {
        (navigation as any).navigate('Costs');
      }),
    },
  ];

  useEffect(() => {
    Animated.spring(animation, {
      toValue: isExpanded ? 1 : 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, animation]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionPress = (action: FABAction) => {
    setIsExpanded(false);
    action.onPress();
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <Pressable
          style={styles.overlay}
          onPress={() => setIsExpanded(false)}
        >
          <Animated.View
            style={[
              styles.overlayBackground,
              { opacity: overlayOpacity },
            ]}
          />
        </Pressable>
      )}

      {/* FAB Container */}
      <View style={styles.container}>
        {/* Action buttons */}
        {actions.map((action, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(index + 1) * 60],
          });

          const opacity = animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          });

          const scale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          });

          return (
            <Animated.View
              key={action.id}
              style={[
                styles.actionContainer,
                {
                  transform: [{ translateY }, { scale }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionLabelContainer}
                onPress={() => handleActionPress(action)}
              >
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleActionPress(action)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB button */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={toggleExpanded}
          activeOpacity={0.8}
        >
          <Animated.Text
            style={[
              styles.mainIcon,
              { transform: [{ rotate: rotation }] },
            ]}
          >
            +
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  container: {
    position: 'absolute',
    bottom: 80, // Above bottom tab bar
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 1000,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  mainIcon: {
    fontSize: 32,
    color: colors.text.inverse,
    lineHeight: 36,
  },
  actionContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    marginLeft: spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabelContainer: {
    backgroundColor: colors.surface.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  actionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
});
