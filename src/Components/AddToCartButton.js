import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";

const AddToCartButton = ({
  quantity,
  onIncrease,
  onDecrease,
  currentWeight,
}) => {

  const isDisabled = !currentWeight; // 👈 MAIN LOGIC

  const handleAdd = () => {
    if (isDisabled) {
      Alert.alert("Select Weight", "Please select weight first");
      return;
    }
    onIncrease();
  };

  return quantity === 0 ? (
    <TouchableOpacity
      onPress={handleAdd}
      disabled={isDisabled}
      style={[
        styles.addBtn,
        {
          opacity: isDisabled ? 0.4 : 1,          // 👈 grey effect
          borderColor: isDisabled ? "#ccc" : "#34A853"
        }
      ]}
    >
      <Text
        style={[
          styles.addText,
          { color: isDisabled ? "#aaa" : "#34A853" }
        ]}
      >
        ADD
      </Text>
    </TouchableOpacity>
  ) : (
    <View style={styles.qtyContainer}>
      <TouchableOpacity onPress={onDecrease}>
        <Text style={styles.qtyBtn}>-</Text>
      </TouchableOpacity>

      <Text style={styles.qtyText}>{quantity}</Text>

      <TouchableOpacity onPress={handleAdd} disabled={isDisabled}>
        <Text
          style={[
            styles.qtyBtn,
            { opacity: isDisabled ? 0.4 : 1 } // 👈 disable +
          ]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddToCartButton;

const styles = {
  addBtn: {
    // position: "absolute",
    // bottom: -12,
    // right: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 3,
  },
  addText: {
    fontWeight: "700",
  },
  qtyContainer: {
    position: "absolute",
    bottom: -12,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34A853",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtn: {
    color: "#fff",
    fontSize: 18,
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  qtyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    paddingHorizontal: 4,
  },
};