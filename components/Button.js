import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const CustomButton = ({ style, textStyle, title, onPress, icon, iconPosition }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <View style={styles.buttonContent}>
        {icon && iconPosition === 'left' && icon}
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        {icon && iconPosition === 'right' && icon}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '80%',
    padding: 15,
    marginBottom: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default CustomButton;
