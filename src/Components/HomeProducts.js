/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MyImgCompo from './MyImgCompo';
import { BASE_URL } from '../apiEndpoints/Base_Url';
import { useSelector } from 'react-redux';

const BestSellerCategories = ({ categories, products }) => {
  const cartData = useSelector(state => state?.product?.cart);

  const totalItems = cartData?.data?.products
    ? cartData.data.products.reduce(
        (sum, item) => sum + (item.productQty || 1),
        0,
      )
    : 0;
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    const categoryProducts = products?.filter(p =>
      item?.masterCategoryName
        ?.toLowerCase()
        ?.includes(p?.category?.toLowerCase()),
    );

    if (!categoryProducts || categoryProducts.length === 0) {
      return null;
    }

    const images = categoryProducts.slice(0, 4);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('SubCategory', {
            item: item,
            category: item.masterCategoryName,
            products: products,
            categories: categories,
          })
        }
      >
        <View style={styles.grid}>
          {images.map((prod, index) => (
            <View key={index} style={styles.imgBox}>
              <MyImgCompo
                imageUri={`${BASE_URL}item/get-image/${prod.item_id}`}
                resizeMode="cover"
                ImgCompoStyle={styles.img}
              />
            </View>
          ))}

          <View style={styles.moreBox}>
            <Text style={styles.moreText}>+{categoryProducts.length}</Text>
          </View>
        </View>

        <Text style={styles.title}>{item.masterCategoryName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.heading}>Bestsellers</Text>

      <FlatList
        horizontal
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default BestSellerCategories;

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 8,
    width: 160,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  imgBox: {
    width: 65,
    height: 65,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },

  img: {
    width: '100%',
    height: '100%',
  },

  moreBox: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  moreText: {
    fontSize: 12,
    fontWeight: '600',
  },

  title: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
  },
});
