import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const weightList = [100, 200, 250, 400, 500, 750, 1000];

const WeightSelector = ({
  selectedWeight,
  onSelect,
  isOpen,
  onToggle,
}) => {
  return (
    <View style={{ position: "relative", zIndex: 999 }}>

      {/* BUTTON */}
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
        <Text
          style={{
            fontSize: 12,
            color: "#34A853",
            fontWeight: "700",
            backgroundColor: "#E6F4EA",
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 6,
            alignSelf: "flex-start",
            marginTop: 4,
          }}
        >
          {selectedWeight ? `${selectedWeight} g` : "Wgt"} ⌄
        </Text>
      </TouchableOpacity>

      {/* DROPDOWN */}
      {isOpen && (
        <View
          style={{
            position: "absolute",
            top: 28,
            left: 0,
            backgroundColor: "#fff",
            borderRadius: 10,
            elevation: 10,
            zIndex: 9999,
            paddingVertical: 5,

            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          {weightList.map((w) => (
            <TouchableOpacity
              key={w}
              onPress={() => onSelect(w)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 20,
              }}
            >
              <Text style={{ fontSize: 14 }}>{w} g</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default WeightSelector;