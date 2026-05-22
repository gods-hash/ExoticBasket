import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";

import Headers from "../Components/Headers";
import ProductCard from "../Components/ProductCard";
import CartBar from "../Components/CartBar";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

const SubCategory = ({ route }) => {

  const navigation = useNavigation();

  const { category, products, categories } = route?.params || {};

  const [selectedCategory,setSelectedCategory] = useState(category);

  const cartData = useSelector(state => state?.product?.cart);

  // ✅ FIXED: OUTSIDE FUNCTION
  const totalItems = cartData?.data?.products
    ? cartData.data.products.reduce(
        (sum, item) => sum + (item.productQty || 1),
        0
      )
    : 0;

  const totalAmount = cartData?.data?.products
    ? cartData.data.products.reduce((sum, item) => {
        return sum + (item?.new_price || item?.price || 0);
      }, 0)
    : 0;

  // FILTER PRODUCTS
  const filteredProducts = products?.filter(p =>
    p?.category?.toLowerCase()?.includes(selectedCategory?.toLowerCase()) ||
    selectedCategory?.toLowerCase()?.includes(p?.category?.toLowerCase())
  );

  // LEFT CATEGORY
  const renderCategory = ({item})=>{

    const name = item.masterCategoryName;
    const active = name === selectedCategory;

    return(
      <TouchableOpacity
        style={[styles.categoryItem,active && styles.activeCategory]}
        onPress={()=>setSelectedCategory(name)}
      >
        <Text style={[
          styles.categoryText,
          active && styles.activeText
        ]}>
          {name}
        </Text>
      </TouchableOpacity>
    )
  }

  return(

    <View style={styles.container}>

      <Headers title={selectedCategory} showBack />

      <View style={styles.main}>

        {/* LEFT CATEGORY */}
        <View style={styles.left}>
          <FlatList
            data={categories || []}
            renderItem={renderCategory}
            keyExtractor={(item,index)=>index.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* RIGHT PRODUCTS */}
        <View style={styles.right}>
          <FlatList
            data={filteredProducts || []}
            renderItem={({item}) => (
              <ProductCard item={item}/>
            )}
            keyExtractor={(item)=>item.item_id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }} // 🔥 IMPORTANT
          />
        </View>

      </View>

      {/* ✅ CART BAR */}
      <CartBar
        totalItems={totalItems}
        totalAmount={totalAmount}
onPress={() =>
  navigation.navigate("MainTabs", {
    screen: "Cart",
  })
}
      />

    </View>

  )

}

export default SubCategory;

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#fff",
marginTop:"10%"
},

main:{
flex:1,
flexDirection:"row"
},

left:{
width:90,
backgroundColor:"#F4F5F7"
},

categoryItem:{
padding:12,
borderBottomWidth:0.5,
borderColor:"#ddd"
},

activeCategory:{
backgroundColor:"#fff",
borderLeftWidth:3,
borderLeftColor:"#34A853"
},

categoryText:{
fontSize:12
},

activeText:{
fontWeight:"bold",
color:"#34A853"
},

right:{
flex:1
}

})