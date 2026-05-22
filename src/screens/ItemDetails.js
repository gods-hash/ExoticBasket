/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Headers from '../Components/Headers';
import MyImgCompo from '../Components/MyImgCompo';
import { BASE_URL } from '../apiEndpoints/Base_Url';
import { height, moderateScale, scale, width } from '../styles/responsiveSize';
import { useDispatch, useSelector } from 'react-redux';
import {
  Addtocartaction,
  Cartget,
  getItemDetails,
  removecart,
  updatecartAction,
} from '../redux/actions/UserAction';

import * as ActionTypes from '../redux/actionTypes';
import { useNavigation } from '@react-navigation/native';
import Units from '../Components/Units';
import { SafeAreaView } from 'react-native-safe-area-context';
import WeightSelector from '../Components/WeightSelector';
import AddToCartButton from '../Components/AddToCartButton';

const ItemDetails = ({ route }) => {
  const { item, totalOff, similarProducts } = route?.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const product = useSelector(state => state?.auth?.data?.customer_data);
  const [openWeight, setOpenWeight] = useState(false);
  const subCategoryItemsData = useSelector(
    state => state?.product?.subCategoryItemsData,
  );
  const cartData = useSelector(state => state?.product?.cart?.data);
  const cartArray = useSelector(state => state?.product.cart?.data?.products);

  const [itemStore, setItemStore] = useState({});
  const [weights, setWeights] = useState({});

  const cartState = useSelector(state => state?.product?.cart);
  const cartProducts = cartState?.data?.products || [];

  

  const totalItems = cartProducts.reduce(
    (sum, item) => sum + (item.productQty || 1),
    0,
  );

  const totalAmount = cartState?.total_invoice_amount || 0;
  const translateY = useRef(new Animated.Value(100)).current;

  const type = item?.type?.toUpperCase();

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch({
        type: ActionTypes.SUBCATEGORYITEMPAGE,
        payload: 1,
      });

      const resp = await dispatch(getItemDetails(item?.item_id));

      if (resp?.status) {
        setItemStore(resp?.data?.storeMaster);
      }
    };

    fetchData();
  }, []);

  const handleWeightChange = weight => {
    setWeights(prev => ({ ...prev, [item.item_id]: weight }));
  };

  const selectedWeight = weight => {
    if (weight) {
      const priceByWeight = (weight / 1000) * item?.price;
      return Math.round(priceByWeight);
    }
    return item?.price;
  };

 const currentWeight =
  weights[item?.item_id] ||
  (type === 'E' ? 1000 : null);
  const finalPrice = selectedWeight(currentWeight);

  const storeData = async ({ item, finalPrice, currentWeight }) => {
    let body = JSON.stringify({
      item_id: item?.item_id,
      item_name: item?.item_name,

      category: item?.category,
      description: item?.item_name,

      price: item?.price,
      mrp: item?.actual_price,
      new_price: finalPrice,

      discount: item?.discount,
      status: item?.status,

      saas_id: product?.saasId,
      store_id: product?.storeId,

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
    } else {
      Alert.alert(res?.message);
    }
  };
  const isIteminCart = cartArray?.find(
    cartItem => cartItem?.item_id === item?.item_id,
  );

  const updateCartItem = productQty => {
    dispatch(
      updatecartAction(
        productQty,
        product?.saasId,
        product?.storeId,
        product?.id,
        isIteminCart?.id,
      ),
    );
  };

  const onDelete = async item => {
    const res = await dispatch(
      removecart(
        product?.saasId,
        product?.storeId,
        product?.id,
        isIteminCart?.id,
      ),
    );

    if (res?.status) {
      await dispatch(Cartget(product?.saasId, product?.storeId, product?.id));
    } else {
      Alert.alert('Something went wrong');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          style={{ flex: 1, transform: [{ translateY }] }}
        >
          {/* PRODUCT IMAGE */}

          <MyImgCompo
            imageUri={`${BASE_URL}item/get-image/${item.item_id}`}
            resizeMode={'cover'}
            ImgCompoStyle={{
              height: height / 3,
              width: width,
            }}
            otherComponents={
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                style={{
                  position: 'absolute',
                  top: 50,
                  left: 16,

                  height: 40,
                  width: 40,
                  borderRadius: 20,

                  justifyContent: 'center',
                  alignItems: 'center',

                  backgroundColor: '#fff',

                  // 🔥 Shadow (iOS)
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,

                  // 🔥 Shadow (Android)
                  elevation: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: '#000',
                    fontWeight: '600',
                  }}
                >
                  ←
                </Text>
              </TouchableOpacity>
            }
          />

          {/* MAIN CARD */}

          <View style={styles.mainCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Freshly Harvested Today</Text>
            </View>

            <Text style={styles.title}>{item?.item_name}</Text>

            <Text style={styles.rating}>⭐ 4.8 (124 Reviews)</Text>
          </View>

          {/* PRICE */}

          <View style={styles.priceCard}>
            <View>
              <Text style={styles.price}>₹{finalPrice}</Text>
              <Text style={styles.mrp}>₹{item?.actual_price}</Text>
            </View>

            <View style={styles.offBadge}>
              <Text style={{ color: '#fff' }}>{totalOff} OFF</Text>
            </View>
          </View>

          {/* WEIGHT */}
          {/* <View style={{ paddingHorizontal: 16, gap: 40 }}>
            <View style={styles.rowBetween}>
              <View
                style={[
                  styles.weightBox,
                  { height: 50, justifyContent: 'center' },
                ]}
              >
                <WeightSelector
                  selectedWeight={weights[item.item_id] || 1000}
                  isOpen={openWeight}
                  onToggle={() => setOpenWeight(!openWeight)}
                  onSelect={w => {
                    handleWeightChange(w);
                    setOpenWeight(false); // 👈 auto close
                  }}
                />
              </View>

              RIGHT → Counter
              <View style={styles.qtyBoxNew}>
                <AddToCartButton
                  quantity={isIteminCart?.productQty || 0}
                  currentWeight={currentWeight}
                  onIncrease={() => {
                    if (isIteminCart) {
                      updateCartItem((isIteminCart.productQty || 1) + 1);
                    } else {
                      storeData({ item, finalPrice, currentWeight });
                    }
                  }}
                  onDecrease={() => {
                    if (isIteminCart?.productQty > 1) {
                      updateCartItem(isIteminCart.productQty - 1);
                    } else {
                      onDelete(item);
                    }
                  }}
                />
              </View>
            </View>
          </View> */}
          <View style={{ paddingHorizontal: 16, gap: 40 }}>
  <View style={styles.rowBetween}>
    
    {/* LEFT SIDE */}
    <View
      style={[
        styles.weightBox,
        { height: 50, justifyContent: 'center' },
      ]}
    >
      {type === 'W' ? (
        // ✅ WEIGHT SELECTOR
        <WeightSelector
          selectedWeight={weights[item.item_id] || 1000}
          isOpen={openWeight}
          onToggle={() => setOpenWeight(!openWeight)}
          onSelect={w => {
            handleWeightChange(w);
            setOpenWeight(false);
          }}
        />
      ) : type === 'E' ? (
        // ✅ BRAND SHOW
        <Text
          style={{
            fontSize: 12,
           color: '#34A853',
                 backgroundColor: '#E6F4EA',
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 6,
            fontWeight: '600',
          }}
        >
          {item?.brand || 'No Brand'}
        </Text>
      ) : null}
    </View>

    {/* RIGHT SIDE → CART BUTTON */}
    <View style={styles.qtyBoxNew}>
      <AddToCartButton
        quantity={isIteminCart?.productQty || 0}
        currentWeight={currentWeight}
        onIncrease={() => {
          // 👉 For W type → weight required
          if (type === 'W' && !currentWeight) {
            Alert.alert('Select Weight');
            return;
          }

          if (isIteminCart) {
            updateCartItem((isIteminCart.productQty || 1) + 1);
          } else {
            storeData({
              item,
              finalPrice,
              currentWeight: type === 'W' ? currentWeight : 1000, // 👈 fix
            });
          }
        }}
        onDecrease={() => {
          if (isIteminCart?.productQty > 1) {
            updateCartItem(isIteminCart.productQty - 1);
          } else {
            onDelete(item);
          }
        }}
      />
    </View>

  </View>
</View>
          {/* FARM INFO */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Farm Freshness Information</Text>

            <Text style={styles.description}>
              Grown without synthetic pesticides. Our tomatoes are picked at
              peak freshness.
            </Text>
          </View>

          {/* HARVEST */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Harvest Details</Text>

            <View style={styles.harvestRow}>
              <Text style={{ color: '#999' }}>Harvest Date</Text>

              <Text>Oct 24, 2023</Text>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            {console.log('SIMILAR DATA', subCategoryItemsData)}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Similar Products</Text>

              <Text style={{ color: '#22C55E' }}>See All</Text>
            </View>

            <FlatList
              data={(similarProducts || []).slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                const originalPrice = item?.actual_price ?? 0;
                const discountedPrice = item?.price ?? 0;

                const discountPercent = originalPrice
                  ? Math.round(
                      ((originalPrice - discountedPrice) / originalPrice) * 100,
                    )
                  : 0;

                return (
                  <View style={styles.similarCard}>
                    <TouchableOpacity
                      onPress={() => navigation.push('ItemDetails', { item })}
                    >
                      <MyImgCompo
                        imageUri={`${BASE_URL}item/get-image/${item.item_id}`}
                        resizeMode="cover"
                        ImgCompoStyle={styles.similarImg}
                      />

                      {/* UNIT BADGE */}

                      <View style={styles.unitBadge}>
                        <Text style={styles.unitText}>
                          {item?.unit || '1 pc'}
                        </Text>
                      </View>

                      {/* ADD BUTTON */}

                      <TouchableOpacity
                        onPress={() =>
                          storeData({
                            item,
                            currentWeight: 1000,
                            finalPrice: item.price,
                          })
                        }
                        style={styles.addBtn}
                      >
                        <Text style={styles.addText}>ADD</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>

                    <Text numberOfLines={2} style={styles.similarTitle}>
                      {item?.item_name}
                    </Text>

                    <View style={styles.timeRow}>
                      <Text style={styles.time}>⏱ 12 MINS</Text>
                    </View>

                    <View style={styles.discountRow}>
                      <Text style={styles.discount}>
                        {discountPercent}% OFF
                      </Text>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.price}>₹{discountedPrice}</Text>

                      <Text style={styles.strike}>MRP ₹{originalPrice}</Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </Animated.ScrollView>

        {/* BOTTOM CART */}

        <View style={styles.cartBar}>
          {/* <View style={styles.qtyBox}>
            <TouchableOpacity
              onPress={() => {
                if (isIteminCart?.productQty > 1) {
                  updateCartItem(isIteminCart.productQty - 1);
                } else {
                  onDelete(item);
                }
              }}
            >
              <Text style={{ fontSize: 20 }}>-</Text>
            </TouchableOpacity>

            <Text style={{ marginHorizontal: 10 }}>
              {isIteminCart?.productQty || 1}
            </Text>

            <TouchableOpacity
              onPress={() =>
                updateCartItem((isIteminCart?.productQty || 1) + 1)
              }
            >
              <Text style={{ fontSize: 20 }}>+</Text>
            </TouchableOpacity>
          </View> */}

          {/* <TouchableOpacity
            onPress={() => storeData({ item, finalPrice, currentWeight })}
            style={styles.addCartBtn}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>
              Add to Cart
            </Text>
          </TouchableOpacity> */}
        </View>
        {totalAmount > 0 && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'Cart',
              })
            }
            style={styles.greenCartBar}
          >
            <View>
              <Text style={styles.cartItems}>{totalItems} ITEMS</Text>

              <Text style={styles.cartPrice}>₹{totalAmount}</Text>
            </View>

            <Text style={styles.viewCart}>View Cart ›</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: '#fff',
    marginTop: -20,
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 16,
  },

  badge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  badgeText: {
    color: '#16A34A',
    fontWeight: '600',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
  },

  rating: {
    marginTop: 6,
    color: '#777',
  },

  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E6F4EA',
    margin: 12,
    padding: 16,
    borderRadius: 16,
  },

  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  mrp: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  offBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  description: {
    marginTop: 10,
    color: '#666',
  },

  weightBox: {
    // borderWidth: 2,
    // borderColor: '#16A34A',
    borderRadius: 20,
    height: 40,
    width: 100,

    padding: 6,
    marginTop: 10,
  },

  harvestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },

  similarCard: {
    backgroundColor: '#fff',
    width: 120,
    margin: 10,
    padding: 10,
    borderRadius: 12,
    elevation: 3,
  },

  similarImg: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },

  similarTitle: {
    fontSize: 12,
    marginTop: 6,
  },

  similarPrice: {
    fontWeight: 'bold',
    marginTop: 4,
  },

  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',

    borderTopWidth: 1,
    borderColor: '#eee',
  },

  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 8,
    // left: 30,
    borderRadius: 10,
  },

  addCartBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    justifyContent: 'flex-end',
    left: '60%',
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

  strike: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#999',
  },
  greenCartBar: {
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
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // 👈 important
    marginTop: 10,
  },
  qtyBoxNew: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  qtyNumber: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});
