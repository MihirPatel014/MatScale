import React from 'react';
import { useWebHaptics } from "web-haptics/react";

/**
 * Haptic component wraps any interactive element and adds haptic feedback
 * to its onClick event.
 * 
 * @example
 * <Haptic type="success">
 *   <button onClick={() => console.log('Saved!')}>Save</button>
 * </Haptic>
 */
interface HapticProps {
  children: React.ReactElement;
  type?: 'success' | 'nudge' | 'error' | 'buzz' | number;
}

export const Haptic: React.FC<HapticProps> = ({ children, type = 'nudge' }) => {
  const { trigger } = useWebHaptics();

  const handleClick = (e: React.MouseEvent<any>) => {
    // Trigger haptic feedback
    trigger(type as any);
    
    // Call original onClick if it exists
    if (children.props.onClick) {
      children.props.onClick(e);
    }
  };

  return React.cloneElement(children, {
    onClick: handleClick,
    // Ensure we capture touch events for better mobile responsiveness
    onTouchStart: (e: React.TouchEvent<any>) => {
        // Some mobile browsers respond better to onTouchStart for haptics
        // but we should be careful about double triggers with onClick
        // trigger(type as any); 
        if (children.props.onTouchStart) children.props.onTouchStart(e);
    }
  });
};

/**
 * useHaptics hook for manual triggering in custom logic
 */
export const useHaptics = () => {
  const { trigger } = useWebHaptics();
  return { trigger };
};
