import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const CartBar = ({ totalItems, totalAmount, onPress }) => {
  if (totalItems === 0) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.cartBar}>
      
      <View>
        <Text style={styles.cartItems}>
          {totalItems} ITEMS
        </Text>

        <Text style={styles.cartPrice}>
          ₹{totalAmount}
        </Text>
      </View>

      <Text style={styles.viewCart}>
        View Cart ›
      </Text>

    </TouchableOpacity>
  );
};

export default CartBar;

const styles = StyleSheet.create({
  cartBar:{
    position:"absolute",
    bottom:50,
    left:16,
    right:16,
    backgroundColor:"#34A853",
    paddingVertical:16,
    paddingHorizontal:20,
    borderRadius:20,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    elevation:10
  },

  cartItems:{
    color:"#fff",
    fontSize:12
  },

  cartPrice:{
    color:"#fff",
    fontSize:16,
    fontWeight:"bold"
  },

  viewCart:{
    color:"#fff",
    fontSize:16,
    fontWeight:"bold"
  },
});