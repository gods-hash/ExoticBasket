/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { scale, textScale, width } from '../styles/responsiveSize';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import {
  Addtocartaction,
  Cartget,
  ProductAction,
  removecart,
  updatecartAction,
} from '../redux/actions/UserAction';
import MyImgCompo from './MyImgCompo';
import { BASE_URL } from '../apiEndpoints/Base_Url';
import { useNavigation } from '@react-navigation/native';
import * as ActionTypes from '../redux/actionTypes';
import { moderateScale } from './Matrics';
import Units from './Units';
import HomeSliderCompo from '../Components/HomeSliderCompo';
import RollingBarCompo from './RollingBarCompo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BestSellerCategories from './HomeProducts';

const RecommendedCompo = props => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const product = useSelector(state => state?.auth?.data?.customer_data);
  const currentStore = useSelector(state => state?.auth?.data?.store_data);
  console.log('currentStore', product);
  const masterCategoryData = useSelector(
    state => state?.product?.masterCategory,
  );
  const cartData = useSelector(state => state?.product?.cart);
  const productPage = useSelector(state => state?.product?.productPage);
  const recommendedTotalPage = useSelector(
    state => state?.product?.recommendedTotalPage,
  );
  const weightList = [100, 200, 250, 400, 500, 750, 1000];

  const data = props?.productData;
  const totalItems = cartData?.data?.products
    ? cartData.data.products.reduce(
        (sum, item) => sum + (item.productQty || 1),
        0,
      )
    : 0;
  console.log('productdata--', data);
  const totalAmount = cartData?.data?.products
    ? cartData.data.products.reduce((sum, item) => {
        const weight = item?.gram || 1000;
        const price = item?.new_price || item?.price;

        return sum + price;
      }, 0)
    : 0;

  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [weights, setWeights] = useState({});
  const [openWeight, setOpenWeight] = useState(null);

  const handleWeightChange = (itemId, weight) => {
    setWeights(prev => ({
      ...prev,
      [itemId]: weight,
    }));
    setOpenWeight(null);
  };
  useEffect(() => {
    const defaultWeights = {};
    data?.forEach(item => {
      defaultWeights[item.item_id] = null;
    });
    setWeights(defaultWeights);

    setWeights(defaultWeights);
  }, [data]);

  const storeData = async ({ item, finalPrice, currentWeight }) => {
    let body = JSON.stringify({
      item_id: item?.item_id,
      item_name: item?.item_name,
      category: item?.category,
      message: 'This is an example cart item.',
      itemCode: null,
      sku: 'SKU123',
      description: item?.item_name,
      price: item?.price,
      mrp: item?.actual_price,
      new_price: finalPrice,
      discount: item?.discount,
      status: item?.status,
      department: 'no departments',
      saas_id: product?.saasId,
      store_id: item?.store_id,
      promoId: item?.promo_id,
      item_quantity: 1,
      gram: currentWeight,
      hsnCode: item?.hsn_code,
      taxRate: item?.tax_rate,
      taxCode: item?.tax_code,
      taxPercent: item?.tax_percent,
      actual_price: item?.actual_price,
    });

    const res = await dispatch(
      Addtocartaction(body, product?.saasId, product?.storeId, product?.id),
    );

    if (res?.status) {
      await dispatch(Cartget(product?.saasId, product?.storeId, product?.id));
    }
  };

  useEffect(() => {
    if (product?.saasId && product?.storeId && product?.id) {
      dispatch(Cartget(product?.saasId, product?.storeId, product?.id));
    }
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return [];

    if (activeCategory === 'all') {
      return data;
    }

    return data.filter(item =>
      item?.category?.toLowerCase()?.includes(activeCategory?.toLowerCase()),
    );
  }, [data, activeCategory]);

  const RenderItem = ({ item }) => {
    const cartItem = cartData?.data?.products?.find(
      p => Number(p.item_id) === Number(item.item_id),
    );

    const currentWeight = weights[item.item_id];
    const quantity = cartItem?.productQty || 0;

    const selectedWeightPrice = (weight, price) => {
      if (weight) {
        return Math.round((weight / 1000) * price);
      }
      return price;
    };

    const originalPrice = selectedWeightPrice(
      currentWeight,
      item?.actual_price,
    );
    const discountedPrice = selectedWeightPrice(currentWeight, item?.price);

    const discountPercent = originalPrice
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0;

    // const increaseQty = async () => {
    //   const currentWeight = weights[item.item_id];

    //   // 👉 CHECK WEIGHT
    //   if (!currentWeight) {
    //     Alert.alert('Select Weight', 'Please select weight first');
    //     return;
    //   }

    //   await storeData({
    //     item,
    //     currentWeight,
    //     finalPrice: discountedPrice,
    //   });
    // };
    const increaseQty = async () => {
      let currentWeight = weights[item.item_id];
      const type = item?.type?.toUpperCase();
      // ✅ ONLY for weight items
      if (type === 'W' && !currentWeight) {
        Alert.alert('Select Weight', 'Please select weight first');
        return;
      }

      // ✅ for brand items → default 1kg
      if (item?.type === 'E') {
        currentWeight = 1000;
      }

      await storeData({
        item,
        currentWeight,
        finalPrice: discountedPrice,
      });
    };

    const decreaseQty = async () => {
      if (quantity <= 1) {
        await dispatch(
          removecart(
            product?.saasId,
            product?.storeId,
            product?.id,
            cartItem?.id,
          ),
        );
      } else {
        await dispatch(
          updatecartAction(
            quantity - 1,
            product?.saasId,
            product?.storeId,
            product?.id,
            cartItem?.id,
          ),
        );
      }

      await dispatch(Cartget(product?.saasId, product?.storeId, product?.id));
    };

    const type = item?.type?.toUpperCase();
    return (
      <View style={styles.productCard}>
        <Pressable
          onPress={() =>
            navigation.push('ItemDetails', {
              item,
              similarProducts: data,
            })
          }
        >
          <View>
            <MyImgCompo
              imageUri={`${BASE_URL}item/get-image/${item.item_id}`}
              resizeMode="cover"
              ImgCompoStyle={styles.productImage}
            />

            {/* <View style={styles.unitBadge}>
<Text style={styles.unitText}>
{currentWeight ? `${currentWeight} g` : item?.unit || "1 pc"}
</Text>
</View> */}

            {quantity === 0 ? (
              <TouchableOpacity onPress={increaseQty} style={styles.addBtn}>
                <Text style={styles.addText}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.qtyContainer}>
                <TouchableOpacity onPress={decreaseQty}>
                  <Text style={styles.qtyBtn}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyText}>{quantity}</Text>

                <TouchableOpacity onPress={increaseQty}>
                  <Text style={styles.qtyBtn}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>

        {/* <TouchableOpacity onPress={() => setOpenWeight(item.item_id)}>
          <Text
            style={{
              fontSize: 12,
              color: currentWeight ? '#34A853' : '#34A853', // dark green
              fontWeight: '700',
              backgroundColor: '#E6F4EA', // light green bg
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 6,
              alignSelf: 'flex-start',
              marginTop: 4,
            }}
          >
            {currentWeight ? `${currentWeight} Wgt` : ' Wgt'} ⌄
          </Text>
        </TouchableOpacity>

        {openWeight === item.item_id && (
          <View
            style={{
              position: 'absolute',
              top: 20,
              left: 0,
              backgroundColor: '#fff',
              borderRadius: 10,
              elevation: 6,
              zIndex: 999,
              paddingVertical: 5,
            }}
          >
            {weightList.map(w => (
              <TouchableOpacity
                key={w}
                onPress={() => handleWeightChange(item.item_id, w)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                }}
              >
                <Text style={{ fontSize: 14 }}>{w} g</Text>
              </TouchableOpacity>
            ))}
          </View>
        )} */}
        {type === 'W' ? (
          <>
            <TouchableOpacity onPress={() => setOpenWeight(item.item_id)}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#34A853',
                  fontWeight: '700',
                  backgroundColor: '#E6F4EA',
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                  marginTop: 4,
                }}
              >
                {currentWeight ? `${currentWeight} Wgt` : ' Wgt'} ⌄
              </Text>
            </TouchableOpacity>

            {openWeight === item.item_id && (
              <View
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 0,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  elevation: 6,
                  zIndex: 999,
                  paddingVertical: 5,
                }}
              >
                {weightList.map(w => (
                  <TouchableOpacity
                    key={w}
                    onPress={() => handleWeightChange(item.item_id, w)}
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
          </>
        ) : (
          type === 'E' &&
          item?.brand && (
            <Text
              style={{
                fontSize: 12,
                color: '#34A853',
                backgroundColor: '#E6F4EA',
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 6,
                alignSelf: 'flex-start',
                marginTop: 4,
                fontWeight: '600',
              }}
            >
              {item?.brand}
            </Text>
          )
        )}

        <Text numberOfLines={2} style={styles.productName}>
          {item?.item_name}
        </Text>
        {/* 
<Text numberOfLines={2} style={styles.productName}>
{item?.item_name}
</Text> */}

        <View style={styles.timeRow}>
          <Text style={styles.time}>⏱ 12 MINS</Text>
        </View>

        <View style={styles.discountRow}>
          <Text style={styles.discount}>{discountPercent}% OFF</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{discountedPrice}</Text>

          <Text style={styles.strike}>MRP ₹{originalPrice}</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <>
        <BestSellerCategories
          categories={masterCategoryData}
          products={data}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Today's Deals</Text>

          <Text style={styles.seeAll}>See All</Text>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredData || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <RenderItem item={item} />}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
      />

      {totalItems > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartBar}
        >
          <View>
            <Text style={styles.cartItems}>{totalItems} ITEMS</Text>

            <Text style={styles.cartPrice}>₹{totalAmount}</Text>
          </View>

          <Text style={styles.viewCart}>View Cart ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RecommendedCompo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },

  deliveryLabel: {
    fontSize: 10,
    color: '#999',
  },

  deliveryTime: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#34A853',
  },

  location: {
    fontSize: 12,
    color: '#333',
  },

  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },

  searchBar: {
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 14,
  },

  categoryRow: {
    paddingHorizontal: 16,
    marginTop: 14,
  },

  categoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },

  activeCategory: {
    backgroundColor: '#34A853',
  },

  categoryText: {
    color: '#555',
  },

  activeCategoryText: {
    color: '#FFF',
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  seeAll: {
    color: '#34A853',
    fontWeight: '600',
  },

  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 10,
    margin: 8,
    width: width / 2.3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  productImage: {
    width: '100%',
    height: 110,
    borderRadius: 12,
  },

  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  strike: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#999',
  },

  addBtn: {
    backgroundColor: '#34A853',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  addText: {
    color: '#fff',
    fontWeight: '600',
  },

  cartBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#34A853',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
  },

  cartItems: {
    color: '#fff',
    fontSize: 12,
  },

  cartPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  viewCart: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unitBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },

  addBtn: {
    position: 'absolute',
    bottom: -12,
    right: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#34A853',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 3,
  },

  addText: {
    color: '#34A853',
    fontWeight: '700',
  },

  timeRow: {
    marginTop: 4,
  },

  time: {
    fontSize: 12,
    color: '#34A853',
  },

  discountRow: {
    marginTop: 4,
  },

  discount: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 12,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  qtyContainer: {
    position: 'absolute',
    bottom: -12,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34A853',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  qtyBtn: {
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 8,
    fontWeight: 'bold',
  },

  qtyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 4,
  },
});
