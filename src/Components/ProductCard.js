/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import {
  Addtocartaction,
  Cartget,
  removecart,
  updatecartAction,
} from '../redux/actions/UserAction';
import MyImgCompo from './MyImgCompo';
import { BASE_URL } from '../apiEndpoints/Base_Url';
import { useNavigation } from '@react-navigation/native';
import CartBar from '../Components/CartBar';
const weightList = [100, 200, 250, 400, 500, 750, 1000];

const ProductCard = ({ item }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const product = useSelector(state => state?.auth?.data?.customer_data);
  const cartData = useSelector(state => state?.product?.cart);

  const cartItem = cartData?.data?.products?.find(
    p => Number(p.item_id) === Number(item.item_id),
  );

  const totalItems = cartData?.data?.products
    ? cartData.data.products.reduce(
        (sum, item) => sum + (item.productQty || 1),
        0,
      )
    : 0;

  const totalAmount = cartData?.data?.products
    ? cartData.data.products.reduce((sum, item) => {
        return sum + (item?.new_price || item?.price || 0);
      }, 0)
    : 0;
  const quantity = cartItem?.productQty || 0;

  const [weight, setWeight] = useState(null);

  // ✅ only one dropdown per card
  const [openWeight, setOpenWeight] = useState(false);

  const selectedWeightPrice = (weight, price) => {
    if (weight) return Math.round((weight / 1000) * price);
    return price;
  };

  const originalPrice = selectedWeightPrice(weight, item?.actual_price);
  const discountedPrice = selectedWeightPrice(weight, item?.price);

  const storeData = async () => {
    const discount = Math.max(0, (originalPrice || 0) - (discountedPrice || 0));

    let body = JSON.stringify({
      item_id: item?.item_id,
      item_name: item?.item_name,
      category: item?.category,
      price: discountedPrice || 0,
      mrp: item?.actual_price || 0,
      new_price: discountedPrice || 0,
      discount: discount ?? 0,
      discountAmount: discount ?? 0,
      status: item?.status,
      saas_id: product?.saasId,
      store_id: item?.store_id,
      item_quantity: 1,
      gram: weight || 0,
      hsnCode: item?.hsn_code,
      taxRate: item?.tax_rate,
      taxCode: item?.tax_code,
      taxPercent: item?.tax_percent,
      actual_price: item?.actual_price || 0,
    });

    const res = await dispatch(
      Addtocartaction(body, product?.saasId, product?.storeId, product?.id),
    );

    if (res?.status) {
      await dispatch(Cartget(product?.saasId, product?.storeId, product?.id));
    }
  };

  const increaseQty = async () => {
     const type = item?.type?.toUpperCase();
    if (type === 'W' && !weight) {
      Alert.alert('Select weight first');
      return;
    }
    await storeData();
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
    <View style={styles.card}>
      <Pressable onPress={() => navigation.push('ItemDetails', { item })}>
        <MyImgCompo
          imageUri={`${BASE_URL}item/get-image/${item.item_id}`}
          resizeMode="cover"
          ImgCompoStyle={styles.image}
        />
      </Pressable>

      {/* ADD BUTTON */}
      {/* <View style={styles.topRow}>

  WEIGHT BUTTON
  🔥 DROPDOWN OUTSIDE
{openWeight && (
  <View style={styles.weightBox}>
    {weightList.map(w => (
      <TouchableOpacity
        key={w}
        style={styles.weightItemBox}
        onPress={() => {
          setWeight(w);
          setOpenWeight(false);
        }}
      >
        <Text style={styles.weightItem}>{w} g</Text>
      </TouchableOpacity>
    ))}
  </View>
)}
  <TouchableOpacity
    onPress={() => setOpenWeight(!openWeight)}
    activeOpacity={0.7}
  >
    <Text style={styles.weightBtn}>
      {weight ? `${weight} g` : "Wgt ⌄"}
    </Text>
  </TouchableOpacity>

  ADD BUTTON
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

</View> */}
      <View style={styles.topRow}>
       
        
        {/* ✅ TYPE BASED UI */}
        {type === 'W' ? (
          <>
            {/* DROPDOWN */}
            {openWeight && (
              <View style={styles.weightBox}>
                {weightList.map(w => (
                  <TouchableOpacity
                    key={w}
                    style={styles.weightItemBox}
                    onPress={() => {
                      setWeight(w);
                      setOpenWeight(false);
                    }}
                  >
                    <Text style={styles.weightItem}>{w} g</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* BUTTON */}
            <TouchableOpacity
              onPress={() => setOpenWeight(!openWeight)}
              activeOpacity={0.7}
            >
              <Text style={styles.weightBtn}>
                {weight ? `${weight} g` : 'Wgt ⌄'}
              </Text>
            </TouchableOpacity>
          </>
        ) : type === 'E' ? (
          /* ✅ BRAND SHOW */
          <Text style={styles.brandText}>{item?.brand || '1 unit'}</Text>
        ) : null}

        {/* ADD / QTY BUTTON */}
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

      <Text numberOfLines={2} style={styles.name}>
        {item?.item_name}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{discountedPrice}</Text>
        <Text style={styles.strike}>MRP ₹{originalPrice}</Text>
      </View>
    </View>
  );
};

export default ProductCard;
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    margin: 8,
    flex: 1,
    position: 'relative',
    overflow: 'visible',
  },

  image: {
    width: '100%',
    height: 110,
    borderRadius: 10,
  },

  addBtn: {
    position: 'absolute',
    top: 110,
    right: 10,
    backgroundColor: '#34A853',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 3,
    zIndex: 10,
  },

  addText: {
    color: '#fff',
    fontWeight: '700',
  },

  qtyContainer: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: '#34A853',
    borderRadius: 10,
    paddingHorizontal: 8,
  },

  qtyBtn: {
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 8,
  },

  qtyText: {
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },

  weight: {
    fontSize: 12,
    marginTop: 6,
  },
  weightBox: {
    position: 'absolute',
    top: 70, // 👈 adjust according to UI
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 10,
    zIndex: 999,
    paddingVertical: 6,
  },

  weightItemBox: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  weightItem: {
    fontSize: 13,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  strike: {
    fontSize: 12,
    marginLeft: 6,
    textDecorationLine: 'line-through',
    color: '#999',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },

  weightBtn: {
    fontSize: 12,
    color: '#34A853',
    fontWeight: '700',
    backgroundColor: '#E6F4EA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  addBtn: {
    backgroundColor: '#34A853',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  qtyContainer: {
    flexDirection: 'row',
    backgroundColor: '#34A853',
    borderRadius: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 12,
     color: '#34A853',
     backgroundColor: '#E6F4EA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontWeight: '600',
  },
});
